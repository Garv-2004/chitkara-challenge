import React from 'react';

// Recursively layouts tree nodes and edges within a bounding box
const layoutTree = (nodeLabel, treeObj, depth = 0, xStart = 0, xEnd = 400, yStep = 70) => {
  const x = (xStart + xEnd) / 2;
  const y = 40 + depth * yStep;

  let nodes = [{ id: nodeLabel, x, y, depth }];
  let edges = [];

  const children = treeObj ? Object.keys(treeObj) : [];
  const childCount = children.length;

  if (childCount > 0) {
    const width = (xEnd - xStart) / childCount;
    children.forEach((child, index) => {
      const childXStart = xStart + index * width;
      const childXEnd = childXStart + width;
      const { nodes: childNodes, edges: childEdges } = layoutTree(
        child,
        treeObj[child],
        depth + 1,
        childXStart,
        childXEnd,
        yStep
      );
      
      nodes = [...nodes, ...childNodes];
      edges = [...edges, ...childEdges];
      // Directed edge from parent to child
      edges.push({
        from: nodeLabel,
        to: child,
        x1: x,
        y1: y,
        x2: childNodes[0].x,
        y2: childNodes[0].y
      });
    });
  }

  return { nodes, edges };
};

const TreeVisualizer = ({ hierarchies }) => {
  if (!hierarchies || hierarchies.length === 0) {
    return (
      <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '300px', justifyContent: 'center', alignItems: 'center' }}>
        <div className="tree-empty-state">
          <span className="icon-large">🔍</span>
          <span style={{ fontWeight: '500' }}>No structures processed yet</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Input edge data and run analysis to build diagrams.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="viz-panel">
      <h2 className="panel-title">🛡️ HIERARCHY MAPS</h2>
      <div className="viz-workspace">
        {hierarchies.map((h, i) => {
          const isCyclic = !!h.has_cycle;
          
          let svgNodes = [];
          let svgEdges = [];
          let height = 300;

          if (!isCyclic && h.tree && h.tree[h.root]) {
            // Layout tree using coordinates
            const yStep = 75;
            const treeDepth = h.depth || 1;
            height = Math.max(300, treeDepth * yStep + 40);
            
            const layout = layoutTree(h.root, h.tree[h.root], 0, 0, 450, yStep);
            svgNodes = layout.nodes;
            svgEdges = layout.edges;
          }

          return (
            <div key={i} className="tree-card">
              <div className="tree-card-header">
                <span className="tree-root-label">
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ROOT:</span> {h.root}
                </span>
                <span className={`tree-tag ${isCyclic ? 'tree-tag-cyclic' : 'tree-tag-valid'}`}>
                  {isCyclic ? 'CYCLE DETECTED' : `DEPTH: ${h.depth}`}
                </span>
              </div>
              
              <div className="tree-canvas-container" style={{ height: `${height}px` }}>
                {isCyclic ? (
                  /* Cycle Rendering */
                  <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                      <svg width="90" height="90" viewBox="0 0 100 100">
                        {/* Circular animated warning border */}
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke="var(--accent-magenta)"
                          strokeWidth="2"
                          strokeDasharray="10 5"
                          style={{
                            transformOrigin: 'center',
                            animation: 'spin 8s infinite linear',
                            opacity: 0.8
                          }}
                        />
                        {/* Core cyclic node */}
                        <circle
                          cx="50"
                          cy="50"
                          r="25"
                          fill="var(--bg-surface-elevated)"
                          stroke="var(--accent-magenta)"
                          strokeWidth="3"
                          style={{ filter: 'drop-shadow(0 0 8px rgba(255, 0, 85, 0.4))' }}
                        />
                        <text
                          x="50"
                          y="53"
                          fontFamily="var(--font-mono)"
                          fontWeight="700"
                          fontSize="18"
                          fill="var(--text-primary)"
                          textAnchor="middle"
                        >
                          {h.root}
                        </text>
                      </svg>
                      {/* Alert symbol */}
                      <div style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        background: 'var(--accent-magenta)',
                        color: 'var(--bg-main)',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        boxShadow: '0 0 10px var(--accent-magenta)'
                      }}>
                        ⚠️
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-magenta)', letterSpacing: '0.5px' }}>
                        INFINITE RECURSION
                      </p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem', maxWidth: '220px' }}>
                        Group starting at Node {h.root} contains an unresolved circular path.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Standard Tree SVG Rendering */
                  <svg className="svg-tree" viewBox={`0 0 450 ${height}`}>
                    <defs>
                      <marker
                        id="arrow"
                        viewBox="0 0 10 10"
                        refX="20"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-muted)" />
                      </marker>
                    </defs>

                    {/* Render Edges */}
                    {svgEdges.map((e, idx) => (
                      <g key={`edge-${idx}`}>
                        <line
                          x1={e.x1}
                          y1={e.y1}
                          x2={e.x2}
                          y2={e.y2}
                          className="svg-edge-path"
                          markerEnd="url(#arrow)"
                        />
                      </g>
                    ))}

                    {/* Render Nodes */}
                    {svgNodes.map((n) => (
                      <g key={`node-${n.id}`}>
                        <circle
                          cx={n.x}
                          cy={n.y}
                          r="16"
                          className="svg-node-circle"
                          style={{
                            stroke: n.depth === 0 ? 'var(--accent-green)' : 'var(--accent-cyan)',
                            filter: n.depth === 0 ? 'drop-shadow(0 0 4px rgba(0,255,136,0.3))' : 'none'
                          }}
                        />
                        <text x={n.x} y={n.y} className="svg-node-text">
                          {n.id}
                        </text>
                      </g>
                    ))}
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TreeVisualizer;
