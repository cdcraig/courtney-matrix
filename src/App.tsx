import { useState, useEffect, useCallback, useRef } from 'react';
import type { MatrixData } from './data';
import { createDefaultData } from './data';
import { Matrix } from './components/Matrix';
import './styles/matrix.css';

const API = '/api/data';

export default function App() {
  const [data, setData] = useState<MatrixData | null>(null);
  const [status, setStatus] = useState('loading...');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoadDone = useRef(false);

  // Load from server on mount
  useEffect(() => {
    fetch(API, { credentials: 'include' })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(saved => {
        if (saved && saved.columns) {
          setData(saved);
          setStatus(`Loaded ${saved.groups?.length || 0} groups`);
        } else {
          setData(createDefaultData());
          setStatus('No saved data, using defaults');
        }
        initialLoadDone.current = true;
      })
      .catch((err) => {
        console.error('Load failed:', err);
        setData(createDefaultData());
        setStatus(`Load failed: ${err.message} — using defaults (NOT saving)`);
        // Don't set initialLoadDone — prevents overwriting server data
      });
  }, []);

  const handleChange = useCallback((newData: MatrixData) => {
    setData(newData);

    // Only save if initial load succeeded
    if (!initialLoadDone.current) {
      setStatus('Changes not saved — server connection failed');
      return;
    }

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setStatus('Saving...');
      fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newData),
      })
        .then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then(() => setStatus('Saved ✓'))
        .catch(err => setStatus(`Save failed: ${err.message}`));
    }, 500);
  }, []);

  const handleUndo = useCallback(() => {
    fetch('/api/undo', { method: 'POST', credentials: 'include' })
      .then(r => r.json())
      .then(result => {
        if (result.ok && result.data) {
          initialLoadDone.current = false; // Prevent save loop
          setData(result.data);
          setStatus('Undone ✓');
          setTimeout(() => { initialLoadDone.current = true; }, 100);
        }
      })
      .catch(() => {});
  }, []);

  if (!data) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Loading...</div>;
  }

  return (
    <>
      <div style={{ position: 'fixed', bottom: 8, left: 8, fontSize: 11, color: '#999', background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: 4, zIndex: 999 }}>
        {status}
      </div>
      <Matrix data={data} onChange={handleChange} onUndo={handleUndo} />
    </>
  );
}
