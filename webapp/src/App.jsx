import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import LeakTypes from './pages/LeakTypes';
import Demo from './pages/Demo';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-brand">
              <img src="/Images/LucentWave logo.jpg" alt="LucentWave" className="brand-logo" />
            </div>
            <div className="nav-links">
              <Link to="/" className="nav-link">Pipeline</Link>
              <Link to="/leak-types" className="nav-link">Leak Types</Link>
              <Link to="/demo" className="nav-link">Live Demo</Link>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <div className="content-wrapper">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/leak-types" element={<LeakTypes />} />
              <Route path="/demo" element={<Demo />} />
            </Routes>
          </div>
        </main>

        <footer className="footer">
          <div className="footer-container">
            <p>&copy; 2024 LucentWave - Advanced Water Pipe Leak Detection System</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
