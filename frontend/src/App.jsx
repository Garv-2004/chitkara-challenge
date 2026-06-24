import React, { useState } from 'react';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import InputForm from './components/InputForm';
import TreeVisualizer from './components/TreeVisualizer';
import JsonViewer from './components/JsonViewer';

const App = () => {
  const [backendUrl, setBackendUrl] = useState('http://localhost:5000');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('maps'); // 'maps' | 'diagnostics' | 'raw'

  const handleDataSubmit = async (payload) => {
    setIsLoading(true);
    setError(null);

    // Make sure we have the /bfhl endpoint correctly appended
    const cleanUrl = backendUrl.trim().replace(/\/+$/, '');
    const endpoint = `${cleanUrl}/bfhl`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errPayload = await res.json().catch(() => ({}));
        throw new Error(errPayload.error || errPayload.message || `HTTP Server Error: ${res.status}`);
      }

      const data = await res.json();
      setResponse(data);
      
      // Automatically focus on maps view on success
      setActiveTab('maps');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Network exception connecting to backend API.');
      setResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract student details dynamically from response, with default developer placeholders
  const studentInfo = response
    ? {
        user_id: response.user_id,
        email_id: response.email_id,
        college_roll_number: response.college_roll_number,
      }
    : null;

  return (
    <div className="app-container">
      {/* Upper Navigation & Metadata */}
      <Header studentInfo={studentInfo} />

      {/* Grid Dashboard */}
      <div className="dashboard-grid">
        {/* Left Side Panel: Inputs */}
        <InputForm
          onSubmit={handleDataSubmit}
          isLoading={isLoading}
          backendUrl={backendUrl}
          setBackendUrl={setBackendUrl}
        />

        {/* Right Side Panel: Output displays */}
        <div className="results-container">
          {error && (
            <div className="error-alert">
              <span>⚠️</span>
              <span><strong>Error:</strong> {error}</span>
            </div>
          )}

          {/* Metrics summary cards (only when response is available) */}
          {response && <SummaryCards summary={response.summary} />}

          {/* Tabs selector */}
          <div className="tabs-container">
            <button
              className={`tab-btn ${activeTab === 'maps' ? 'active' : ''}`}
              onClick={() => setActiveTab('maps')}
            >
              🌳 Visual Maps
            </button>
            <button
              className={`tab-btn ${activeTab === 'diagnostics' ? 'active' : ''}`}
              onClick={() => setActiveTab('diagnostics')}
            >
              🛠️ Diagnostics
            </button>
            <button
              className={`tab-btn ${activeTab === 'raw' ? 'active' : ''}`}
              onClick={() => setActiveTab('raw')}
            >
              📋 Raw Payload
            </button>
          </div>

          {/* Loading state placeholder */}
          {isLoading && (
            <div className="panel-card loader-container">
              <div className="cyber-spinner"></div>
              <span className="loader-text">Securing socket & analyzing structure...</span>
            </div>
          )}

          {/* Main Content Area */}
          {!isLoading && (
            <>
              {activeTab === 'maps' && (
                <TreeVisualizer hierarchies={response ? response.hierarchies : []} />
              )}

              {activeTab === 'diagnostics' && (
                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <h2 className="panel-title">🛠️ SYSTEM DIAGNOSTICS</h2>
                  
                  <div className="meta-lists-grid">
                    {/* Invalid Entries Card */}
                    <div className="meta-list-card">
                      <div className="meta-list-header">
                        <span>Invalid Format Entries</span>
                        <span style={{ color: 'var(--accent-magenta)' }}>
                          ({response ? response.invalid_entries.length : 0})
                        </span>
                      </div>
                      <div className="meta-list-items">
                        {response && response.invalid_entries.length > 0 ? (
                          response.invalid_entries.map((item, idx) => (
                            <span key={idx} className="meta-tag-item tag-red">
                              {item || '""'}
                            </span>
                          ))
                        ) : (
                          <span className="tag-empty">No invalid entries detected</span>
                        )}
                      </div>
                    </div>

                    {/* Duplicate Edges Card */}
                    <div className="meta-list-card">
                      <div className="meta-list-header">
                        <span>Duplicate Edges</span>
                        <span style={{ color: 'var(--accent-yellow)' }}>
                          ({response ? response.duplicate_edges.length : 0})
                        </span>
                      </div>
                      <div className="meta-list-items">
                        {response && response.duplicate_edges.length > 0 ? (
                          response.duplicate_edges.map((item, idx) => (
                            <span key={idx} className="meta-tag-item tag-yellow">
                              {item}
                            </span>
                          ))
                        ) : (
                          <span className="tag-empty">No duplicate edges found</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'raw' && <JsonViewer data={response} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
