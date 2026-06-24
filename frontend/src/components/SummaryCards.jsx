import React from 'react';

const SummaryCards = ({ summary }) => {
  const {
    total_trees = 0,
    total_cycles = 0,
    largest_tree_root = 'N/A'
  } = summary || {};

  return (
    <div className="summary-container">
      {/* Total Trees Card */}
      <div className="metric-card">
        <div className="metric-header">
          <span className="metric-title">Total Trees</span>
          <span className="metric-badge badge-green">VERIFIED</span>
        </div>
        <div className="metric-value" style={{ color: 'var(--accent-green)' }}>
          {total_trees}
        </div>
        <div className="metric-footer">Non-cyclic directed structures</div>
      </div>

      {/* Total Cycles Card */}
      <div className="metric-card">
        <div className="metric-header">
          <span className="metric-title">Detected Cycles</span>
          <span className="metric-badge badge-magenta">ALERT</span>
        </div>
        <div className="metric-value" style={{ color: 'var(--accent-magenta)' }}>
          {total_cycles}
        </div>
        <div className="metric-footer">Cyclic graph components isolated</div>
      </div>

      {/* Largest Tree Root Card */}
      <div className="metric-card">
        <div className="metric-header">
          <span className="metric-title">Largest Tree Root</span>
          <span className="metric-badge badge-cyan">DOMINANT</span>
        </div>
        <div className="metric-value" style={{ color: 'var(--accent-cyan)' }}>
          {largest_tree_root || 'N/A'}
        </div>
        <div className="metric-footer">Deepest tree hierarchy root label</div>
      </div>
    </div>
  );
};

export default SummaryCards;
