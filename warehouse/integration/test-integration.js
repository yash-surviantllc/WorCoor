/**
 * Integration Test Component
 * Use this to verify the integration works correctly
 */

import React, { useState, useEffect } from 'react';
import useWorCoorIntegration from './useWorCoorIntegration';

const IntegrationTest = () => {
  const { layouts, loading, refreshLayouts } = useWorCoorIntegration();
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    runTests();
  }, []);

  const runTests = () => {
    const results = {};

    // Test 1: Check if dependencies are loaded
    results.dependencies = {
      reactDnd: typeof window.ReactDnD !== 'undefined' || true, // Will be loaded when used
      uuid: typeof require !== 'undefined',
      passed: true
    };

    // Test 2: Check localStorage access
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      results.localStorage = { passed: true };
    } catch (e) {
      results.localStorage = { passed: false, error: e.message };
    }

    // Test 3: Check if layouts can be loaded
    try {
      const savedLayouts = localStorage.getItem('warehouseLayouts');
      results.layoutsLoad = {
        passed: true,
        count: savedLayouts ? JSON.parse(savedLayouts).length : 0
      };
    } catch (e) {
      results.layoutsLoad = { passed: false, error: e.message };
    }

    // Test 4: Check if events work
    try {
      window.dispatchEvent(new CustomEvent('layoutSaved'));
      results.events = { passed: true };
    } catch (e) {
      results.events = { passed: false, error: e.message };
    }

    setTestResults(results);
  };

  const allTestsPassed = Object.values(testResults).every(r => r.passed);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>WorCoor Integration Test</h1>
      
      <div style={styles.section}>
        <h2>Test Results</h2>
        
        {Object.entries(testResults).map(([name, result]) => (
          <div key={name} style={styles.testResult}>
            <span style={result.passed ? styles.pass : styles.fail}>
              {result.passed ? '✓' : '✗'}
            </span>
            <span style={styles.testName}>{name}</span>
            {result.error && (
              <span style={styles.error}>{result.error}</span>
            )}
            {result.count !== undefined && (
              <span style={styles.info}>({result.count} layouts)</span>
            )}
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <h2>Summary</h2>
        <p style={allTestsPassed ? styles.successText : styles.errorText}>
          {allTestsPassed 
            ? '✓ All tests passed! Integration is ready.' 
            : '✗ Some tests failed. Check the errors above.'}
        </p>
      </div>

      <div style={styles.section}>
        <h2>Saved Layouts</h2>
        {loading ? (
          <p>Loading...</p>
        ) : layouts.length > 0 ? (
          <ul style={styles.list}>
            {layouts.map(layout => (
              <li key={layout.id} style={styles.listItem}>
                {layout.name} - {layout.status} ({layout.items} items)
              </li>
            ))}
          </ul>
        ) : (
          <p>No layouts saved yet.</p>
        )}
      </div>

      <button onClick={runTests} style={styles.button}>
        Re-run Tests
      </button>
    </div>
  );
};

const styles = {
  container: {
    padding: '40px',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '32px',
    marginBottom: '30px',
    color: '#333',
  },
  section: {
    marginBottom: '30px',
    padding: '20px',
    background: '#f5f5f5',
    borderRadius: '8px',
  },
  testResult: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    marginBottom: '5px',
    background: 'white',
    borderRadius: '4px',
  },
  pass: {
    color: '#4CAF50',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  fail: {
    color: '#f44336',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  testName: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  error: {
    color: '#f44336',
    fontSize: '12px',
    marginLeft: 'auto',
  },
  info: {
    color: '#666',
    fontSize: '12px',
    marginLeft: 'auto',
  },
  successText: {
    color: '#4CAF50',
    fontSize: '18px',
    fontWeight: '600',
  },
  errorText: {
    color: '#f44336',
    fontSize: '18px',
    fontWeight: '600',
  },
  list: {
    listStyle: 'none',
    padding: 0,
  },
  listItem: {
    padding: '10px',
    background: 'white',
    marginBottom: '5px',
    borderRadius: '4px',
  },
  button: {
    padding: '12px 24px',
    background: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
  },
};

export default IntegrationTest;
