import React, { useState } from 'react';

const InputForm = ({ onSubmit, isLoading, backendUrl, setBackendUrl }) => {
  const [rawJson, setRawJson] = useState(
    JSON.stringify(
      {
        data: [
          'A->B', 'A->C', 'B->D', 'C->E', 'E->F',
          'X->Y', 'Y->Z', 'Z->X',
          'P->Q', 'Q->R',
          'G->H', 'G->H', 'G->I',
          'hello', '1->2', 'A->'
        ]
      },
      null,
      2
    )
  );
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    try {
      const parsed = JSON.parse(rawJson);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Input must be a JSON object: { "data": [...] }');
      }
      if (!Array.isArray(parsed.data)) {
        throw new Error('JSON object must contain a "data" array of strings.');
      }
      // Check if all elements are strings
      for (const item of parsed.data) {
        if (typeof item !== 'string') {
          throw new Error('All elements in the "data" array must be strings (e.g. "A->B").');
        }
      }
      onSubmit(parsed);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="panel-card">
      <h2 className="panel-title">📡 SYSTEM INPUT</h2>
      <form onSubmit={handleSubmit}>
        {/* Backend URL Input */}
        <div className="input-group">
          <label className="input-label" htmlFor="backend-endpoint">Target Endpoint</label>
          <input
            id="backend-endpoint"
            type="text"
            className="url-input"
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            placeholder="http://localhost:5000"
            required
          />
        </div>

        {/* JSON Payload Input */}
        <div className="input-group">
          <label className="input-label" htmlFor="json-payload">Graph Data (JSON)</label>
          <textarea
            id="json-payload"
            className="textarea-cyber"
            value={rawJson}
            onChange={(e) => setRawJson(e.target.value)}
            spellCheck="false"
          />
        </div>

        {error && (
          <div className="error-alert" style={{ margin: '0 0 1rem 0', padding: '0.5rem 0.75rem' }}>
            ⚠️ {error}
          </div>
        )}

        <button
          type="submit"
          className="button-cyber"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="cyber-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
              ANALYZING...
            </>
          ) : (
            'EXECUTE ANALYSIS'
          )}
        </button>
      </form>

      <div style={{ marginTop: '1.25rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        <p style={{ fontWeight: '600', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>VALID EDGE FORMATS:</p>
        <ul style={{ paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <li>Must be single uppercase letters: <code style={{ color: 'var(--accent-cyan)' }}>A-Z</code></li>
          <li>Delimiter must be: <code style={{ color: 'var(--accent-cyan)' }}>-&gt;</code></li>
          <li>Self-loops <code style={{ color: 'var(--accent-magenta)' }}>A-&gt;A</code> are treated as invalid.</li>
          <li>Duplicate edges are filtered and reported.</li>
          <li>Diamond parents are silently resolved (first wins).</li>
        </ul>
      </div>
    </div>
  );
};

export default InputForm;
