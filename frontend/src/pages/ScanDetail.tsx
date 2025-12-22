import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { scanApi, ScanResponse } from '../services/api';
import { ScanModal } from '../components/ScanModal';
import './ScanDetail.css';

export const ScanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scan, setScan] = useState<ScanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchScan = async () => {
    if (!id) {
      setError('Invalid scan ID');
      setLoading(false);
      return;
    }

    try {
      if (!scan) setLoading(true);
      const data = await scanApi.getScanById(parseInt(id));
      setScan(data);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Scan not found');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load scan');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (scan?.status === 'RUNNING') {
      const interval = setInterval(fetchScan, 5000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scan?.status]);

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'COMPLETED':
        return '#27ae60';
      case 'FAILED':
        return '#e74c3c';
      case 'RUNNING':
        return '#f39c12';
      default:
        return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <div className="detail-container">
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Loading scan details...</p>
        </div>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="detail-container">
        <div className="error-state">
          <h2>Error</h2>
          <p>{error || 'Scan not found'}</p>
          <button onClick={() => navigate('/')} className="back-button">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="detail-content"
      >
        <button onClick={() => navigate('/')} className="back-button">
          ← Back to Home
        </button>

        <div className="detail-header">
          <h1>{scan.domain}</h1>
          <div
            className="status-badge-large"
            style={{ backgroundColor: getStatusColor(scan.status) }}
          >
            {scan.status}
          </div>
        </div>

        <div className="detail-info-grid">
          <div className="info-card">
            <h3>Tool Used</h3>
            <p className="info-value-large">{scan.tool}</p>
          </div>
          <div className="info-card">
            <h3>Start Time</h3>
            <p className="info-value-large">{formatDate(scan.startTime)}</p>
          </div>
          {scan.endTime && (
            <div className="info-card">
              <h3>End Time</h3>
              <p className="info-value-large">{formatDate(scan.endTime)}</p>
            </div>
          )}
          <div className="info-card">
            <h3>Status</h3>
            <p className="info-value-large">{scan.status}</p>
          </div>
        </div>

        {scan.status === 'FAILED' && scan.errorMessage && (
          <div className="error-card">
            <h3>Error Details</h3>
            <p>{scan.errorMessage}</p>
          </div>
        )}

        {scan.status === 'COMPLETED' && scan.results && (
          <div className="actions-card">
            <button
              onClick={() => setShowModal(true)}
              className="view-results-button-large"
            >
              View Results
            </button>
          </div>
        )}

        {scan.status === 'RUNNING' && (
          <div className="running-card">
            <div className="pulse-dot-large"></div>
            <p>Scan is currently running. Results will appear here when complete.</p>
          </div>
        )}
      </motion.div>

      {showModal && (
        <ScanModal scan={scan} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

