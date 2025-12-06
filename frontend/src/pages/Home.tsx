import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useScans } from '../hooks/useScans';
import { ScanForm } from '../components/ScanForm';
import { ScanGrid } from '../components/ScanGrid';
import { ScanModal } from '../components/ScanModal';
import { ScanResponse } from '../services/api';
import './Home.css';

export const Home: React.FC = () => {
  const { scans, loading, initiateScan, refreshScans } = useScans();
  const [selectedScan, setSelectedScan] = useState<ScanResponse | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleScanInitiated = () => {
    toast.success('Scan initiated successfully!', {
      position: 'top-right',
      autoClose: 3000,
    });
    refreshScans();
  };

  const handleViewResults = (scan: ScanResponse) => {
    setSelectedScan(scan);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedScan(null);
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <header className="app-header">
          <h1 className="app-title">
            <span className="title-icon">🔍</span>
            OSINT Scanner
          </h1>
          <p className="app-subtitle">
            Discover subdomains, emails, IPs, and more using theHarvester and Amass
          </p>
        </header>

        <ScanForm onScanInitiated={handleScanInitiated} />

        {loading && scans.length === 0 ? (
          <div className="loading-state">
            <div className="spinner-large"></div>
            <p>Loading scans...</p>
          </div>
        ) : (
          <ScanGrid scans={scans} onViewResults={handleViewResults} />
        )}

        <ScanModal scan={selectedScan} onClose={handleCloseModal} />
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

