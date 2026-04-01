import type { Column } from '../data';
import { StatusDot } from './StatusDot';

interface Props {
  column: Column;
  onEditName: (name: string) => void;
  onEditSubtitle: (subtitle: string) => void;
  onStatusClick: () => void;
  onRemove: () => void;
}

export function ColumnHeader({ column, onEditName, onEditSubtitle, onStatusClick, onRemove }: Props) {
  return (
    <th className="col-header">
      <div className="col-header-inner">
        <button className="col-remove-btn" onClick={onRemove} title="Remove column">×</button>
        <span
          className="col-header-name"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onEditName(e.currentTarget.textContent || column.name)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        >
          {column.name}
        </span>
        <span
          className="col-header-subtitle"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onEditSubtitle(e.currentTarget.textContent || column.subtitle)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        >
          {column.subtitle}
        </span>
        <div className="col-header-dot">
          <StatusDot status={column.status} onClick={onStatusClick} />
        </div>
      </div>
    </th>
  );
}
