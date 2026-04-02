interface Props {
  name: string;
  colSpan: number;
  onEdit: (name: string) => void;
  onRemove: () => void;
  groupId: string;
  groupIndex: number;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: () => void;
  isDropTarget?: boolean;
  onGroupDragStart: () => void;
  onGroupDragOver: () => void;
  onGroupDragEnd: () => void;
  isGroupDropTarget?: boolean;
  linearUrl?: string;
}

export function GroupHeader({ name, colSpan, onEdit, onRemove, onDragOver, onDragLeave, onDrop, isDropTarget, onGroupDragStart, onGroupDragOver, onGroupDragEnd, isGroupDropTarget, linearUrl: _linearUrl }: Props) {
  return (
    <tr
      className={`group-header-row ${isDropTarget ? 'drop-target' : ''} ${isGroupDropTarget ? 'group-drop-target' : ''}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/x-group-drag', 'group');
        onGroupDragStart();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        // Check if this is a group drag or task drag
        if (e.dataTransfer.types.includes('application/x-group-drag')) {
          onGroupDragOver();
        } else {
          onDragOver();
        }
      }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        if (e.dataTransfer.types.includes('application/x-group-drag')) {
          onGroupDragEnd();
        } else {
          onDrop();
        }
      }}
      onDragEnd={onGroupDragEnd}
    >
      <td colSpan={colSpan} className="group-header-cell">
        <span className="group-drag-handle" title="Drag to reorder group">☰</span>
        <span
          className="group-header-name"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onEdit(e.currentTarget.textContent || name)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        >
          {name}
        </span>
        {/* Linear icon hidden for now — data preserved
        {linearUrl && (
          <a
            href={linearUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="linear-link linear-link-group"
            title="Open project in Linear"
            onClick={(e) => e.stopPropagation()}
          >
            <img src="https://images.seeklogo.com/logo-png/58/2/linear-app-icon-logo-png_seeklogo-586481.png" width="14" height="14" alt="Linear" />
          </a>
        )}
        */}
        <button className="group-remove-btn" onClick={onRemove} title="Remove group">
          ×
        </button>
      </td>
    </tr>
  );
}
