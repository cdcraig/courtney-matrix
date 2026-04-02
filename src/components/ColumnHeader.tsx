import { useRef } from 'react';
import type { Column } from '../data';

interface Props {
  column: Column;
  onEditName: (name: string) => void;
  onEditSubtitle: (subtitle: string) => void;
  onRemove: () => void;
  onImageChange: (image: string | undefined) => void;
  onDragStart: () => void;
  onDragOver: () => void;
  onDragEnd: () => void;
  isDropTarget?: boolean;
}

export function ColumnHeader({ column, onEditName, onEditSubtitle, onRemove, onImageChange, onDragStart, onDragOver, onDragEnd, isDropTarget }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;
      // Upload to server, then store the URL reference
      fetch(`/api/image/${column.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ data: dataUri }),
      })
        .then(r => r.json())
        .then(result => {
          if (result.ok) {
            onImageChange(result.url);
          }
        })
        .catch(() => {
          // Fallback: store inline (local dev)
          onImageChange(dataUri);
        });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <th
      className={`col-header ${isDropTarget ? 'col-drop-target' : ''}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/x-col-drag', column.id);
        onDragStart();
      }}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('application/x-col-drag')) {
          e.preventDefault();
          onDragOver();
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDragEnd();
      }}
      onDragEnd={onDragEnd}
    >
      <div className="col-header-inner">
        <button className="col-remove-btn" onClick={onRemove} title="Remove column">×</button>
        <div
          className="col-image-area"
          onClick={() => fileInputRef.current?.click()}
          title={column.image ? 'Click to change image' : 'Click to add image'}
        >
          {column.image ? (
            <img src={column.image} alt={column.name} className="col-image" />
          ) : (
            <div className="col-image-placeholder">+</div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
        </div>
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
      </div>
    </th>
  );
}
