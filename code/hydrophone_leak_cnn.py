# tf_leak_detect_2sec_stratified.py
import numpy as np, matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow.keras import layers, models, regularizers
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, classification_report
from collections import Counter

# ---------------- paths ----------------
X_PATH = "/Users/kaankesgin/Desktop/LucentWave/projects/WaterPipes/data/pilotLeakX.npy"
Y_PATH = "/Users/kaankesgin/Desktop/LucentWave/projects/WaterPipes/data/pilotLeakY.npy"

# ---------------- load helpers (.npy or .npz from Julia) ----------------
def load_np_any(path):
    arr = np.load(path, allow_pickle=False)
    if isinstance(arr, np.lib.npyio.NpzFile):
        arr = arr[list(arr.files)[0]]
    return arr

X = load_np_any(X_PATH)   # shape: (F, T, S=2, L=5)
Y = load_np_any(Y_PATH)   # shape: (L,) values in [1..5]
F, T, S, L = X.shape
assert S == 2 and L == len(Y)

# ---------------- STFT params (from export) ----------------
FS, STEP, NWIN = 8000, 16, 512

def frames_for_seconds(sec):
    # K frames span samples = (K-1)*STEP + NWIN  >= sec*FS
    return int(np.floor((sec*FS - NWIN)/STEP) + 1)

# ---------------- 2 s windows with 50% overlap ----------------
CHUNK_SEC = 2.0
K = max(1, frames_for_seconds(CHUNK_SEC))   # ~969 for your data
STRIDE = max(1, K // 2)                     # 50% overlap

def make_windows(X, Y, K, stride):
    patches, ys = [], []
    for li in range(L):
        lab = int(Y[li]) - 1  # 0..4
        t0 = 0
        while t0 + K <= T:
            sl = slice(t0, t0 + K)
            patches.append(X[:, sl, :, li].astype(np.float32))  # (F,K,2)
            ys.append(lab)
            t0 += stride
    return np.stack(patches, 0), np.asarray(ys, np.int32)

Xs, ys = make_windows(X, Y, K, STRIDE)
print("Dataset:", Xs.shape, "class_counts:", Counter(ys))

# ---------------- log-magnitude compression ----------------
Xs = np.log1p(np.abs(Xs))

# ---------------- stratified splits ----------------
X_train, X_tmp, y_train, y_tmp = train_test_split(
    Xs, ys, test_size=0.30, random_state=42, stratify=ys
)
X_val, X_test, y_val, y_test = train_test_split(
    X_tmp, y_tmp, test_size=0.50, random_state=43, stratify=y_tmp
)
print("Counts:",
      "train", Counter(y_train),
      "val", Counter(y_val),
      "test", Counter(y_test))

# ---------------- train-only per-frequency/channel normalization ----------------
# Broadcast over time dimension
train_mean = X_train.mean(axis=(0, 2), keepdims=False).reshape(F, 1, 2)
train_std  = (X_train.std(axis=(0, 2), keepdims=False) + 1e-7).reshape(F, 1, 2)
def norm(z): return (z - train_mean) / train_std

X_train, X_val, X_test = norm(X_train), norm(X_val), norm(X_test)

# ---------------- oversample TRAIN to balance classes ----------------
num_classes = len(np.unique(ys))
counts = Counter(y_train); m = max(counts.values())
idx_bal = np.hstack([
    np.random.choice(np.where(y_train == c)[0], m, replace=True)
    for c in range(num_classes)
])
np.random.shuffle(idx_bal)
X_train, y_train = X_train[idx_bal], y_train[idx_bal]
print("Balanced train:", Counter(y_train))

# ---------------- light augmentation (time/freq rolls + small noise) ----------------
def augment_numpy(x, y):
    # x: (F,K,2)
    tshift = np.random.randint(-K//10, K//10 + 1)
    fshift = np.random.randint(-4, 5)
    x = np.roll(x, tshift, axis=1)  # time
    x = np.roll(x, fshift, axis=0)  # freq
    x = x + np.random.normal(0, 0.02, x.shape).astype(np.float32)
    return x.astype(np.float32), y.astype(np.int32)

def tf_augment(x, y):
    x, y = tf.numpy_function(augment_numpy, [x, y], [tf.float32, tf.int32])
    x.set_shape((F, K, 2))
    y.set_shape(())
    return x, y

# ---------------- tf.data pipelines ----------------
def make_ds(X, y, train=True, bs=16):
    ds = tf.data.Dataset.from_tensor_slices((X, y))
    if train:
        ds = ds.shuffle(len(X), reshuffle_each_iteration=True)
        ds = ds.map(tf_augment, num_parallel_calls=tf.data.AUTOTUNE)
    ds = ds.batch(bs).prefetch(tf.data.AUTOTUNE)
    return ds

ds_train = make_ds(X_train, y_train, train=True,  bs=16)
ds_val   = make_ds(X_val,   y_val,   train=False, bs=32)
ds_test  = make_ds(X_test,  y_test,  train=False, bs=32)

# ---------------- compact model ----------------
input_shape = (F, K, 2)
def make_model(input_shape, num_classes):
    reg = regularizers.l2(1e-4)
    inp = layers.Input(shape=input_shape)                      # (F,K,2)
    x = layers.AveragePooling2D(pool_size=(4,1))(inp)          # reduce freq by 4
    x = layers.DepthwiseConv2D((5,5), padding="same",
                               depth_multiplier=1,
                               depthwise_regularizer=reg)(x)
    x = layers.BatchNormalization()(x); x = layers.ReLU()(x)
    x = layers.Conv2D(16, (1,1), padding="same", kernel_regularizer=reg)(x)
    x = layers.BatchNormalization()(x); x = layers.ReLU()(x)
    x = layers.MaxPool2D((2,2))(x)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.5)(x)
    out = layers.Dense(num_classes, activation="softmax")(x)
    return models.Model(inp, out)

model = make_model(input_shape, num_classes)
model.compile(optimizer=tf.keras.optimizers.Adam(3e-4),
              loss=tf.keras.losses.SparseCategoricalCrossentropy(),
              metrics=["accuracy"])
model.summary()

callbacks = [
    tf.keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=4, verbose=0),
    tf.keras.callbacks.EarlyStopping(monitor="val_loss", patience=10, restore_best_weights=True),
]

history = model.fit(ds_train, validation_data=ds_val, epochs=1000, callbacks=callbacks, verbose=2)

# ---------------- evaluation ----------------
probs = model.predict(ds_test, verbose=0)
y_pred = probs.argmax(axis=1)

print("\nClassification report:\n")
print(classification_report(
    y_test, y_pred, digits=3,
    target_names=["Circumferential Crack","Gasket Leak","Longitudinal Crack","No-leak","Orifice Leak"]
))

# ---------------- confusion matrix ----------------
names = ["Circumferential Crack","Gasket Leak","Longitudinal Crack","No-leak","Orifice Leak"]
cm = confusion_matrix(y_test, y_pred, labels=range(num_classes))
cmn = cm / cm.sum(axis=1, keepdims=True).clip(min=1)
plt.figure(figsize=(7,6))
plt.imshow(cmn, aspect="auto", cmap="viridis")
plt.title("Confusion Matrix (normalized)")
plt.xlabel("Predicted"); plt.ylabel("True")
plt.colorbar()
ticks = np.arange(num_classes)
plt.xticks(ticks, names, rotation=35, ha="right"); plt.yticks(ticks, names)
for i in range(num_classes):
    for j in range(num_classes):
        v = cmn[i, j]
        plt.text(j, i, f"{v:.2f}", ha="center", va="center",
                 color="white" if v > 0.5 else "black", fontsize=8)
plt.tight_layout(); plt.show()