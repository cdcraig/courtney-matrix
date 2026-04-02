import { useEffect, useRef, useState } from 'react';
import type { TaskLabel } from '../data';
import { TASK_LABELS, LABEL_STYLES } from '../data';

interface Props {
  current: TaskLabel;
  onSelect: (label: TaskLabel) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

const CUSTOM_COLOR = { bg: '#4a5568', color: '#fff' };

export function LabelPicker({ current, onSelect, onClose, position }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [customMode, setCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState('');

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onClose]);

  const style: React.CSSProperties = {
    position: 'fixed',
    left: position.x,
    top: position.y,
    zIndex: 1000,
  };

  const handleCustomSubmit = () => {
    const val = customValue.trim();
    if (val) {
      onSelect(val as TaskLabel);
    }
    onClose();
  };

  return (
    <div ref={ref} className="status-picker" style={style}>
      {TASK_LABELS.map(label => (
        <button
          key={label || 'clear'}
          className={`status-picker-item ${label === current ? 'active' : ''}`}
          onClick={() => { onSelect(label); onClose(); }}
        >
          {label ? (
            <span
              className="label-preview"
              style={{
                backgroundColor: LABEL_STYLES[label]?.bg,
                color: LABEL_STYLES[label]?.color,
              }}
            >
              {label}
            </span>
          ) : (
            <span className="status-picker-label">Clear</span>
          )}
        </button>
      ))}
      <div className="label-custom-divider" />
      {customMode ? (
        <div className="label-custom-input-wrap">
          <input
            className="label-custom-input"
            placeholder="Type label..."
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCustomSubmit();
              if (e.key === 'Escape') onClose();
            }}
            autoFocus
          />
          <button className="label-custom-ok" onClick={handleCustomSubmit}>✓</button>
        </div>
      ) : (
        <button
          className="status-picker-item"
          onClick={() => setCustomMode(true)}
        >
          <span
            className="label-preview"
            style={{ backgroundColor: CUSTOM_COLOR.bg, color: CUSTOM_COLOR.color }}
          >
            Custom...
          </span>
        </button>
      )}
    </div>
  );
}
