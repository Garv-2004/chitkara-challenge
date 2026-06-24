import React from 'react';

const JsonViewer = ({ data }) => {
  if (!data) {
    return (
      <div className="panel-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
          No data payload received.
        </p>
      </div>
    );
  }

  // Syntax highlighting for JSON
  const highlightJson = (obj) => {
    let json = JSON.stringify(obj, null, 2);
    // Escape HTML characters
    json = json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Regex match to wrap keys, strings, numbers, booleans and nulls in formatted spans
    const highlighted = json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = 'json-number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'json-key';
            // Clean up the key label inside the quotes for custom formatting if desired
            return `<span class="${cls}">${match}</span>`;
          } else {
            cls = 'json-string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'json-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );

    return highlighted;
  };

  const rawHtml = highlightJson(data);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    alert('Copied response JSON payload to clipboard!');
  };

  return (
    <div className="panel-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="panel-title" style={{ margin: 0 }}>📦 RAW JSON RESPONSE</h2>
        <button
          className="tab-btn"
          onClick={copyToClipboard}
          style={{ fontSize: '0.7rem', padding: '0.25rem 0.75rem', border: '1px solid var(--border-color)' }}
        >
          COPY PAYLOAD
        </button>
      </div>
      
      <div className="json-container">
        <pre className="json-code">
          <code dangerouslySetInnerHTML={{ __html: rawHtml }} />
        </pre>
      </div>
    </div>
  );
};

export default JsonViewer;
