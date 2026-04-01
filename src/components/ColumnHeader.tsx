import { useRef } from 'react';
import type { Column } from '../data';
import { StatusDot } from './StatusDot';

interface Props {
  column: Column;
  onEditName: (name: string) => void;
  onEditSubtitle: (subtitle: string) => void;
  onStatusClick: (e: React.MouseEvent) => void;
  onRemove: () => void;
  onImageChange: (image: string | undefined) => void;
}

export function ColumnHeader({ column, onEditName, onEditSubtitle, onStatusClick, onRemove, onImageChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onImageChange(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <th className="col-header">
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
        <div className="col-header-dot" onClick={onStatusClick}>
          <StatusDot status={column.status} onClick={() => {}} size={12} alwaysVisible />
        </div>
      </div>
    </th>
  );
}
