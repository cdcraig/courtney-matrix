import { useEffect, useRef } from 'react';
import type { Status } from '../data';
import { STATUS_ORDER, STATUS_COLORS, STATUS_LABELS } from '../data';

interface Props {
  current: Status;
  onSelect: (status: Status) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

export function StatusPicker({ current, onSelect, onClose, position }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onClose]);

  // Adjust position to stay on screen
  const style: React.CSSProperties = {
    position: 'fixed',
    left: position.x,
    top: position.y,
    zIndex: 1000,
  };

  return (
    <div ref={ref} className="status-picker" style={style}>
      {STATUS_ORDER.map(status => {
        const isTodo = status === 'todo';
        const isEmpty = status === 'empty';
        return (
          <button
            key={status}
            className={`status-picker-item ${status === current ? 'active' : ''}`}
            onClick={() => { onSelect(status); onClose(); }}
          >
            <span
              className="status-picker-dot"
              style={{
                backgroundColor: isTodo ? 'white' : isEmpty ? 'transparent' : STATUS_COLORS[status],
                border: isTodo ? `2px solid ${STATUS_COLORS.todo}` : isEmpty ? '2px dashed #ddd' : 'none',
              }}
            />
            <span className="status-picker-label">
              {isEmpty ? 'Clear' : STATUS_LABELS[status]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
