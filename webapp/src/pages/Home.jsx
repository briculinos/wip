import { ArrowRight, Radio, Cpu, BrainCircuit, CheckCircle } from 'lucide-react';
import './Home.css';

const Home = () => {
  const pipelineSteps = [
    {
      icon: <Radio size={48} />,
      title: "Raw Acoustic Data",
      description: "Hydrophone sensors capture acoustic signals from water pipes at 8000 Hz sampling rate",
      color: "#3b82f6"
    },
    {
      icon: <Cpu size={48} />,
      title: "Hyperlet Transform (our algorithm)",
      description: "Short-Time Fourier Transform with HLT window (512 samples, 16 step) converts time-domain to frequency-domain",
      color: "#8b5cf6"
    },
    {
      icon: <BrainCircuit size={48} />,
      title: "Python CNN",
      description: "Deep learning model (Depthwise Convolutions + Temporal Blocking) analyzes time-frequency spectrograms",
      color: "#ec4899"
    },
    {
      icon: <CheckCircle size={48} />,
      title: "Leak Classification",
      description: "Identifies 5 leak types: Circumferential Crack, Gasket Leak, Longitudinal Crack, No-leak, Orifice Leak",
      color: "#10b981"
    }
  ];

  return (
    <div className="home">
      <section className="hero">
        <h1 className="hero-title">LucentWave Leak Detection System</h1>
        <p className="hero-subtitle">
          Advanced acoustic leak detection using Hyperlet transform STFT and Deep Learning
        </p>
        <div className="hero-stats">
          <div className="stat">
            <div className="stat-value">95%+</div>
            <div className="stat-label">Accuracy</div>
          </div>
          <div className="stat">
            <div className="stat-value">5</div>
            <div className="stat-label">Leak Types</div>
          </div>
          <div className="stat">
            <div className="stat-value">8kHz</div>
            <div className="stat-label">Sampling Rate</div>
          </div>
        </div>
      </section>

      <section className="pipeline">
        <h2 className="section-title">Processing Pipeline</h2>
        <div className="pipeline-container">
          {pipelineSteps.map((step, index) => (
            <div key={index} className="pipeline-step-wrapper">
              <div className="pipeline-step" style={{ borderColor: step.color }}>
                <div className="step-icon" style={{ color: step.color }}>
                  {step.icon}
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
              {index < pipelineSteps.length - 1 && (
                <div className="arrow-container">
                  <ArrowRight className="pipeline-arrow" size={32} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="features">
        <h2 className="section-title">Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Hyperlet Transform Window</h3>
            <p>
              Hyperlet transform (HLT) window provides superior time-frequency
              resolution compared to standard Hamming/Hann windows, crucial for detecting
              subtle acoustic signatures of different leak types.
            </p>
          </div>
          <div className="feature-card">
            <h3>Temporal Blocking</h3>
            <p>
              Advanced train/test split prevents data leakage from overlapping windows,
              ensuring true generalization to new time periods and unseen recordings.
            </p>
          </div>
          <div className="feature-card">
            <h3>Real-time Processing</h3>
            <p>
              2-second analysis windows with 50% overlap enable continuous monitoring
              and rapid leak detection in production water distribution systems.
            </p>
          </div>
          <div className="feature-card">
            <h3>Multi-class Detection</h3>
            <p>
              Identifies and distinguishes between 5 different leak types, providing
              actionable intelligence for maintenance teams to prioritize repairs.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
