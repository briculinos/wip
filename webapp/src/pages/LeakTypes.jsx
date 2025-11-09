import { useState, useRef } from 'react';
import { AlertCircle, CheckCircle2, Info, Play, Pause } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './LeakTypes.css';

const LeakTypes = () => {
  const [playingId, setPlayingId] = useState(null);
  const audioRefs = useRef({});

  // Generate spectrogram data for 1D frequency visualization
  const generateSpectrogramData = (peakFreq, bandwidth, type) => {
    const data = [];
    for (let i = 0; i <= 80; i++) {
      const freq = i * 0.1; // 0-8 kHz
      let intensity;

      if (type === 'no-leak') {
        // Broadband low intensity
        intensity = 10 + Math.random() * 15;
      } else if (type === 'circumferential') {
        // High frequency peak
        intensity = Math.exp(-Math.pow((freq - peakFreq) / bandwidth, 2)) * 80 + Math.random() * 10;
      } else if (type === 'gasket') {
        // Lower frequency with modulation
        const mod = Math.sin(freq * 2) * 10;
        intensity = Math.exp(-Math.pow((freq - peakFreq) / bandwidth, 2)) * 60 + mod + Math.random() * 10;
      } else if (type === 'longitudinal') {
        // Sharp peak with harmonics
        const harmonic = Math.exp(-Math.pow((freq - peakFreq * 0.5) / (bandwidth * 0.5), 2)) * 30;
        intensity = Math.exp(-Math.pow((freq - peakFreq) / bandwidth, 2)) * 85 + harmonic + Math.random() * 10;
      } else if (type === 'orifice') {
        // Multiple peaks (turbulent)
        const peak1 = Math.exp(-Math.pow((freq - peakFreq) / bandwidth, 2)) * 70;
        const peak2 = Math.exp(-Math.pow((freq - (peakFreq + 0.8)) / bandwidth, 2)) * 50;
        intensity = peak1 + peak2 + Math.random() * 10;
      }

      data.push({
        freq: freq.toFixed(1),
        intensity: Math.max(0, intensity)
      });
    }
    return data;
  };

  // Generate time-frequency STFT spectrogram (Julia radar_tfr output simulation)
  const generateTimeFrequencyData = (peakFreq, bandwidth, type) => {
    const freqBins = 64; // Reduced for visualization (Julia uses 512)
    const timeBins = 40; // Number of time frames (2 seconds at ~50 frames/sec)
    const data = [];

    for (let t = 0; t < timeBins; t++) {
      const timePoint = t / timeBins * 2.0; // 2 second window

      for (let f = 0; f < freqBins; f++) {
        const freq = (f / freqBins) * 8.0; // 0-8 kHz
        let intensity;

        if (type === 'no-leak') {
          // Broadband noise, constant over time
          intensity = 15 + Math.random() * 10;
        } else if (type === 'circumferential') {
          // High-frequency crack with some time variation
          const timeMod = 1 + 0.2 * Math.sin(timePoint * Math.PI * 4);
          intensity = Math.exp(-Math.pow((freq - peakFreq) / bandwidth, 2)) * 80 * timeMod + Math.random() * 8;
        } else if (type === 'gasket') {
          // Modulated over time (intermittent pattern)
          const timeMod = 0.7 + 0.3 * Math.sin(timePoint * Math.PI * 6);
          intensity = Math.exp(-Math.pow((freq - peakFreq) / bandwidth, 2)) * 60 * timeMod + Math.random() * 10;
        } else if (type === 'longitudinal') {
          // Sharp transients with harmonics
          const timeMod = timePoint < 0.3 || (timePoint > 1.0 && timePoint < 1.3) ? 1.3 : 0.8;
          const harmonic = Math.exp(-Math.pow((freq - peakFreq * 0.5) / (bandwidth * 0.5), 2)) * 35;
          intensity = (Math.exp(-Math.pow((freq - peakFreq) / bandwidth, 2)) * 85 + harmonic) * timeMod + Math.random() * 8;
        } else if (type === 'orifice') {
          // Turbulent flow with continuous whistling
          const timeMod = 1 + 0.15 * Math.sin(timePoint * Math.PI * 8);
          const peak1 = Math.exp(-Math.pow((freq - peakFreq) / bandwidth, 2)) * 70;
          const peak2 = Math.exp(-Math.pow((freq - (peakFreq + 0.8)) / bandwidth, 2)) * 50;
          intensity = (peak1 + peak2) * timeMod + Math.random() * 10;
        }

        data.push({
          time: t,
          freq: f,
          intensity: Math.max(0, Math.min(100, intensity))
        });
      }
    }

    return { data, freqBins, timeBins };
  };

  const leakTypes = [
    {
      id: 1,
      name: "Circumferential Crack",
      image: "/Images/Circumferential Crack.jpg",
      severity: "High",
      description: "A crack that runs around the circumference of the pipe, typically caused by stress concentrations, ground movement, or aging infrastructure.",
      characteristics: [
        "Circular crack pattern around pipe",
        "Often caused by external pressure",
        "Can lead to catastrophic failure",
        "Distinctive high-frequency acoustic signature"
      ],
      frequency: "2.5-4.0 kHz dominant frequencies",
      detectability: "97.5%",
      color: "#ef4444",
      spectrogramData: generateSpectrogramData(3.2, 0.8, 'circumferential'),
      timeFrequencyData: generateTimeFrequencyData(3.2, 0.8, 'circumferential'),
      audioSample: "/audio/circumferential-crack.wav"
    },
    {
      id: 2,
      name: "Gasket Leak",
      image: "/Images/Gasket Leak.jpg",
      severity: "Medium",
      description: "Water escaping through deteriorated or improperly seated gaskets at pipe joints. Common in older systems with rubber or fiber gaskets.",
      characteristics: [
        "Occurs at pipe connections/joints",
        "Gradual onset, progressive degradation",
        "Lower pressure differential",
        "Intermittent acoustic patterns"
      ],
      frequency: "0.8-2.2 kHz with modulation",
      detectability: "96.8%",
      color: "#f59e0b",
      spectrogramData: generateSpectrogramData(1.5, 0.6, 'gasket'),
      timeFrequencyData: generateTimeFrequencyData(1.5, 0.6, 'gasket'),
      audioSample: "/audio/gasket-leak.wav"
    },
    {
      id: 3,
      name: "Longitudinal Crack",
      image: "/Images/longitudinal crack.jpeg",
      severity: "High",
      description: "A crack running along the length of the pipe, often caused by freeze-thaw cycles, internal pressure surges, or manufacturing defects.",
      characteristics: [
        "Crack parallel to pipe axis",
        "Caused by internal pressure",
        "Progressive failure pattern",
        "Sharp transient acoustic events"
      ],
      frequency: "3.0-5.5 kHz with harmonics",
      detectability: "98.2%",
      color: "#dc2626",
      spectrogramData: generateSpectrogramData(4.2, 0.5, 'longitudinal'),
      timeFrequencyData: generateTimeFrequencyData(4.2, 0.5, 'longitudinal'),
      audioSample: "/audio/longitudinal-crack.wav"
    },
    {
      id: 4,
      name: "No-leak (Baseline)",
      image: "/Images/no Leak.png",
      severity: "None",
      description: "Normal pipe operation with background noise from water flow, pumps, and ambient vibrations. Used as baseline for comparison.",
      characteristics: [
        "Steady-state flow noise",
        "Low amplitude signals",
        "Predictable frequency spectrum",
        "No anomalous patterns"
      ],
      frequency: "Broadband 0.2-8.0 kHz",
      detectability: "99.1%",
      color: "#10b981",
      spectrogramData: generateSpectrogramData(2.0, 3.0, 'no-leak'),
      timeFrequencyData: generateTimeFrequencyData(2.0, 3.0, 'no-leak'),
      audioSample: "/audio/no-leak.wav"
    },
    {
      id: 5,
      name: "Orifice Leak",
      image: "/Images/Orifice Leak.jpg",
      severity: "Medium-High",
      description: "Small hole or puncture in the pipe wall, creating a high-velocity jet. Often caused by corrosion, impact damage, or material fatigue.",
      characteristics: [
        "Small circular opening",
        "High-velocity water jet",
        "Continuous turbulent flow",
        "Distinct whistling signature"
      ],
      frequency: "1.5-3.5 kHz with strong peaks",
      detectability: "95.7%",
      color: "#f97316",
      spectrogramData: generateSpectrogramData(2.5, 0.7, 'orifice'),
      timeFrequencyData: generateTimeFrequencyData(2.5, 0.7, 'orifice'),
      audioSample: "/audio/orifice-leak.wav"
    }
  ];

  const getSeverityIcon = (severity) => {
    if (severity === "None") return <CheckCircle2 className="severity-icon safe" />;
    if (severity === "Medium") return <Info className="severity-icon medium" />;
    return <AlertCircle className="severity-icon high" />;
  };

  const handlePlayAudio = (id, audioPath) => {
    // Stop currently playing audio
    if (playingId !== null && audioRefs.current[playingId]) {
      audioRefs.current[playingId].pause();
      audioRefs.current[playingId].currentTime = 0;
    }

    // If clicking the same button, just stop
    if (playingId === id) {
      setPlayingId(null);
      return;
    }

    // Create new audio element if it doesn't exist
    if (!audioRefs.current[id]) {
      audioRefs.current[id] = new Audio(audioPath);

      // Set up event listeners
      audioRefs.current[id].addEventListener('ended', () => {
        setPlayingId(null);
      });

      audioRefs.current[id].addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        setPlayingId(null);
      });
    }

    // Play the audio
    setPlayingId(id);
    audioRefs.current[id].play().catch(err => {
      console.error('Error playing audio:', err);
      setPlayingId(null);
    });
  };

  // Heatmap visualization component
  const TimeFrequencyHeatmap = ({ tfData, color, leakName }) => {
    const { data, freqBins, timeBins } = tfData;

    // Get color for intensity value
    const getColor = (intensity) => {
      const normalized = intensity / 100;
      const r = parseInt(color.substring(1, 3), 16);
      const g = parseInt(color.substring(3, 5), 16);
      const b = parseInt(color.substring(5, 7), 16);

      // Interpolate from dark blue to the leak color
      const darkR = 20, darkG = 30, darkB = 60;
      const finalR = Math.round(darkR + (r - darkR) * normalized);
      const finalG = Math.round(darkG + (g - darkG) * normalized);
      const finalB = Math.round(darkB + (b - darkB) * normalized);

      return `rgb(${finalR}, ${finalG}, ${finalB})`;
    };

    return (
      <div className="tf-heatmap-wrapper">
        {/* Main grid with Y-axis label */}
        <div className="tf-main-container">
          <div className="tf-ylabel">Frequency (kHz)</div>

          {/* Frequency labels and heatmap grid */}
          <div className="tf-grid-container">
            {/* Frequency axis labels (left side) */}
            <div className="tf-freq-axis">
              <span>8</span>
              <span>6</span>
              <span>4</span>
              <span>2</span>
              <span>0</span>
            </div>

            {/* Heatmap grid */}
            <div className="tf-heatmap-grid">
              {Array.from({ length: freqBins }).map((_, f) => (
                <div key={f} className="tf-row">
                  {Array.from({ length: timeBins }).map((_, t) => {
                    const point = data.find(d => d.time === t && d.freq === f);
                    const intensity = point ? point.intensity : 0;
                    return (
                      <div
                        key={`${t}-${f}`}
                        className="tf-cell"
                        style={{ backgroundColor: getColor(intensity) }}
                        title={`Time: ${(t / timeBins * 2).toFixed(2)}s, Freq: ${(f / freqBins * 8).toFixed(1)} kHz, Intensity: ${intensity.toFixed(1)}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Time axis labels (bottom) */}
        <div className="tf-time-axis-container">
          <div className="tf-time-axis">
            <span>0.0</span>
            <span>0.5</span>
            <span>1.0</span>
            <span>1.5</span>
            <span>2.0</span>
          </div>
          <div className="tf-xlabel">Time (seconds)</div>
        </div>
      </div>
    );
  };

  return (
    <div className="leak-types">
      <section className="leak-types-hero">
        <h1>Water Pipe Leak Classification</h1>
        <p>
          Our AI system can identify and distinguish between 5 different leak types
          using acoustic signature analysis with 95%+ accuracy
        </p>
      </section>

      <section className="classification-overview">
        <h2 className="section-title">Classification Overview</h2>
        <div className="overview-stats">
          <div className="overview-stat">
            <div className="stat-number">5</div>
            <div className="stat-label">Leak Types</div>
          </div>
          <div className="overview-stat">
            <div className="stat-number">97.5%</div>
            <div className="stat-label">Avg. Accuracy</div>
          </div>
          <div className="overview-stat">
            <div className="stat-number">2s</div>
            <div className="stat-label">Analysis Window</div>
          </div>
          <div className="overview-stat">
            <div className="stat-number">8kHz</div>
            <div className="stat-label">Sample Rate</div>
          </div>
        </div>
      </section>

      <section className="leak-types-grid">
        {leakTypes.map((leak) => (
          <div key={leak.id} className="leak-type-card" style={{ borderTopColor: leak.color }}>
            <div className="leak-header">
              <div className="leak-title-section">
                <h3 className="leak-name">{leak.name}</h3>
                <div className="leak-severity">
                  {getSeverityIcon(leak.severity)}
                  <span style={{ color: leak.color }}>{leak.severity} Severity</span>
                </div>
              </div>
              <div className="leak-detectability">
                <div className="detectability-value" style={{ color: leak.color }}>
                  {leak.detectability}
                </div>
                <div className="detectability-label">Detection Accuracy</div>
              </div>
            </div>

            <div className="leak-card-body">
              {/* Left Side: Image, Description, and Key Characteristics */}
              <div className="leak-left-section">
                <div className="leak-image-container">
                  <img
                    src={leak.image}
                    alt={leak.name}
                    className="leak-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x250?text=' + leak.name.replace(/ /g, '+');
                    }}
                  />
                </div>
                <p className="leak-description">{leak.description}</p>

                {/* Key Characteristics */}
                <div className="leak-info-section">
                  <h4>Key Characteristics</h4>
                  <ul className="characteristics-list">
                    {leak.characteristics.map((char, idx) => (
                      <li key={idx}>{char}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Side: Spectrograms, Audio Player, and Acoustic Signature */}
              <div className="leak-right-section">

                {/* Time-Frequency STFT Spectrogram */}
                <div className="spectrogram-section">
                  <h4>Time-Frequency Response</h4>
                  <TimeFrequencyHeatmap
                    tfData={leak.timeFrequencyData}
                    color={leak.color}
                    leakName={leak.name}
                  />
                </div>

                {/* Frequency Spectrum Visualization */}
                <div className="spectrogram-section">
                  <h4>Frequency Power Spectrum</h4>
                  <div className="spectrogram-container">
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={leak.spectrogramData}>
                        <defs>
                          <linearGradient id={`gradient-${leak.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={leak.color} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={leak.color} stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="freq"
                          label={{ value: 'Frequency (kHz)', position: 'insideBottom', offset: -5 }}
                          tick={{ fontSize: 11 }}
                          interval={9}
                        />
                        <YAxis
                          label={{ value: 'Intensity', angle: -90, position: 'insideLeft' }}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip
                          contentStyle={{ background: '#fff', border: `2px solid ${leak.color}` }}
                          formatter={(value) => [`${value.toFixed(1)}`, 'Intensity']}
                          labelFormatter={(label) => `${label} kHz`}
                        />
                        <Area
                          type="monotone"
                          dataKey="intensity"
                          stroke={leak.color}
                          strokeWidth={2}
                          fill={`url(#gradient-${leak.id})`}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Audio Player */}
                <div className="audio-player-section">
                  <div className="audio-player">
                    <button
                      className="play-button"
                      onClick={() => handlePlayAudio(leak.id, leak.audioSample)}
                      style={{ backgroundColor: leak.color }}
                    >
                      {playingId === leak.id ? (
                        <><Pause size={16} /> Playing...</>
                      ) : (
                        <><Play size={16} /> Play Sound</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Acoustic Signature */}
                <div className="leak-frequency">
                  <h4>Acoustic Signature</h4>
                  <div className="frequency-badge" style={{ backgroundColor: leak.color + '20', color: leak.color }}>
                    {leak.frequency}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="detection-methodology">
        <h2 className="section-title">Detection Methodology</h2>
        <div className="methodology-grid">
          <div className="methodology-card">
            <h3>1. Acoustic Capture</h3>
            <p>
              Hydrophone sensors mounted on pipes capture acoustic vibrations at 8000 Hz,
              providing high-fidelity recordings of leak signatures.
            </p>
          </div>
          <div className="methodology-card">
            <h3>2. Hyperlet STFT Transform</h3>
            <p>
              Short-Time Fourier Transform with Hyperlet window converts time-domain signals
              into detailed time-frequency spectrograms.
            </p>
          </div>
          <div className="methodology-card">
            <h3>3. CNN Classification</h3>
            <p>
              Deep learning model analyzes spectrograms to identify unique patterns
              associated with each leak type.
            </p>
          </div>
          <div className="methodology-card">
            <h3>4. Real-time Alert</h3>
            <p>
              System provides instant classification with confidence scores,
              enabling rapid response to critical leaks.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LeakTypes;
