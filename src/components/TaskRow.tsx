import { useState } from 'react';
import type { Task, Column, Status } from '../data';
import { STATUS_COLORS, STATUS_LABELS, CELL_BG, CHIP_BG } from '../data';
import { StatusDot } from './StatusDot';

interface Props {
  task: Task;
  columns: Column[];
  separatorAfter: number;
  onUpdateTask: (task: Task) => void;
  onRemove: () => void;
  onCellClick: (colId: string) => void;
}

export function TaskRow({ task, columns, separatorAfter, onUpdateTask, onRemove, onCellClick }: Props) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.name);
  const [hovering, setHovering] = useState(false);

  const handleSave = () => {
    setEditing(false);
    if (editValue.trim() && editValue !== task.name) {
      onUpdateTask({ ...task, name: editValue.trim() });
    } else {
      setEditValue(task.name);
    }
  };

  return (
    <tr
      className={`task-row ${task.foundation ? 'foundation-row' : ''}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <td className="task-name-cell">
        <div className="task-name-inner">
          {editing ? (
            <input
              className="task-name-input"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') { setEditValue(task.name); setEditing(false); }
              }}
              autoFocus
            />
          ) : (
            <>
              <span
                className={`task-name ${task.foundation ? 'foundation-name' : ''}`}
                onClick={() => { setEditing(true); setEditValue(task.name); }}
              >
                {task.name}
              </span>
              {task.status !== 'empty' && (
                <span
                  className="task-chip"
                  style={{
                    backgroundColor: CHIP_BG[task.status],
                    color: task.status === 'todo' ? '#888' : STATUS_COLORS[task.status],
                  }}
                >
                  {STATUS_LABELS[task.status]}
                </span>
              )}
            </>
          )}
          {hovering && (
            <button className="task-delete-btn" onClick={onRemove}>×</button>
          )}
        </div>
      </td>
      {columns.map((col, i) => {
        const cellStatus: Status = task.cells[col.id] || 'empty';
        const cells = [];

        if (i === separatorAfter + 1) {
          cells.push(<td key={`sep-${i}`} className="separator-cell" />);
        }

        cells.push(
          <td
            key={col.id}
            className="matrix-cell"
            style={{ backgroundColor: CELL_BG[cellStatus] }}
            onClick={() => onCellClick(col.id)}
          >
            {cellStatus !== 'empty' && (
              <StatusDot status={cellStatus} onClick={() => onCellClick(col.id)} />
            )}
          </td>
        );

        return cells;
      })}
    </tr>
  );
}
