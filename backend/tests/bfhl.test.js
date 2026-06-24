const request = require('supertest');
const app = require('../src/app');
const config = require('../src/config');
const { processGraph } = require('../src/services/graphService');
const { validateEdge } = require('../src/utils/validator');

describe('BFHL Utility Validator tests', () => {
  test('Should validate standard edge format (uppercase A-Z)', () => {
    expect(validateEdge('A->B')).toEqual({
      isValid: true,
      parent: 'A',
      child: 'B',
      formatted: 'A->B'
    });
  });

  test('Should trim whitespace before validating', () => {
    expect(validateEdge('  P->Q  ')).toEqual({
      isValid: true,
      parent: 'P',
      child: 'Q',
      formatted: 'P->Q'
    });
  });

  test('Should detect self-loops as invalid', () => {
    const res = validateEdge('A->A');
    expect(res.isValid).toBe(false);
    expect(res.errorReason).toBe('Self-loop');
  });

  test('Should detect lowercase or multi-character node names as invalid', () => {
    expect(validateEdge('a->B').isValid).toBe(false);
    expect(validateEdge('AB->C').isValid).toBe(false);
    expect(validateEdge('A->BC').isValid).toBe(false);
    expect(validateEdge('1->2').isValid).toBe(false);
  });

  test('Should detect missing child or parent nodes as invalid', () => {
    expect(validateEdge('A->').isValid).toBe(false);
    expect(validateEdge('->B').isValid).toBe(false);
    expect(validateEdge('hello').isValid).toBe(false);
  });
});

describe('BFHL Graph processing tests', () => {
  test('Should parse simple list into hierarchy object', () => {
    const input = ['A->B', 'A->C', 'B->D'];
    const result = processGraph(input);

    expect(result.invalid_entries).toEqual([]);
    expect(result.duplicate_edges).toEqual([]);
    expect(result.hierarchies).toHaveLength(1);

    const firstHierarchy = result.hierarchies[0];
    expect(firstHierarchy.root).toBe('A');
    expect(firstHierarchy.depth).toBe(3);
    expect(firstHierarchy.tree).toEqual({
      A: {
        B: { D: {} },
        C: {}
      }
    });

    expect(result.summary).toEqual({
      total_trees: 1,
      total_cycles: 0,
      largest_tree_root: 'A'
    });
  });

  test('Should identify duplicate edges and only use first', () => {
    const input = ['A->B', 'A->B', 'A->B', 'A->C'];
    const result = processGraph(input);

    expect(result.duplicate_edges).toEqual(['A->B']);
    expect(result.hierarchies[0].tree).toEqual({
      A: {
        B: {},
        C: {}
      }
    });
  });

  test('Should handle multi-parent diamond cases by first parent wins rule', () => {
    // A->D is first, so D's parent is A. B->D should be discarded.
    const input = ['A->D', 'B->C', 'B->D'];
    const result = processGraph(input);

    // Component 1 should contain A and D (root A).
    // Component 2 should contain B and C (root B).
    expect(result.hierarchies).toHaveLength(2);
    
    // Sort orders might vary, check by root
    const rootA = result.hierarchies.find(h => h.root === 'A');
    const rootB = result.hierarchies.find(h => h.root === 'B');

    expect(rootA).toBeDefined();
    expect(rootA.tree).toEqual({ A: { D: {} } });

    expect(rootB).toBeDefined();
    expect(rootB.tree).toEqual({ B: { C: {} } });
  });

  test('Should identify cycles and mark has_cycle: true', () => {
    const input = ['X->Y', 'Y->Z', 'Z->X'];
    const result = processGraph(input);

    expect(result.hierarchies).toHaveLength(1);
    expect(result.hierarchies[0]).toEqual({
      root: 'X', // lexicographically smallest
      tree: {},
      has_cycle: true
    });

    expect(result.summary).toEqual({
      total_trees: 0,
      total_cycles: 1,
      largest_tree_root: ''
    });
  });

  test('Should correctly tiebreak largest_tree_root alphabetically', () => {
    // Both A->B (depth 2) and P->Q (depth 2) have equal depth.
    // A is lexicographically smaller than P.
    const input = ['P->Q', 'A->B'];
    const result = processGraph(input);

    expect(result.summary.largest_tree_root).toBe('A');
  });
});

describe('BFHL POST /bfhl API Endpoint Integration tests', () => {
  test('POST /bfhl with valid payload should return identity, invalid, duplicates, hierarchies, and summary', async () => {
    const payload = {
      data: [
        'A->B', 'A->C', 'B->D', 'C->E', 'E->F',
        'X->Y', 'Y->Z', 'Z->X',
        'P->Q', 'Q->R',
        'G->H', 'G->H', 'G->I',
        'hello', '1->2', 'A->'
      ]
    };

    const response = await request(app)
      .post('/bfhl')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(200);

    const { body } = response;
    expect(body.user_id).toBe(config.userId);
    expect(body.email_id).toBe(config.emailId);
    expect(body.college_roll_number).toBe(config.collegeRollNumber);

    expect(body.invalid_entries).toEqual(['hello', '1->2', 'A->']);
    expect(body.duplicate_edges).toEqual(['G->H']);
    expect(body.summary).toEqual({
      total_trees: 3,
      total_cycles: 1,
      largest_tree_root: 'A'
    });

    expect(body.hierarchies).toHaveLength(4);
    // Component ordering matches natural input order: A first, then X, then P, then G
    expect(body.hierarchies[0].root).toBe('A');
    expect(body.hierarchies[1].root).toBe('X');
    expect(body.hierarchies[2].root).toBe('P');
    expect(body.hierarchies[3].root).toBe('G');
  });

  test('POST /bfhl with invalid data structures should return 400 Bad Request', async () => {
    await request(app)
      .post('/bfhl')
      .send({ data: 'not-an-array' })
      .expect(400);

    await request(app)
      .post('/bfhl')
      .send({})
      .expect(400);
  });

  test('GET /bfhl should return operation code', async () => {
    const response = await request(app)
      .get('/bfhl')
      .expect(200);

    expect(response.body).toEqual({
      operation_code: 1,
      message: 'Chitkara Full Stack Challenge API is active. Use POST /bfhl to process hierarchical data.'
    });
  });
});
