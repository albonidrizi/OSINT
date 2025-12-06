import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { scanApi, ScanRequest } from '../services/api';
import './ScanForm.css';

interface ScanFormProps {
  onScanInitiated: () => void;
}

export const ScanForm: React.FC<ScanFormProps> = ({ onScanInitiated }) => {
  const [domain, setDomain] = useState('');
  const [tool, setTool] = useState<'THEHARVESTER' | 'AMASS'>('THEHARVESTER');
  const [limit, setLimit] = useState<number | undefined>(undefined);
  const [sources, setSources] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const validateDomain = (domain: string): boolean => {
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    return domainRegex.test(domain);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!domain.trim()) {
      setError('Domain is required');
      return;
    }

    if (!validateDomain(domain.trim())) {
      setError('Please enter a valid domain (e.g., example.com)');
      return;
    }

    setLoading(true);
    try {
      const request: ScanRequest = {
        domain: domain.trim(),
        tool,
        limit: limit && limit > 0 ? limit : undefined,
        sources: sources.trim() || undefined,
      };

      await scanApi.initiateScan(request);
      setDomain('');
      setLimit(undefined);
      setSources('');
      setShowForm(false);
      onScanInitiated();
    } catch (err: any) {
      setError(err.message || 'Failed to initiate scan');
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="scan-form-container"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="new-scan-button"
        >
          <span className="button-icon">+</span>
          New Scan
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="scan-form-container"
    >
      <form onSubmit={handleSubmit} className="scan-form">
        <div className="form-header">
          <h2>Initiate New Scan</h2>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="close-button"
            aria-label="Close form"
          >
            ×
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="domain">
            Domain <span className="required">*</span>
            <span className="tooltip" data-tooltip="Enter the domain to scan (e.g., example.com)">
              ℹ️
            </span>
          </label>
          <input
            id="domain"
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            required
            disabled={loading}
            className={error && !domain ? 'error' : ''}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tool">
            OSINT Tool <span className="required">*</span>
            <span className="tooltip" data-tooltip="Choose between theHarvester (email/host discovery) or Amass (subdomain enumeration)">
              ℹ️
            </span>
          </label>
          <div className="tool-toggle">
            <button
              type="button"
              onClick={() => setTool('THEHARVESTER')}
              className={`tool-button ${tool === 'THEHARVESTER' ? 'active' : ''}`}
              disabled={loading}
            >
              theHarvester
            </button>
            <button
              type="button"
              onClick={() => setTool('AMASS')}
              className={`tool-button ${tool === 'AMASS' ? 'active' : ''}`}
              disabled={loading}
            >
              Amass
            </button>
          </div>
        </div>

        {tool === 'THEHARVESTER' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="form-group"
          >
            <label htmlFor="limit">
              Limit (optional)
              <span className="tooltip" data-tooltip="Limit the number of results">
                ℹ️
              </span>
            </label>
            <input
              id="limit"
              type="number"
              value={limit || ''}
              onChange={(e) => setLimit(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="500"
              min="1"
              disabled={loading}
            />
          </motion.div>
        )}

        {tool === 'THEHARVESTER' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="form-group"
          >
            <label htmlFor="sources">
              Sources (optional)
              <span className="tooltip" data-tooltip="Comma-separated list of sources (e.g., google,bing,linkedin)">
                ℹ️
              </span>
            </label>
            <input
              id="sources"
              type="text"
              value={sources}
              onChange={(e) => setSources(e.target.value)}
              placeholder="google,bing,linkedin"
              disabled={loading}
            />
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="error-message"
          >
            {error}
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="submit-button"
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Initiating...
            </>
          ) : (
            'Start Scan'
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

