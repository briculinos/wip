# tf_leak_detect_2sec_stratified.py
import numpy as np, matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow.keras import layers, models
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, classification_report
from sklearn.utils.class_weight import compute_class_weight
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

X = load_np_any(X_PATH)   # shape: (F, T, S=2, L=5), complex STFT
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

# --- Build windows + per-window time indices
def make_windows_with_tidx(X, Y, K, stride):
    patches, ys, tstarts, groups = [], [], [], []
    F, T, S, L = X.shape
    for li in range(L):              # one recording per class
        lab = int(Y[li]) - 1
        t0 = 0
        while t0 + K <= T:
            sl = slice(t0, t0 + K)
            patches.append(X[:, sl, :, li].astype(np.complex64))
            ys.append(lab)
            tstarts.append(t0)
            groups.append(li)        # recording id (class id here)
            t0 += stride
    Xs = np.stack(patches, 0)
    ys = np.asarray(ys, np.int32)
    tstarts = np.asarray(tstarts, np.int32)
    groups = np.asarray(groups, np.int32)
    return Xs, ys, tstarts, groups

# windows for TRAIN with overlap; VAL/TEST will be re-windowed without overlap
Xs_all, ys_all, t_all, grp_all = make_windows_with_tidx(X, Y, K, STRIDE)

# --- Define per-recording blocked splits on raw frame timeline
T_total = T
left = int(0.2 * T_total)          # 20% left edge -> validation
right = int(0.8 * T_total)         # 20% right edge -> test
gap = K                             # safety gap

def which_split(t0):
    # t0 is window start frame
    tend = t0 + K
    if tend <= left - gap:          # far left
        return "val"
    if t0 >= right + gap:           # far right
        return "test"
    if (tend <= right - gap) and (t0 >= left + gap):
        return "train"              # center band
    return "drop"                   # inside safety gaps

mask_train = []
mask_val   = []
mask_test  = []
for i in range(len(Xs_all)):
    sp = which_split(t_all[i])
    mask_train.append(sp == "train")
    mask_val.append(sp == "val")
    mask_test.append(sp == "test")

mask_train = np.array(mask_train)
mask_val   = np.array(mask_val)
mask_test  = np.array(mask_test)

# keep only complex -> later take log1p(|.|)
Xs_train_c, y_train = Xs_all[mask_train], ys_all[mask_train]
Xs_val_c,   y_val   = Xs_all[mask_val],   ys_all[mask_val]
Xs_test_c,  y_test  = Xs_all[mask_test],  ys_all[mask_test]

# --- Magnitude + log compression
Xs_train = np.log1p(np.abs(Xs_train_c)).astype(np.float32)
Xs_val   = np.log1p(np.abs(Xs_val_c)).astype(np.float32)
Xs_test  = np.log1p(np.abs(Xs_test_c)).astype(np.float32)

# --- Per-frequency×channel normalization from TRAIN only
F, K, S = Xs_train.shape[1], Xs_train.shape[2], Xs_train.shape[3]
train_mean = Xs_train.mean(axis=(0, 2), keepdims=False).reshape(F, 1, S)
train_std  = (Xs_train.std(axis=(0, 2), keepdims=False) + 1e-7).reshape(F, 1, S)
def norm(z): return (z - train_mean) / train_std

X_train, X_val, X_test = norm(Xs_train), norm(Xs_val), norm(Xs_test)

print("Counts:",
      "train", Counter(y_train),
      "val", Counter(y_val),
      "test", Counter(y_test))

# --- Build eval datasets with NO augmentation, NO repeat
def make_ds(X, y, train=True, bs=16):
    ds = tf.data.Dataset.from_tensor_slices((X, y))
    if train:
        def augment_numpy(x, y):
            tshift = np.random.randint(-max(1, K//50), max(1, K//50)+1)
            x = np.roll(x, tshift, axis=1)
            # time/freq masks
            if np.random.rand() < 0.5:
                w = np.random.randint(1, max(2, K//20))
                t0 = np.random.randint(0, K - w + 1)
                x[:, t0:t0+w, :] = 0.0
            if np.random.rand() < 0.5:
                fw = np.random.randint(1, 5)
                f0 = np.random.randint(0, F - fw + 1)
                x[f0:f0+fw, :, :] = 0.0
            # light noise and per-channel gain
            gain = 1.0 + np.random.normal(0, 0.02, (1,1,S)).astype(np.float32)
            x = x * gain + np.random.normal(0, 0.003, x.shape).astype(np.float32)
            return x.astype(np.float32), np.int32(y)
        def tf_augment(x, y):
            x, y = tf.numpy_function(augment_numpy, [x, y], [tf.float32, tf.int32])
            x.set_shape((F, K, S)); y.set_shape(())
            return x, y
        ds = ds.shuffle(len(X), reshuffle_each_iteration=True)
        ds = ds.map(tf_augment, num_parallel_calls=tf.data.AUTOTUNE)
    ds = ds.batch(bs).prefetch(tf.data.AUTOTUNE)
    return ds

bs_train, bs_eval = 16, 32

ds_train = make_ds(X_train, y_train, train=True,  bs=bs_train)
ds_val   = make_ds(X_val,   y_val,   train=False, bs=bs_eval)
ds_test  = make_ds(X_test,  y_test,  train=False, bs=bs_eval)

# steps must be computed AFTER split (and no oversampling now)
steps_per_epoch  = max(1, int(np.ceil(len(X_train)/bs_train)))
validation_steps = max(1, int(np.ceil(len(X_val)/bs_eval)))
test_steps       = max(1, int(np.ceil(len(X_test)/bs_eval)))
print("sizes:", len(X_train), len(X_val), len(X_test))
print("steps:", steps_per_epoch, validation_steps, test_steps)

# ---------------- model: milder pooling, keep information ----------------
def make_model(input_shape, num_classes):
    inp = layers.Input(shape=input_shape)                 # (F,K,2)
    x = inp                                               # no early avg pool
    x = layers.DepthwiseConv2D((5,5), padding="same")(x)
    x = layers.BatchNormalization()(x); x = layers.ReLU()(x)
    x = layers.Conv2D(32, (1,1), padding="same")(x)
    x = layers.BatchNormalization()(x); x = layers.ReLU()(x)
    x = layers.MaxPool2D((2,2))(x)    # mild pooling
    x = layers.DepthwiseConv2D((3,5), padding="same")(x)
    x = layers.BatchNormalization()(x); x = layers.ReLU()(x)
    x = layers.Conv2D(48, (1,1), padding="same")(x)
    x = layers.BatchNormalization()(x); x = layers.ReLU()(x)
    x = layers.MaxPool2D((1,2))(x)    # pool mostly in time
    x = layers.Conv2D(64, (1,1), activation="relu")(x)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.3)(x)
    out = layers.Dense(5, activation="softmax")(x)  # 5 classes fixed by Y
    return models.Model(inp, out)

input_shape = (F, K, 2)
num_classes = 5
model = make_model(input_shape, num_classes)
model.compile(
    optimizer=tf.keras.optimizers.Adam(1e-3),
    loss=tf.keras.losses.SparseCategoricalCrossentropy(),
    metrics=["accuracy"]
)
model.summary()

# ---------------- callbacks ----------------
callbacks = [
    tf.keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=20, verbose=0),
    tf.keras.callbacks.EarlyStopping(monitor="val_loss", patience=100, restore_best_weights=True),
]

# ---------------- class weights (no oversampling) ----------------
cw = compute_class_weight(class_weight='balanced',
                          classes=np.arange(num_classes),
                          y=y_train)
class_weight = {i: float(cw[i]) for i in range(num_classes)}
print("class_weight:", class_weight)

# ---------------- train ----------------
history = model.fit(
    ds_train,
    validation_data=ds_val,
    steps_per_epoch=steps_per_epoch,
    validation_steps=validation_steps,
    epochs=5000,
    callbacks=callbacks,
    class_weight=class_weight,
    verbose=2
)

# ---------------- evaluation ----------------
probs = model.predict(ds_test, steps=test_steps, verbose=0)
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



