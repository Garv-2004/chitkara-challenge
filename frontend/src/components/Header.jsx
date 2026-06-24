import React from 'react';

const Header = ({ studentInfo }) => {
  const {
    user_id = 'garvpuri_24062006',
    email_id = 'garv.puri@college.edu',
    college_roll_number = '21CS1001'
  } = studentInfo || {};

  return (
    <header className="header">
      <div className="logo-container">
        <span className="logo-icon">🔒</span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="logo-text">CYBER-TREE</span>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            HIERARCHY ANALYTICS ENGINE
          </span>
        </div>
      </div>

      <div className="student-meta">
        <div className="meta-badge">
          <span className="meta-label">Operator</span>
          <span className="meta-val">{user_id}</span>
        </div>
        <div className="meta-badge">
          <span className="meta-label">Mail Access</span>
          <span className="meta-val" style={{ textTransform: 'lowercase' }}>{email_id}</span>
        </div>
        <div className="meta-badge">
          <span className="meta-label">Roll Call</span>
          <span className="meta-val">{college_roll_number}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
