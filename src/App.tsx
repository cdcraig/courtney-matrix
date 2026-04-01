import { useState, useEffect, useCallback } from 'react';
import type { MatrixData } from './data';
import { createDefaultData, STORAGE_KEY } from './data';
import { Matrix } from './components/Matrix';
import './styles/matrix.css';

function loadData(): MatrixData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return createDefaultData();
}

export default function App() {
  const [data, setData] = useState<MatrixData>(loadData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const handleReset = useCallback(() => {
    const defaults = createDefaultData();
    setData(defaults);
  }, []);

  return <Matrix data={data} onChange={setData} onReset={handleReset} />;
}
