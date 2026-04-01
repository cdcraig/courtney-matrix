import type { Status } from '../data';
import { STATUS_COLORS } from '../data';

interface Props {
  status: Status;
  onClick: () => void;
  size?: number;
  alwaysVisible?: boolean;
}

export function StatusDot({ status, onClick, size = 10, alwaysVisible = false }: Props) {
  const isTodo = status === 'todo';
  const isEmpty = status === 'empty';

  return (
    <span
      className="status-dot"
      onClick={onClick}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: isTodo ? 'white' : isEmpty ? (alwaysVisible ? 'transparent' : 'white') : STATUS_COLORS[status],
        border: isTodo ? `2px solid ${STATUS_COLORS.todo}` : isEmpty && alwaysVisible ? '2px dashed #ddd' : 'none',
        cursor: 'pointer',
        boxSizing: 'border-box',
        visibility: isEmpty && !alwaysVisible ? 'hidden' : 'visible',
      }}
      title={status === 'empty' ? 'Click to set status' : status}
    />
  );
}
