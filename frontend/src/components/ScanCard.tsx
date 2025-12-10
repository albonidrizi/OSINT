import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ScanResponse } from '../services/api';
import './ScanCard.css';

interface ScanCardProps {
  scan: ScanResponse;
  onViewResults: (scan: ScanResponse) => void;
}

export const ScanCard: React.FC<ScanCardProps> = ({ scan, onViewResults }) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'COMPLETED':
        return '#10b981'; // Emerald 500
      case 'FAILED':
        return '#ef4444'; // Red 500
      case 'RUNNING':
        return '#f59e0b'; // Amber 500
      default:
        return '#64748b'; // Slate 500
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'COMPLETED':
        return '✓';
      case 'FAILED':
        return '✗';
      case 'RUNNING':
        return '⟳';
      default:
        return '○';
    }
  };

  const hasResults = scan.status === 'COMPLETED' && scan.results;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.15)' }}
      className="scan-card"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="card-header">
        <div className="domain-section">
          <h3 className="domain-name">{scan.domain}</h3>
          <span className="tool-badge">{scan.tool}</span>
        </div>
        <div
          className="status-badge"
          style={{ backgroundColor: getStatusColor(scan.status) }}
        >
          <span className="status-icon">{getStatusIcon(scan.status)}</span>
          {scan.status}
        </div>
      </div>

      <div className="card-body">
        <div className="info-row">
          <span className="info-label">Start Time:</span>
          <span className="info-value">{formatDate(scan.startTime)}</span>
        </div>
        {scan.endTime && (
          <div className="info-row">
            <span className="info-label">End Time:</span>
            <span className="info-value">{formatDate(scan.endTime)}</span>
          </div>
        )}
        {scan.status === 'RUNNING' && (
          <div className="running-indicator">
            <div className="pulse-dot"></div>
            <span>Scan in progress...</span>
          </div>
        )}
        {scan.status === 'FAILED' && scan.errorMessage && (
          <div className="error-display">
            <strong>Error:</strong> {scan.errorMessage}
          </div>
        )}
      </div>

      <div className="card-footer">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/scan/${scan.id}`);
          }}
          className="view-details-button"
        >
          View Details
        </button>
        {hasResults && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewResults(scan);
            }}
            className="view-results-button"
          >
            View Results
          </button>
        )}
      </div>
    </motion.div>
  );
};

