import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { ScanDetail } from './pages/ScanDetail';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scan/:id" element={<ScanDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

