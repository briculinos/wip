using Plots, Measures
using FFTW
using StatsBase
using DelimitedFiles
using Mmap, NPZ

########### helper functions ############
function read_flowData(file_path::String)
    collect(Mmap.mmap(file_path, Vector{Int32}))
end

### time frequency transforms
hlt_window(L, ζ=8.0, n=0.99) = begin
    t = -(cld(L,2)-1):(cld(L,2))
    Float32.(ζ ./ (ζ .+ abs.(t).^n))
end

# =============== 3. Core helpers =========================================
"""
    radar_tfr(cube, Nwin, step, winfun)

Short-time Fourier transform along slow-time with arbitrary `winfun`.
Returns 4-D array  (Nele, Nbins, Nwin, Nframes).
"""
function radar_tfr(cube, Nwin, step, winfun)
    N, L = size(cube) # channel, delay, time
    frames   = (N - Nwin) ÷ step + 1

    w = winfun(Nwin)
    w ./= sqrt(mean(w.^2))            # unit RMS → equal noise bandwidth

    out      = Array{ComplexF32}(undef, Nwin, frames, L)

    Threads.@threads for k in 1:frames
        s  = (k-1)*step + 1
        sl = s:s+Nwin-1
        slice = @view cube[sl,:]
        slice = slice .* w
        out[:,k,:] .= fftshift(fft(slice,1),1)
    end
    return out
end

############ constants ##################
FS = 8000 # Hz for the Hydrophone sensors

#######################################

data_directory = "/Users/kaankesgin/Desktop/LucentWave/projects/WaterPipes/data/Dataset of Leak Simulations in Experimental Testbed Water Distribution System"

sensor_type  = "Hydrophone"
network_type = "Branched"

flow_rate       = "0.47" # start with the highest flow rate available

### now get the corresponding leak directory
data_path = joinpath(joinpath(data_directory, sensor_type), network_type)

## get all the files in that subfolder
data_files = [joinpath(root, f) for (root, _, fs) in walkdir(data_path) for f in fs]

## now filter the files based on the wanted flow rate, we will always pick ones with background noise, so N instead of NN in the filename
filtered_files = filter(f -> occursin(flow_rate, f) && occursin(r"N(?!N)", f), data_files)

## get the labels for the type of cracks from the file names
crack_labels = [i[end-1] for i in split.(filtered_files, "/")]

## get the actual flow data for each type of crack
flow_data    = read_flowData.(filtered_files)

min_num_samples = minimum(length.(flow_data))

## convert to a reasonable matrix with min num min_num_samples
flow_data_matrix = zeros(Float32, min_num_samples, length(flow_data))

## assign to the flow data matrix
for i in 1:length(flow_data); flow_data_matrix[:, i] .= flow_data[i][1:min_num_samples] end

# ## now we need to perform time frequency decomposition on the flow data with hlt in order to get
# ## a time frequency representation for each leak flow profile
Nwin, step, winfun = 512, 16, hlt_window

f_t_l = radar_tfr(flow_data_matrix, Nwin, step, winfun) # freq, time, labels
f_t_l = reshape(f_t_l, size(f_t_l,1), size(f_t_l,2), 2, cld(size(f_t_l,3),2))
labels = unique(crack_labels)
labels = [1:length(labels);]

npzwrite("/Users/kaankesgin/Desktop/LucentWave/projects/WaterPipes/data/pilotLeakX.npy", f_t_l)
npzwrite("/Users/kaankesgin/Desktop/LucentWave/projects/WaterPipes/data/pilotLeakY.npy", labels)

#############################################################################################


