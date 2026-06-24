const { validateEdge } = require('../utils/validator');

/**
 * Processes a raw array of edge strings and parses them into hierarchies,
 * detecting invalid entries, duplicate edges, cycles, resolving diamond cases,
 * and generating a structural summary of the results.
 * 
 * @param {string[]} rawData - Array of raw string entries (e.g. ["A->B", "A->C"])
 * @returns {object} - Processed hierarchical result containing hierarchies, invalid_entries, duplicate_edges, and summary
 */
const processGraph = (rawData) => {
  const invalidEntries = [];
  const duplicateEdges = [];
  
  const seenEdges = new Set();
  const cleanEdges = [];

  // 1. Filter out invalid entries and identify duplicate edges
  for (const entry of rawData) {
    const validation = validateEdge(entry);
    if (!validation.isValid) {
      invalidEntries.push(entry);
      continue;
    }

    const { parent, child, formatted } = validation;
    if (seenEdges.has(formatted)) {
      if (!duplicateEdges.includes(formatted)) {
        duplicateEdges.push(formatted);
      }
      continue;
    }

    seenEdges.add(formatted);
    cleanEdges.push({ parent, child, formatted });
  }

  // 2. Resolve multi-parent (diamond) cases: first parent wins
  const childToParent = new Map();
  const finalEdges = [];
  for (const edge of cleanEdges) {
    const { parent, child } = edge;
    if (childToParent.has(child)) {
      // Discard this edge silently (multi-parent case)
      continue;
    }
    childToParent.set(child, parent);
    finalEdges.push(edge);
  }

  // 3. Build adjacency lists for directed traversal and undirected component discovery
  const adj = new Map(); // directed adjacency: parent -> list of children
  const undirectedAdj = new Map(); // undirected adjacency for finding components
  const allNodes = new Set();

  for (const edge of finalEdges) {
    const { parent, child } = edge;
    allNodes.add(parent);
    allNodes.add(child);

    // Directed adjacency
    if (!adj.has(parent)) {
      adj.set(parent, []);
    }
    adj.get(parent).push(child);

    // Undirected adjacency
    if (!undirectedAdj.has(parent)) {
      undirectedAdj.set(parent, []);
    }
    if (!undirectedAdj.has(child)) {
      undirectedAdj.set(child, []);
    }
    undirectedAdj.get(parent).push(child);
    undirectedAdj.get(child).push(parent);
  }

  // 4. Find connected components (groups) using BFS
  const visited = new Set();
  const components = [];

  for (const node of allNodes) {
    if (!visited.has(node)) {
      const componentNodes = [];
      const queue = [node];
      visited.add(node);

      while (queue.length > 0) {
        const curr = queue.shift();
        componentNodes.push(curr);

        const neighbors = undirectedAdj.get(curr) || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
      components.push(componentNodes);
    }
  }

  /**
   * Helper to find the first appearance index of a component in the cleanEdges list.
   * This is used to sort hierarchies in the order of their appearance in the input data.
   */
  const getComponentMinIndex = (compNodes) => {
    let minIdx = Infinity;
    for (const node of compNodes) {
      const idx = cleanEdges.findIndex(e => e.parent === node || e.child === node);
      if (idx !== -1 && idx < minIdx) {
        minIdx = idx;
      }
    }
    return minIdx;
  };

  // Sort components by first appearance index
  components.sort((a, b) => getComponentMinIndex(a) - getComponentMinIndex(b));

  const hierarchies = [];
  let totalTrees = 0;
  let totalCycles = 0;
  let maxDepth = -1;
  let largestTreeRoot = '';

  // 5. Process each component
  for (const componentNodes of components) {
    // A root is a node in this component that has in-degree 0 (does not have a parent)
    const roots = componentNodes.filter(node => !childToParent.has(node));

    if (roots.length === 0) {
      // Cyclic component: pure cycle or group where all nodes have a parent
      totalCycles++;
      // Lexicographically smallest node is designated as the root
      const root = [...componentNodes].sort()[0];
      hierarchies.push({
        root,
        tree: {},
        has_cycle: true
      });
    } else {
      // Valid tree component (roots.length will be 1)
      totalTrees++;
      const root = roots[0];

      // Recursively build the tree object
      const buildTreeObj = (node) => {
        const treeObj = {};
        const children = adj.get(node) || [];
        const sortedChildren = [...children].sort();
        for (const child of sortedChildren) {
          treeObj[child] = buildTreeObj(child);
        }
        return treeObj;
      };

      // Recursively calculate the tree depth
      const getDepth = (node) => {
        const children = adj.get(node) || [];
        if (children.length === 0) {
          return 1;
        }
        let maxSubDepth = 0;
        for (const child of children) {
          maxSubDepth = Math.max(maxSubDepth, getDepth(child));
        }
        return 1 + maxSubDepth;
      };

      const treeStructure = {
        [root]: buildTreeObj(root)
      };
      const depth = getDepth(root);

      hierarchies.push({
        root,
        tree: treeStructure,
        depth
      });

      // Update largest tree details
      // Tiebreaker: larger depth, or same depth but lexicographically smaller root label
      if (depth > maxDepth) {
        maxDepth = depth;
        largestTreeRoot = root;
      } else if (depth === maxDepth) {
        if (!largestTreeRoot || root < largestTreeRoot) {
          largestTreeRoot = root;
        }
      }
    }
  }

  return {
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges: duplicateEdges,
    summary: {
      total_trees: totalTrees,
      total_cycles: totalCycles,
      largest_tree_root: largestTreeRoot || ''
    }
  };
};

module.exports = {
  processGraph
};
