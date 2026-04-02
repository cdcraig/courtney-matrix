import { useState, useRef, useCallback, useEffect } from 'react';
import type { MatrixData, Status, Task, Group, Column } from '../data';
import { generateId, sortTasks } from '../data';
import { ColumnHeader } from './ColumnHeader';
import { GroupHeader } from './GroupHeader';
import { TaskRow } from './TaskRow';
import { Legend } from './Legend';

interface Props {
  data: MatrixData;
  onChange: (data: MatrixData) => void;
  onUndo: () => void;
}

interface DragInfo {
  type: 'task' | 'group';
  taskId?: string;
  fromGroupId: string;
  fromIndex: number;
}

const LABEL_WIDTH_KEY = 'courtney-matrix-label-width';

export function Matrix({ data, onChange, onUndo }: Props) {
  const [addingTaskGroup, setAddingTaskGroup] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const dragInfo = useRef<DragInfo | null>(null);
  const [dropTarget, setDropTarget] = useState<{ groupId: string; index: number } | null>(null);
  const [groupDropTarget, setGroupDropTarget] = useState<number | null>(null);
  const groupDropRef = useRef<number | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const resizing = useRef(false);
  const [labelWidth, setLabelWidth] = useState(() => {
    const stored = localStorage.getItem(LABEL_WIDTH_KEY);
    return stored ? parseInt(stored, 10) : 300;
  });

  // Column drag
  const colDragFrom = useRef<number | null>(null);
  const [colDropTarget, setColDropTarget] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem(LABEL_WIDTH_KEY, String(labelWidth));
  }, [labelWidth]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizing.current = true;
    const startX = e.clientX;
    const startWidth = labelWidth;

    const handleMouseMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX;
      const newWidth = Math.max(150, Math.min(600, startWidth + delta));
      setLabelWidth(newWidth);
    };

    const handleMouseUp = () => {
      resizing.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [labelWidth]);

  const update = (partial: Partial<MatrixData>) => {
    onChange({ ...data, ...partial });
  };

  const updateColumn = (colId: string, patch: Partial<Column>) => {
    update({
      columns: data.columns.map((c) => (c.id === colId ? { ...c, ...patch } : c)),
    });
  };

  const updateGroup = (groupId: string, patch: Partial<Group>) => {
    update({
      groups: data.groups.map((g) => (g.id === groupId ? { ...g, ...patch } : g)),
    });
  };

  const updateTaskInGroup = (groupId: string, task: Task) => {
    update({
      groups: data.groups.map((g) =>
        g.id === groupId
          ? { ...g, tasks: g.tasks.map((t) => (t.id === task.id ? task : t)) }
          : g
      ),
    });
  };

  const removeTask = (groupId: string, taskId: string) => {
    update({
      groups: data.groups.map((g) =>
        g.id === groupId ? { ...g, tasks: g.tasks.filter((t) => t.id !== taskId) } : g
      ),
    });
  };

  const setCell = (groupId: string, taskId: string, colId: string, status: Status) => {
    const group = data.groups.find((g) => g.id === groupId);
    const task = group?.tasks.find((t) => t.id === taskId);
    if (!task) return;
    const newCells = { ...task.cells };
    if (status === 'empty') {
      delete newCells[colId];
    } else {
      newCells[colId] = status;
    }
    updateTaskInGroup(groupId, { ...task, cells: newCells });
  };

  const addTask = (groupId: string) => {
    if (!newTaskName.trim()) {
      setAddingTaskGroup(null);
      return;
    }
    const group = data.groups.find((g) => g.id === groupId);
    const newTask: Task = {
      id: generateId(),
      name: newTaskName.trim(),
      status: 'todo',
      cells: {},
      foundation: group?.foundation,
    };
    update({
      groups: data.groups.map((g) =>
        g.id === groupId ? { ...g, tasks: [...g.tasks, newTask] } : g
      ),
    });
    setNewTaskName('');
    setAddingTaskGroup(null);
  };

  const addColumn = () => {
    const newCol: Column = {
      id: generateId(),
      name: 'New Column',
      subtitle: '',
      status: 'todo' as Status,
    };
    update({ columns: [...data.columns, newCol] });
  };

  const removeColumn = (colId: string) => {
    update({
      columns: data.columns.filter((c) => c.id !== colId),
      groups: data.groups.map((g) => ({
        ...g,
        tasks: g.tasks.map((t) => {
          const newCells = { ...t.cells };
          delete newCells[colId];
          return { ...t, cells: newCells };
        }),
      })),
    });
  };

  const addGroup = () => {
    const newGroup: Group = {
      id: generateId(),
      name: 'New Group',
      tasks: [],
    };
    update({ groups: [newGroup, ...data.groups] });
  };

  const removeGroup = (groupId: string) => {
    update({ groups: data.groups.filter((g) => g.id !== groupId) });
  };

  // Task drag and drop
  const handleDragStart = useCallback((taskId: string, groupId: string, index: number) => {
    dragInfo.current = { type: 'task', taskId, fromGroupId: groupId, fromIndex: index };
  }, []);

  const handleDragOver = useCallback((groupId: string, index: number) => {
    setDropTarget({ groupId, index });
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!dragInfo.current || dragInfo.current.type !== 'task' || !dropTarget) {
      dragInfo.current = null;
      setDropTarget(null);
      return;
    }

    const { taskId, fromGroupId } = dragInfo.current;
    const { groupId: toGroupId, index: toIndex } = dropTarget;

    const fromGroup = data.groups.find((g) => g.id === fromGroupId);
    const task = fromGroup?.tasks.find((t) => t.id === taskId);
    if (!task) {
      dragInfo.current = null;
      setDropTarget(null);
      return;
    }

    const newGroups = data.groups.map((g) => {
      if (g.id === fromGroupId && g.id === toGroupId) {
        const tasks = [...g.tasks];
        const fromIdx = tasks.findIndex((t) => t.id === taskId);
        tasks.splice(fromIdx, 1);
        const insertAt = toIndex > fromIdx ? toIndex - 1 : toIndex;
        tasks.splice(insertAt, 0, { ...task, foundation: g.foundation });
        return { ...g, tasks };
      } else if (g.id === fromGroupId) {
        return { ...g, tasks: g.tasks.filter((t) => t.id !== taskId) };
      } else if (g.id === toGroupId) {
        const tasks = [...g.tasks];
        tasks.splice(toIndex, 0, { ...task, foundation: g.foundation });
        return { ...g, tasks };
      }
      return g;
    });

    onChange({ ...data, groups: newGroups });
    dragInfo.current = null;
    setDropTarget(null);
  }, [data, dropTarget, onChange]);

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  // Group drag and drop
  const handleGroupDragStart = useCallback((groupId: string, index: number) => {
    dragInfo.current = { type: 'group', fromGroupId: groupId, fromIndex: index };
  }, []);

  const handleGroupDragOver = useCallback((index: number) => {
    groupDropRef.current = index;
    setGroupDropTarget(index);
  }, []);

  const handleGroupDragEnd = useCallback(() => {
    const target = groupDropRef.current;
    if (!dragInfo.current || dragInfo.current.type !== 'group' || target === null) {
      dragInfo.current = null;
      groupDropRef.current = null;
      setGroupDropTarget(null);
      return;
    }

    const { fromIndex } = dragInfo.current;

    if (fromIndex !== target) {
      const newGroups = [...data.groups];
      const [moved] = newGroups.splice(fromIndex, 1);
      const insertAt = target > fromIndex ? target - 1 : target;
      newGroups.splice(insertAt, 0, moved);
      onChange({ ...data, groups: newGroups });
    }

    dragInfo.current = null;
    groupDropRef.current = null;
    setGroupDropTarget(null);
  }, [data, onChange]);

  // Column drag handlers
  const handleColDragStart = useCallback((index: number) => {
    colDragFrom.current = index;
  }, []);

  const handleColDragOver = useCallback((index: number) => {
    setColDropTarget(index);
  }, []);

  const handleColDragEnd = useCallback(() => {
    const from = colDragFrom.current;
    const to = colDropTarget;
    if (from === null || to === null || from === to) {
      colDragFrom.current = null;
      setColDropTarget(null);
      return;
    }
    const newCols = [...data.columns];
    const [moved] = newCols.splice(from, 1);
    const insertAt = to > from ? to - 1 : to;
    newCols.splice(insertAt, 0, moved);
    onChange({ ...data, columns: newCols });
    colDragFrom.current = null;
    setColDropTarget(null);
  }, [data, colDropTarget, onChange]);

  const totalCols = 1 + data.columns.length + 1;

  return (
    <div className="matrix-wrapper">
      <div className="title-bar">
        <span className="title-text">Courtney AI — task matrix</span>
        <span className="title-date">April 2026</span>
      </div>
      <div className="matrix-card">
        <table className="matrix-table" ref={tableRef} style={{ '--label-col-width': `${labelWidth}px` } as React.CSSProperties}>
          <thead>
            <tr>
              <th className="corner-cell">
                <button className="add-group-btn" onClick={addGroup} title="Add group">
                  + Group
                </button>
                <div className="col-resize-handle" onMouseDown={handleResizeStart} />
              </th>
              {data.columns.map((col, i) => {
                const cells = [];
                if (i === data.separatorAfter + 1) {
                  cells.push(<th key="sep" className="separator-header" />);
                }
                cells.push(
                  <ColumnHeader
                    key={col.id}
                    column={col}
                    onEditName={(name) => updateColumn(col.id, { name })}
                    onEditSubtitle={(subtitle) => updateColumn(col.id, { subtitle })}
                    onRemove={() => removeColumn(col.id)}
                    onImageChange={(image) => updateColumn(col.id, { image })}
                    onDragStart={() => handleColDragStart(i)}
                    onDragOver={() => handleColDragOver(i)}
                    onDragEnd={handleColDragEnd}
                    isDropTarget={colDropTarget === i}
                  />
                );
                return cells;
              })}
              <th className="add-col-header">
                <button className="add-col-btn" onClick={addColumn} title="Add column">+</button>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.groups.map((group, groupIndex) => (
              <GroupRows
                key={group.id}
                group={group}
                groupIndex={groupIndex}
                columns={data.columns}
                separatorAfter={data.separatorAfter}
                totalCols={totalCols}
                addingTaskGroup={addingTaskGroup}
                newTaskName={newTaskName}
                dropTarget={dropTarget}
                groupDropTarget={groupDropTarget}
                onSetAddingTaskGroup={setAddingTaskGroup}
                onSetNewTaskName={setNewTaskName}
                onAddTask={addTask}
                onUpdateTaskInGroup={updateTaskInGroup}
                onRemoveTask={removeTask}
                onSetCell={setCell}
                onUpdateGroup={updateGroup}
                onRemoveGroup={removeGroup}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragLeave={handleDragLeave}
                onGroupDragStart={handleGroupDragStart}
                onGroupDragOver={handleGroupDragOver}
                onGroupDragEnd={handleGroupDragEnd}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="footer-bar">
        <Legend />
        <button className="undo-btn" onClick={onUndo} title="Undo last change">↩ Undo</button>
      </div>
    </div>
  );
}

interface GroupRowsProps {
  group: Group;
  groupIndex: number;
  columns: Column[];
  separatorAfter: number;
  totalCols: number;
  addingTaskGroup: string | null;
  newTaskName: string;
  dropTarget: { groupId: string; index: number } | null;
  groupDropTarget: number | null;
  onSetAddingTaskGroup: (id: string | null) => void;
  onSetNewTaskName: (name: string) => void;
  onAddTask: (groupId: string) => void;
  onUpdateTaskInGroup: (groupId: string, task: Task) => void;
  onRemoveTask: (groupId: string, taskId: string) => void;
  onSetCell: (groupId: string, taskId: string, colId: string, status: Status) => void;
  onUpdateGroup: (groupId: string, patch: Partial<Group>) => void;
  onRemoveGroup: (groupId: string) => void;
  onDragStart: (taskId: string, groupId: string, index: number) => void;
  onDragOver: (groupId: string, index: number) => void;
  onDragEnd: () => void;
  onDragLeave: () => void;
  onGroupDragStart: (groupId: string, index: number) => void;
  onGroupDragOver: (index: number) => void;
  onGroupDragEnd: () => void;
}

function GroupRows({
  group,
  groupIndex,
  columns,
  separatorAfter,
  totalCols,
  addingTaskGroup,
  newTaskName,
  dropTarget,
  groupDropTarget,
  onSetAddingTaskGroup,
  onSetNewTaskName,
  onAddTask,
  onUpdateTaskInGroup,
  onRemoveTask,
  onSetCell,
  onUpdateGroup,
  onRemoveGroup,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDragLeave,
  onGroupDragStart,
  onGroupDragOver,
  onGroupDragEnd,
}: GroupRowsProps) {
  return (
    <>
      <GroupHeader
        name={group.name}
        colSpan={totalCols + 1}
        onEdit={(name: string) => onUpdateGroup(group.id, { name })}
        onRemove={() => onRemoveGroup(group.id)}
        groupId={group.id}
        groupIndex={groupIndex}
        onDragOver={() => onDragOver(group.id, 0)}
        onDragLeave={onDragLeave}
        onDrop={onDragEnd}
        isDropTarget={dropTarget?.groupId === group.id && dropTarget?.index === 0 && group.tasks.length === 0}
        onGroupDragStart={() => onGroupDragStart(group.id, groupIndex)}
        onGroupDragOver={() => onGroupDragOver(groupIndex)}
        onGroupDragEnd={onGroupDragEnd}
        isGroupDropTarget={groupDropTarget === groupIndex}
        linearUrl={group.linearUrl}
      />
      {sortTasks(group.tasks).map((task: Task, index: number) => (
        <TaskRow
          key={task.id}
          task={task}
          columns={columns}
          separatorAfter={separatorAfter}
          onUpdateTask={(t: Task) => onUpdateTaskInGroup(group.id, t)}
          onRemove={() => onRemoveTask(group.id, task.id)}
          onCellClick={(colId: string, status: Status) => onSetCell(group.id, task.id, colId, status)}
          draggable
          onDragStart={() => onDragStart(task.id, group.id, index)}
          onDragOver={(e: React.DragEvent) => {
            e.preventDefault();
            onDragOver(group.id, index);
          }}
          onDragEnd={onDragEnd}
          isDropTarget={dropTarget?.groupId === group.id && dropTarget?.index === index}
        />
      ))}
      <tr
        className={`drop-zone-row ${dropTarget?.groupId === group.id && dropTarget?.index === group.tasks.length ? 'drop-zone-active' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          onDragOver(group.id, group.tasks.length);
        }}
        onDragLeave={onDragLeave}
        onDrop={onDragEnd}
      >
        <td colSpan={totalCols + 1}>
          {addingTaskGroup === group.id ? (
            <input
              className="add-task-input"
              placeholder="Task name..."
              value={newTaskName}
              onChange={(e) => onSetNewTaskName(e.target.value)}
              onBlur={() => onAddTask(group.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onAddTask(group.id);
                if (e.key === 'Escape') { onSetNewTaskName(''); onSetAddingTaskGroup(null); }
              }}
              autoFocus
            />
          ) : (
            <span
              className="add-task-placeholder"
              onClick={() => { onSetAddingTaskGroup(group.id); onSetNewTaskName(''); }}
            >
              + Add task...
            </span>
          )}
        </td>
      </tr>
    </>
  );
}
