import { STATUS_COLORS, STATUS_LABELS } from '../data';
import type { Status } from '../data';

const LEGEND_STATUSES: Status[] = ['done', 'wip', 'blocked', 'todo'];

export function Legend() {
  return (
    <div className="legend">
      {LEGEND_STATUSES.map((s) => (
        <div key={s} className="legend-item">
          <span
            className="legend-dot"
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: s === 'todo' ? 'white' : STATUS_COLORS[s],
              border: s === 'todo' ? `2px solid ${STATUS_COLORS.todo}` : 'none',
              boxSizing: 'border-box',
              marginRight: 6,
              verticalAlign: 'middle',
            }}
          />
          <span className="legend-label">{STATUS_LABELS[s]}</span>
        </div>
      ))}
    </div>
  );
}
