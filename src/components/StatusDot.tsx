import type { Status } from '../data';
import { STATUS_COLORS } from '../data';

interface Props {
  status: Status;
  onClick: () => void;
  size?: number;
}

export function StatusDot({ status, onClick, size = 10 }: Props) {
  const isDeferred = status === 'deferred';
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
        backgroundColor: isDeferred || isEmpty ? 'white' : STATUS_COLORS[status],
        border: isDeferred ? `2px solid ${STATUS_COLORS.deferred}` : isEmpty ? 'none' : 'none',
        cursor: 'pointer',
        boxSizing: 'border-box',
        visibility: isEmpty ? 'hidden' : 'visible',
      }}
      title={status}
    />
  );
}
