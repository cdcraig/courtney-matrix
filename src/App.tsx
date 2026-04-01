import { useState, useEffect, useCallback, useRef } from 'react';
import type { MatrixData } from './data';
import { createDefaultData } from './data';
import { Matrix } from './components/Matrix';
import './styles/matrix.css';

const API = '/api/data';

export default function App() {
  const [data, setData] = useState<MatrixData>(createDefaultData);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from server on mount
  useEffect(() => {
    fetch(API)
      .then(r => r.json())
      .then(saved => {
        if (saved) setData(saved);
        setLoaded(true);
      })
      .catch(() => {
        setLoaded(true);
      });
  }, []);

  // Save to server on every change (debounced 500ms)
  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch(() => {});
    }, 500);
  }, [data, loaded]);

  const handleReset = useCallback(() => {
    const defaults = createDefaultData();
    setData(defaults);
  }, []);

  if (!loaded) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Loading...</div>;
  }

  return <Matrix data={data} onChange={setData} onReset={handleReset} />;
}
