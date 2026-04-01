interface Props {
  name: string;
  colSpan: number;
  onEdit: (name: string) => void;
  onRemove: () => void;
}

export function GroupHeader({ name, colSpan, onEdit, onRemove }: Props) {
  return (
    <tr className="group-header-row">
      <td colSpan={colSpan} className="group-header-cell">
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
        <button className="group-remove-btn" onClick={onRemove} title="Remove group">
          ×
        </button>
      </td>
    </tr>
  );
}
