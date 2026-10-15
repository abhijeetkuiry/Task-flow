import React from 'react';
import { Database, RefreshCw, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function Header({ dbStatus, isRefreshing, onRefresh }) {
  const isConnected = dbStatus?.status === 'ok';
  const isChecking = dbStatus === null;

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-logo-wrap">
          <div className="brand-icon-gradient">
            <Sparkles className="brand-icon" size={24} />
          </div>
        </div>
        <div>
          <div className="brand-title-row">
            <h1 className="brand-title">TaskFlow</h1>
            <span className="brand-version-badge">Atlas Edition</span>
          </div>
          <p className="brand-subtitle">
            Intelligent Task & Workflow Manager • Real-time MongoDB Cloud
          </p>
        </div>
      </div>

      <div className="header-actions">
        <div
          className={`atlas-status-badge ${
            isChecking ? 'checking' : isConnected ? 'connected' : 'disconnected'
          }`}
          title={dbStatus?.message || (isConnected ? 'MongoDB Atlas is active & responsive' : 'Database connection error')}
        >
          <span className="status-dot"></span>
          <Database size={15} className="status-db-icon" />
          <span className="status-text">
            {isChecking
              ? 'Checking Atlas...'
              : isConnected
              ? 'MongoDB Atlas Live'
              : 'Atlas Disconnected'}
          </span>
          {isConnected && <CheckCircle2 size={14} className="status-check-icon" />}
          {!isConnected && !isChecking && <AlertCircle size={14} className="status-alert-icon" />}
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="header-refresh-btn"
          title="Re-sync tasks with MongoDB Atlas"
          id="btn-sync-atlas"
        >
          <RefreshCw size={16} className={`refresh-icon ${isRefreshing ? 'spinning' : ''}`} />
          <span className="refresh-label">Sync</span>
        </button>
      </div>
    </header>
  );
}
