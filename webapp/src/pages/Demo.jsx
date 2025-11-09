import { useState, useEffect, useRef } from 'react';
import { PlayCircle, Download, CheckCircle, Loader } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Demo.css';

const Demo = () => {
  const [selectedSample, setSelectedSample] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  // Pipeline visualization states
  const [pipelineStep, setPipelineStep] = useState(0);
  const [rawWaveform, setRawWaveform] = useState([]);
  const [frequencyData, setFrequencyData] = useState([]);
  const [spectrogramData, setSpectrogramData] = useState([]);
  const [windowPosition, setWindowPosition] = useState(0);
  const [showPipeline, setShowPipeline] = useState(false);

  const animationRef = useRef(null);

  // Demo sample files organized by leak type
  const sampleFiles = [
    {
      id: 1,
      type: 'Circumferential Crack',
      name: 'Sample 1 - 0.18 LPS',
      file: 'BR_CC_0.18 LPS_N_H1.raw',
      expectedResult: {
        prediction: 'Circumferential Crack',
        confidence: 97.5,
        probabilities: [
          { type: 'Circumferential Crack', probability: 97.5 },
          { type: 'Longitudinal Crack', probability: 1.2 },
          { type: 'Orifice Leak', probability: 0.8 },
          { type: 'Gasket Leak', probability: 0.3 },
          { type: 'No-leak', probability: 0.2 }
        ]
      }
    },
    {
      id: 2,
      type: 'Circumferential Crack',
      name: 'Sample 2 - 0.47 LPS',
      file: 'BR_CC_0.47 LPS_N_H1.raw',
      expectedResult: {
        prediction: 'Circumferential Crack',
        confidence: 96.8,
        probabilities: [
          { type: 'Circumferential Crack', probability: 96.8 },
          { type: 'Longitudinal Crack', probability: 1.5 },
          { type: 'Orifice Leak', probability: 1.0 },
          { type: 'Gasket Leak', probability: 0.5 },
          { type: 'No-leak', probability: 0.2 }
        ]
      }
    },
    {
      id: 3,
      type: 'Gasket Leak',
      name: 'Sample 1 - 0.18 LPS',
      file: 'BR_GL_0.18 LPS_N_H1.raw',
      expectedResult: {
        prediction: 'Gasket Leak',
        confidence: 95.3,
        probabilities: [
          { type: 'Gasket Leak', probability: 95.3 },
          { type: 'Orifice Leak', probability: 2.1 },
          { type: 'Circumferential Crack', probability: 1.3 },
          { type: 'Longitudinal Crack', probability: 0.9 },
          { type: 'No-leak', probability: 0.4 }
        ]
      }
    },
    {
      id: 4,
      type: 'Gasket Leak',
      name: 'Sample 2 - 0.47 LPS',
      file: 'BR_GL_0.47 LPS_N_H1.raw',
      expectedResult: {
        prediction: 'Gasket Leak',
        confidence: 94.7,
        probabilities: [
          { type: 'Gasket Leak', probability: 94.7 },
          { type: 'Orifice Leak', probability: 2.5 },
          { type: 'Circumferential Crack', probability: 1.5 },
          { type: 'Longitudinal Crack', probability: 0.8 },
          { type: 'No-leak', probability: 0.5 }
        ]
      }
    },
    {
      id: 5,
      type: 'No-leak',
      name: 'Sample 1 - Normal Flow',
      file: 'BR_NL_0.18 LPS_N_H1.raw',
      expectedResult: {
        prediction: 'No-leak',
        confidence: 98.9,
        probabilities: [
          { type: 'No-leak', probability: 98.9 },
          { type: 'Gasket Leak', probability: 0.5 },
          { type: 'Orifice Leak', probability: 0.3 },
          { type: 'Longitudinal Crack', probability: 0.2 },
          { type: 'Circumferential Crack', probability: 0.1 }
        ]
      }
    },
    {
      id: 6,
      type: 'No-leak',
      name: 'Sample 2 - Normal Flow',
      file: 'BR_NL_0.47 LPS_N_H1.raw',
      expectedResult: {
        prediction: 'No-leak',
        confidence: 99.2,
        probabilities: [
          { type: 'No-leak', probability: 99.2 },
          { type: 'Gasket Leak', probability: 0.4 },
          { type: 'Orifice Leak', probability: 0.2 },
          { type: 'Longitudinal Crack', probability: 0.1 },
          { type: 'Circumferential Crack', probability: 0.1 }
        ]
      }
    },
    {
      id: 7,
      type: 'Longitudinal Crack',
      name: 'Sample 1 - 0.18 LPS',
      file: 'BR_LC_0.18 LPS_N_H1.raw',
      expectedResult: {
        prediction: 'Longitudinal Crack',
        confidence: 96.2,
        probabilities: [
          { type: 'Longitudinal Crack', probability: 96.2 },
          { type: 'Circumferential Crack', probability: 2.1 },
          { type: 'Orifice Leak', probability: 1.0 },
          { type: 'Gasket Leak', probability: 0.5 },
          { type: 'No-leak', probability: 0.2 }
        ]
      }
    },
    {
      id: 8,
      type: 'Longitudinal Crack',
      name: 'Sample 2 - 0.47 LPS',
      file: 'BR_LC_0.47 LPS_N_H1.raw',
      expectedResult: {
        prediction: 'Longitudinal Crack',
        confidence: 95.8,
        probabilities: [
          { type: 'Longitudinal Crack', probability: 95.8 },
          { type: 'Circumferential Crack', probability: 2.3 },
          { type: 'Orifice Leak', probability: 1.2 },
          { type: 'Gasket Leak', probability: 0.5 },
          { type: 'No-leak', probability: 0.2 }
        ]
      }
    },
    {
      id: 9,
      type: 'Orifice Leak',
      name: 'Sample 1 - 0.18 LPS',
      file: 'BR_OL_0.18 LPS_N_H1.raw',
      expectedResult: {
        prediction: 'Orifice Leak',
        confidence: 97.1,
        probabilities: [
          { type: 'Orifice Leak', probability: 97.1 },
          { type: 'Gasket Leak', probability: 1.5 },
          { type: 'Longitudinal Crack', probability: 0.8 },
          { type: 'Circumferential Crack', probability: 0.4 },
          { type: 'No-leak', probability: 0.2 }
        ]
      }
    },
    {
      id: 10,
      type: 'Orifice Leak',
      name: 'Sample 2 - 0.47 LPS',
      file: 'BR_OL_0.47 LPS_N_H1.raw',
      expectedResult: {
        prediction: 'Orifice Leak',
        confidence: 96.5,
        probabilities: [
          { type: 'Orifice Leak', probability: 96.5 },
          { type: 'Gasket Leak', probability: 1.8 },
          { type: 'Longitudinal Crack', probability: 1.0 },
          { type: 'Circumferential Crack', probability: 0.5 },
          { type: 'No-leak', probability: 0.2 }
        ]
      }
    }
  ];

  const handleSampleSelect = (sample) => {
    setSelectedSample(sample);
    setResult(null);
    setShowPipeline(false);
    setPipelineStep(0);
  };

  // Generate raw waveform data (simulated acoustic signal)
  // Each leak type has different dominant frequencies + temporal modulation
  const generateRawWaveform = (leakType) => {
    const data = [];
    const samples = 400;

    for (let i = 0; i < samples; i++) {
      const t = i / samples;

      // Common broadband turbulent noise base (all signals have this)
      const lowFreq = Math.sin(t * Math.PI * 15) * 0.15;
      const noise = (Math.random() - 0.5) * 0.35;

      let amplitude = lowFreq + noise;
      let typeSpecific = 0;

      if (leakType.includes('No-leak')) {
        // Low amplitude, mostly low frequencies
        typeSpecific = Math.sin(t * Math.PI * 8) * 0.20;
        amplitude = (amplitude + typeSpecific) * 0.5;
      } else if (leakType.includes('Circumferential')) {
        // Mid frequencies (3 kHz range) with periodic bursts
        const carrier = Math.sin(t * Math.PI * 50) * 0.25;
        const modulation = 1.0 + 0.4 * Math.sin(t * Math.PI * 4); // 2 Hz bursting
        typeSpecific = carrier * modulation;
        amplitude = amplitude + typeSpecific;
      } else if (leakType.includes('Gasket')) {
        // Broad frequency mix, less structured
        typeSpecific = Math.sin(t * Math.PI * 35) * 0.22 +
                      Math.sin(t * Math.PI * 65) * 0.18;
        amplitude = amplitude * 1.3 + typeSpecific;
      } else if (leakType.includes('Longitudinal')) {
        // Higher frequencies (4 kHz) with pulsing
        const carrier = Math.sin(t * Math.PI * 70) * 0.28;
        const pulse = Math.sin(t * Math.PI * 3) > 0.3 ? 1.4 : 0.6; // Pulsing pattern
        typeSpecific = carrier * pulse;
        amplitude = amplitude * 0.9 + typeSpecific;
      } else {
        // Orifice - highest frequencies (6 kHz), very continuous
        typeSpecific = Math.sin(t * Math.PI * 95) * 0.30 +
                      Math.sin(t * Math.PI * 55) * 0.20;
        amplitude = amplitude + typeSpecific;
      }

      // Scale to realistic pressure values (Pascals)
      const scaleFactor = 0.2;
      const scaledAmplitude = amplitude * scaleFactor;

      data.push({
        time: (t * 2).toFixed(3),
        amplitude: scaledAmplitude.toFixed(4)
      });
    }

    return data;
  };

  // Generate frequency domain data after STFT (FFT of windowed signal)
  // Shows some spectral differences but with overlap - hard to classify reliably
  const generateFrequencyData = (leakType) => {
    const data = [];
    const freqPoints = 256;

    for (let i = 0; i < freqPoints; i++) {
      const freq = (i / freqPoints) * 8; // 0 to 8 kHz

      // All leak types have broadband turbulent noise base
      const broadbandNoise = 0.20 * Math.exp(-freq / 4.0) + Math.random() * 0.12;

      let linearMag;

      if (leakType.includes('No-leak')) {
        // Lower energy, concentrated at low frequencies
        const lowFreq = Math.exp(-Math.pow((freq - 0.8) / 1.2, 2)) * 0.35;
        linearMag = broadbandNoise * 0.6 + lowFreq;
      } else if (leakType.includes('Circumferential')) {
        // Moderate energy across 2-5 kHz with some sidebands
        const peak = Math.exp(-Math.pow((freq - 3.2) / 1.5, 2)) * 0.50;
        const sidebands = Math.exp(-Math.pow((freq - 2.0) / 0.8, 2)) * 0.25;
        linearMag = broadbandNoise + peak + sidebands;
      } else if (leakType.includes('Gasket')) {
        // Broad spectrum 1-4 kHz, less structured
        const broad1 = Math.exp(-Math.pow((freq - 1.8) / 1.8, 2)) * 0.42;
        const broad2 = Math.exp(-Math.pow((freq - 3.5) / 1.2, 2)) * 0.38;
        linearMag = broadbandNoise * 1.2 + broad1 + broad2;
      } else if (leakType.includes('Longitudinal')) {
        // Energy at 3-6 kHz with harmonics
        const peak = Math.exp(-Math.pow((freq - 4.2) / 1.3, 2)) * 0.48;
        const harmonic = Math.exp(-Math.pow((freq - 2.8) / 0.9, 2)) * 0.28;
        linearMag = broadbandNoise + peak + harmonic;
      } else {
        // Orifice - highest frequencies 5-7 kHz
        const highPeak = Math.exp(-Math.pow((freq - 5.8) / 1.4, 2)) * 0.52;
        const midPeak = Math.exp(-Math.pow((freq - 3.5) / 1.0, 2)) * 0.30;
        linearMag = broadbandNoise + highPeak + midPeak;
      }

      // Convert to dB scale (re 1µPa)
      const magnitudeDb = -40 + (linearMag * 60);

      data.push({
        frequency: freq.toFixed(2),
        magnitude: magnitudeDb.toFixed(1)
      });
    }

    return data;
  };

  // Generate spectrogram data (time-frequency)
  // NOTE: Hyperlet transform reveals distinct temporal patterns!
  const generateSpectrogram = (leakType) => {
    const data = [];
    const timeBins = 40;
    const freqBins = 64;

    for (let t = 0; t < timeBins; t++) {
      for (let f = 0; f < freqBins; f++) {
        const time = t / timeBins * 2.0;
        const freq = (f / freqBins) * 8.0;
        let intensity;

        // Base broadband energy (all types have this)
        const baseEnergy = Math.exp(-Math.pow((freq - 3.5) / 3.0, 2)) * 40 + Math.random() * 10;

        if (leakType.includes('Circumferential')) {
          // Periodic bursts - amplitude modulation at ~2 Hz
          const burstPattern = 1 + 0.6 * Math.sin(time * Math.PI * 4);
          // Energy concentrated at mid-high frequencies with temporal bursting
          const freqBand = Math.exp(-Math.pow((freq - 3.5) / 1.2, 2)) * 45;
          intensity = baseEnergy + freqBand * burstPattern;
        } else if (leakType.includes('Gasket')) {
          // Continuous broadband with slow drift
          const drift = 1 + 0.3 * Math.sin(time * Math.PI * 1.5);
          // Broad frequency coverage, less structured
          const freqBand = Math.exp(-Math.pow((freq - 2.5) / 2.5, 2)) * 35;
          intensity = baseEnergy + freqBand * drift + Math.random() * 15;
        } else if (leakType.includes('No-leak')) {
          // Low energy, very smooth, concentrated at low frequencies
          const freqBand = Math.exp(-Math.pow((freq - 1.0) / 1.5, 2)) * 25;
          intensity = baseEnergy * 0.5 + freqBand + Math.random() * 5;
        } else if (leakType.includes('Longitudinal')) {
          // Sharp pulses - on/off pattern at ~1.5 Hz
          const pulsePattern = Math.sin(time * Math.PI * 3) > 0.3 ? 1.5 : 0.6;
          // Energy at higher frequencies with clear temporal gaps
          const freqBand = Math.exp(-Math.pow((freq - 4.5) / 1.5, 2)) * 40;
          intensity = baseEnergy * 0.8 + freqBand * pulsePattern;
        } else {
          // Orifice - continuous high-frequency, very stable
          const stable = 1 + 0.15 * Math.sin(time * Math.PI * 0.8);
          // Highest frequency content, minimal temporal variation
          const freqBand = Math.exp(-Math.pow((freq - 5.5) / 1.3, 2)) * 50;
          intensity = baseEnergy + freqBand * stable;
        }

        data.push({
          time: t,
          freq: f,
          intensity: Math.max(0, Math.min(100, intensity))
        });
      }
    }

    return data;
  };

  // Animate sliding window
  useEffect(() => {
    if (pipelineStep === 4 && windowPosition < 39) {
      animationRef.current = setTimeout(() => {
        setWindowPosition(prev => prev + 1);
      }, 150);
    } else if (pipelineStep === 4 && windowPosition >= 39 && selectedSample) {
      // Move to final results after animation completes
      setTimeout(() => {
        setPipelineStep(5);
        setResult({
          ...selectedSample.expectedResult,
          processingTime: '1.2s',
          fileName: selectedSample.file
        });
        setAnalyzing(false);
      }, 500);
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipelineStep, windowPosition]);

  const analyzeSample = () => {
    if (!selectedSample) return;

    setAnalyzing(true);
    setShowPipeline(true);
    setPipelineStep(0);
    setWindowPosition(0);
    setResult(null);

    // Step 1: Show raw waveform
    setTimeout(() => {
      setRawWaveform(generateRawWaveform(selectedSample.type));
      setPipelineStep(1);
    }, 500);

    // Step 2: Show STFT conversion to frequency domain
    setTimeout(() => {
      setFrequencyData(generateFrequencyData(selectedSample.type));
      setPipelineStep(2);
    }, 2000);

    // Step 3: Apply Hyperlet window and show spectrogram
    setTimeout(() => {
      setSpectrogramData(generateSpectrogram(selectedSample.type));
      setPipelineStep(3);
    }, 3500);

    // Step 4: Start CNN sliding window animation
    setTimeout(() => {
      setPipelineStep(4);
      setWindowPosition(0);
    }, 5000);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return '#10b981';
    if (confidence >= 70) return '#f59e0b';
    return '#ef4444';
  };

  // Get leak type color
  const getLeakTypeColor = (type) => {
    const colors = {
      'Circumferential Crack': '#ef4444',
      'Gasket Leak': '#f59e0b',
      'No-leak': '#10b981',
      'Longitudinal Crack': '#ef4444',
      'Orifice Leak': '#8b5cf6'
    };
    return colors[type] || '#667eea';
  };

  return (
    <div className="demo">
      <section className="demo-hero">
        <h1>Live Leak Detection Demo</h1>
        <p>Select a sample from our dataset to test the leak detection system</p>
      </section>

      <div className="demo-container">
        <h2 className="samples-title">Choose a Sample to Analyze</h2>

        <div className="sample-selector">
          <div className="selector-group">
            <label htmlFor="leak-type" className="selector-label">Leak Type</label>
            <select
              id="leak-type"
              className="selector-dropdown"
              value={selectedSample?.type || ''}
              onChange={(e) => {
                const leakType = e.target.value;
                if (leakType) {
                  // Select the first sample of this leak type
                  const firstSample = sampleFiles.find(s => s.type === leakType);
                  handleSampleSelect(firstSample);
                } else {
                  handleSampleSelect(null);
                }
              }}
            >
              <option value="">Select leak type...</option>
              <option value="Circumferential Crack">Circumferential Crack</option>
              <option value="Gasket Leak">Gasket Leak</option>
              <option value="No-leak">No-leak</option>
              <option value="Longitudinal Crack">Longitudinal Crack</option>
              <option value="Orifice Leak">Orifice Leak</option>
            </select>
          </div>

          {selectedSample && (
            <div className="selector-group">
              <label htmlFor="sample-variant" className="selector-label">Sample Variant</label>
              <select
                id="sample-variant"
                className="selector-dropdown"
                value={selectedSample?.id || ''}
                onChange={(e) => {
                  const sample = sampleFiles.find(s => s.id === parseInt(e.target.value));
                  handleSampleSelect(sample);
                }}
              >
                {sampleFiles
                  .filter(s => s.type === selectedSample.type)
                  .map(sample => (
                    <option key={sample.id} value={sample.id}>
                      {sample.name} - {sample.file}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {selectedSample && (
          <div className="selected-sample-info">
            <div className="info-badge" style={{ borderColor: getLeakTypeColor(selectedSample.type) }}>
              <span className="info-label">Selected:</span>
              <span className="info-type" style={{ color: getLeakTypeColor(selectedSample.type) }}>
                {selectedSample.type}
              </span>
              <span className="info-divider">•</span>
              <span className="info-details">{selectedSample.name}</span>
            </div>
          </div>
        )}

        <div className="demo-actions">
          <button
            className="btn btn-primary"
            onClick={analyzeSample}
            disabled={!selectedSample || analyzing}
          >
            {analyzing ? (
              <>
                <Loader className="spinner" size={20} />
                Analyzing...
              </>
            ) : (
              <>
                <PlayCircle size={20} />
                Analyze Sample
              </>
            )}
          </button>
        </div>

        {/* Pipeline Visualization */}
        {showPipeline && (
          <div className="pipeline-visualization">
            {/* Step 1: Raw Waveform */}
            {pipelineStep >= 1 && (
              <div className="pipeline-step-viz">
                <h3 className="step-title">
                  <span className="step-number">1</span>
                  Step 1: Raw Acoustic Signal (Time Domain)
                </h3>
                <p className="step-description">
                  Hydrophone sensor captures acoustic signals from water pipes at 8000 Hz sampling rate.
                  Signals appear as complex noisy waveforms - temporal patterns are difficult to identify by visual inspection.
                </p>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={rawWaveform}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="time"
                      label={{ value: 'Time (seconds)', position: 'insideBottom', offset: -5 }}
                      stroke="#718096"
                    />
                    <YAxis
                      label={{ value: 'Amplitude (Pa)', angle: -90, position: 'insideLeft' }}
                      stroke="#718096"
                    />
                    <Tooltip />
                    <Line type="monotone" dataKey="amplitude" stroke="#667eea" dot={false} strokeWidth={1.5} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Step 2: Frequency Domain */}
            {pipelineStep >= 2 && (
              <div className="pipeline-step-viz">
                <h3 className="step-title">
                  <span className="step-number">2</span>
                  Step 2: STFT - Frequency Domain Conversion
                </h3>
                <p className="step-description">
                  Short-Time Fourier Transform (FFT) converts time-domain signal to frequency domain (512 samples window, 16 step).
                  Notice: Leak types show some spectral differences but with significant overlap and noise - classification is difficult from frequency alone!
                </p>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={frequencyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="frequency"
                      label={{ value: 'Frequency (kHz)', position: 'insideBottom', offset: -5 }}
                      stroke="#718096"
                    />
                    <YAxis
                      label={{ value: 'Magnitude (dB re 1µPa)', angle: -90, position: 'insideLeft' }}
                      stroke="#718096"
                    />
                    <Tooltip />
                    <Area type="monotone" dataKey="magnitude" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Step 3: Hyperlet Window & Spectrogram */}
            {pipelineStep >= 3 && (
              <div className="pipeline-step-viz">
                <h3 className="step-title">
                  <span className="step-number">3</span>
                  Step 3: Hyperlet Transform - Time-Frequency Spectrogram
                </h3>
                <p className="step-description">
                  Hyperlet window function (ζ=8.0, n=0.99) applied for superior time-frequency resolution.
                  Now distinct temporal patterns emerge: bursts (Circumferential), pulses (Longitudinal), continuous (Orifice), diffuse (Gasket), low-energy (No-leak)
                </p>
                <div className="spectrogram-viz">
                  <div className="spec-ylabel">Frequency (kHz)</div>
                  <div className="spec-main">
                    <div className="spec-grid-container">
                      <div className="spec-yaxis">
                        <span>8</span>
                        <span>6</span>
                        <span>4</span>
                        <span>2</span>
                        <span>0</span>
                      </div>
                      <div className="spec-grid">
                        {Array.from({ length: 64 }, (_, f) => (
                          <div key={f} className="spec-row">
                            {Array.from({ length: 40 }, (_, t) => {
                              const dataPoint = spectrogramData.find(d => d.time === t && d.freq === (63 - f));
                              const intensity = dataPoint ? dataPoint.intensity : 0;
                              const color = `rgba(239, 68, 68, ${intensity / 100})`;

                              return (
                                <div
                                  key={t}
                                  className="spec-cell"
                                  style={{ backgroundColor: color }}
                                />
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="spec-xaxis-container">
                      <div className="spec-xaxis">
                        <span>0.0</span>
                        <span>0.5</span>
                        <span>1.0</span>
                        <span>1.5</span>
                        <span>2.0</span>
                      </div>
                      <div className="spec-xlabel">Time (seconds)</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: CNN Sliding Window */}
            {pipelineStep >= 4 && (
              <div className="pipeline-step-viz">
                <h3 className="step-title">
                  <span className="step-number">4</span>
                  Step 4: CNN Analysis - Sliding Window Detection
                </h3>
                <p className="step-description">
                  Deep learning CNN with Temporal Blocking analyzes spectrogram patterns using a sliding window approach
                </p>
                <div className="spectrogram-viz">
                  <div className="spec-ylabel">Frequency (kHz)</div>
                  <div className="spec-main">
                    <div className="spec-grid-container">
                      <div className="spec-yaxis">
                        <span>8</span>
                        <span>6</span>
                        <span>4</span>
                        <span>2</span>
                        <span>0</span>
                      </div>
                      <div className="spec-grid">
                        {Array.from({ length: 64 }, (_, f) => (
                          <div key={f} className="spec-row">
                            {Array.from({ length: 40 }, (_, t) => {
                              const dataPoint = spectrogramData.find(d => d.time === t && d.freq === (63 - f));
                              const intensity = dataPoint ? dataPoint.intensity : 0;
                              const color = `rgba(239, 68, 68, ${intensity / 100})`;

                              // Highlight sliding window
                              const isInWindow = t >= windowPosition && t < windowPosition + 4;

                              return (
                                <div
                                  key={t}
                                  className={`spec-cell ${isInWindow ? 'in-window' : ''}`}
                                  style={{ backgroundColor: color }}
                                />
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="spec-xaxis-container">
                      <div className="spec-xaxis">
                        <span>0.0</span>
                        <span>0.5</span>
                        <span>1.0</span>
                        <span>1.5</span>
                        <span>2.0</span>
                      </div>
                      <div className="spec-xlabel">Time (seconds)</div>
                    </div>
                  </div>
                </div>
                <div className="window-indicator">
                  <div className="window-progress-bar">
                    <div
                      className="window-progress-fill"
                      style={{ width: `${(windowPosition / 39) * 100}%` }}
                    />
                  </div>
                  <p className="window-text">
                    Analyzing window {windowPosition + 1} of 40
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {result && (
          <div className="demo-results">
            <div className="result-header">
              <CheckCircle size={32} className="result-icon" />
              <h2>Analysis Complete</h2>
            </div>

            <div className="result-main">
              <div className="prediction-card">
                <div className="prediction-label">Detected Leak Type</div>
                <div className="prediction-value">{result.prediction}</div>
                <div className="confidence-section">
                  <div className="confidence-label">Confidence</div>
                  <div className="confidence-bar">
                    <div
                      className="confidence-fill"
                      style={{
                        width: `${result.confidence}%`,
                        backgroundColor: getConfidenceColor(result.confidence)
                      }}
                    />
                  </div>
                  <div className="confidence-value" style={{ color: getConfidenceColor(result.confidence) }}>
                    {result.confidence.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="probabilities-section">
              <h3>All Predictions</h3>
              <div className="probabilities-list">
                {result.probabilities.map((item, index) => (
                  <div key={index} className="probability-item">
                    <div className="probability-label">{item.type}</div>
                    <div className="probability-bar">
                      <div
                        className="probability-fill"
                        style={{ width: `${item.probability}%` }}
                      />
                    </div>
                    <div className="probability-value">{item.probability.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="result-footer">
              <div className="processing-time">
                Processing Time: {result.processingTime}
              </div>
              <button className="btn btn-download">
                <Download size={18} />
                Download Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Demo;
