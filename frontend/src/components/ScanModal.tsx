import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanResponse } from '../services/api';
import './ScanModal.css';

interface ScanModalProps {
  scan: ScanResponse | null;
  onClose: () => void;
}

interface ParsedResults {
  emails?: string[];
  hosts?: string[];
  subdomains?: string[];
  ips?: string[];
  linkedin?: string[];
  raw?: string;
}

export const ScanModal: React.FC<ScanModalProps> = ({ scan, onClose }) => {
  if (!scan || !scan.results) return null;

  let parsedResults: ParsedResults = {};
  try {
    parsedResults = JSON.parse(scan.results);
  } catch (e) {
    parsedResults = { raw: scan.results };
  }

  const hasData =
    (parsedResults.emails && parsedResults.emails.length > 0) ||
    (parsedResults.hosts && parsedResults.hosts.length > 0) ||
    (parsedResults.subdomains && parsedResults.subdomains.length > 0) ||
    (parsedResults.ips && parsedResults.ips.length > 0) ||
    (parsedResults.linkedin && parsedResults.linkedin.length > 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="modal-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>Scan Results: {scan.domain}</h2>
            <button onClick={onClose} className="modal-close" aria-label="Close">
              ×
            </button>
          </div>

          <div className="modal-body">
            {!hasData ? (
              <div className="no-results">
                <p>No results found for this scan.</p>
                {parsedResults.raw && (
                  <details className="raw-output">
                    <summary>View Raw Output</summary>
                    <pre>{parsedResults.raw}</pre>
                  </details>
                )}
              </div>
            ) : (
              <div className="results-container">
                {parsedResults.emails && parsedResults.emails.length > 0 && (
                  <div className="result-section">
                    <h3>
                      <span className="section-icon">📧</span>
                      Email Addresses ({parsedResults.emails.length})
                    </h3>
                    <div className="result-list">
                      {parsedResults.emails.map((email, idx) => (
                        <div key={idx} className="result-item">
                          {email}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {parsedResults.subdomains && parsedResults.subdomains.length > 0 && (
                  <div className="result-section">
                    <h3>
                      <span className="section-icon">🌐</span>
                      Subdomains ({parsedResults.subdomains.length})
                    </h3>
                    <div className="result-list">
                      {parsedResults.subdomains.map((subdomain, idx) => (
                        <div key={idx} className="result-item">
                          {subdomain}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {parsedResults.hosts && parsedResults.hosts.length > 0 && (
                  <div className="result-section">
                    <h3>
                      <span className="section-icon">🖥️</span>
                      Hosts ({parsedResults.hosts.length})
                    </h3>
                    <div className="result-list">
                      {parsedResults.hosts.map((host, idx) => (
                        <div key={idx} className="result-item">
                          {host}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {parsedResults.ips && parsedResults.ips.length > 0 && (
                  <div className="result-section">
                    <h3>
                      <span className="section-icon">🔢</span>
                      IP Addresses ({parsedResults.ips.length})
                    </h3>
                    <div className="result-list">
                      {parsedResults.ips.map((ip, idx) => (
                        <div key={idx} className="result-item">
                          {ip}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {parsedResults.linkedin && parsedResults.linkedin.length > 0 && (
                  <div className="result-section">
                    <h3>
                      <span className="section-icon">💼</span>
                      LinkedIn Accounts ({parsedResults.linkedin.length})
                    </h3>
                    <div className="result-list">
                      {parsedResults.linkedin.map((linkedin, idx) => (
                        <div key={idx} className="result-item">
                          <a
                            href={linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="linkedin-link"
                          >
                            {linkedin}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {parsedResults.raw && (
                  <details className="raw-output">
                    <summary>View Raw Output</summary>
                    <pre>{parsedResults.raw}</pre>
                  </details>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

