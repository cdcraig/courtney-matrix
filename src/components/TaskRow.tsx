import { useState, useCallback } from 'react';
import type { Task, Column, Status } from '../data';
import { STATUS_COLORS, STATUS_LABELS, CELL_BG, CHIP_BG, deriveTaskStatus } from '../data';
import { StatusDot } from './StatusDot';
import { StatusPicker } from './StatusPicker';

interface Props {
  task: Task;
  columns: Column[];
  separatorAfter: number;
  onUpdateTask: (task: Task) => void;
  onRemove: () => void;
  onCellClick: (colId: string, status: Status) => void;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  isDropTarget?: boolean;
}

export function TaskRow({ task, columns, separatorAfter, onUpdateTask, onRemove, onCellClick, draggable, onDragStart, onDragOver, onDragEnd, isDropTarget }: Props) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.name);
  const [hovering, setHovering] = useState(false);
  const [picker, setPicker] = useState<{ colId: string; x: number; y: number } | null>(null);

  const handleSave = () => {
    setEditing(false);
    if (editValue.trim() && editValue !== task.name) {
      onUpdateTask({ ...task, name: editValue.trim() });
    } else {
      setEditValue(task.name);
    }
  };

  const handleCellClick = useCallback((colId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setPicker({ colId, x: rect.left, y: rect.bottom + 4 });
  }, []);

  const handlePickerSelect = useCallback((status: Status) => {
    if (picker) {
      onCellClick(picker.colId, status);
    }
    setPicker(null);
  }, [picker, onCellClick]);

  const derived = deriveTaskStatus(task.cells);

  return (
    <>
      <tr
        className={`task-row ${task.foundation ? 'foundation-row' : ''} ${isDropTarget ? 'drop-target' : ''}`}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        draggable={draggable}
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', task.id);
          onDragStart?.();
        }}
        onDragOver={onDragOver}
        onDrop={(e) => {
          e.preventDefault();
          onDragEnd?.();
        }}
        onDragEnd={onDragEnd}
      >
        <td className="task-name-cell">
          <div className="task-name-inner">
            <span className="drag-handle" title="Drag to reorder">⠿</span>
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
                {/* Linear icon hidden for now — data preserved
                {task.linearUrl && (
                  <a
                    href={task.linearUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="linear-link"
                    title="Open in Linear"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img src="https://images.seeklogo.com/logo-png/58/2/linear-app-icon-logo-png_seeklogo-586481.png" width="14" height="14" alt="Linear" />
                  </a>
                )}
                */}
                {derived !== 'empty' && (
                  <span
                    className="task-chip"
                    style={{
                      backgroundColor: CHIP_BG[derived],
                      color: derived === 'todo' ? '#888' : STATUS_COLORS[derived],
                    }}
                  >
                    {STATUS_LABELS[derived]}
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
              onClick={(e) => handleCellClick(col.id, e)}
            >
              <StatusDot status={cellStatus} onClick={() => {}} />
            </td>
          );

          return cells;
        })}
      </tr>
      {picker && (
        <StatusPicker
          current={task.cells[picker.colId] || 'empty'}
          onSelect={handlePickerSelect}
          onClose={() => setPicker(null)}
          position={{ x: picker.x, y: picker.y }}
        />
      )}
    </>
  );
}
