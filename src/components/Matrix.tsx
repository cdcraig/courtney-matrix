import { useState } from 'react';
import type { MatrixData, Status, Task, Group, Column } from '../data';
import { nextStatus, generateId } from '../data';
import { ColumnHeader } from './ColumnHeader';
import { GroupHeader } from './GroupHeader';
import { TaskRow } from './TaskRow';
import { Legend } from './Legend';

interface Props {
  data: MatrixData;
  onChange: (data: MatrixData) => void;
  onReset: () => void;
}

export function Matrix({ data, onChange, onReset }: Props) {
  const [addingTaskGroup, setAddingTaskGroup] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState('');

  const update = (partial: Partial<MatrixData>) => {
    onChange({ ...data, ...partial });
  };

  const updateColumn = (colId: string, patch: Partial<typeof data.columns[0]>) => {
    update({
      columns: data.columns.map((c) => (c.id === colId ? { ...c, ...patch } : c)),
    });
  };

  const updateGroup = (groupId: string, patch: Partial<typeof data.groups[0]>) => {
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

  const cycleCell = (groupId: string, taskId: string, colId: string) => {
    const group = data.groups.find((g) => g.id === groupId);
    const task = group?.tasks.find((t) => t.id === taskId);
    if (!task) return;
    const current: Status = task.cells[colId] || 'empty';
    const next = nextStatus(current);
    const newCells = { ...task.cells };
    if (next === 'empty') {
      delete newCells[colId];
    } else {
      newCells[colId] = next;
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
    const newCol = {
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
    const newGroup = {
      id: generateId(),
      name: 'New Group',
      tasks: [],
    };
    update({ groups: [...data.groups, newGroup] });
  };

  const removeGroup = (groupId: string) => {
    update({ groups: data.groups.filter((g) => g.id !== groupId) });
  };

  // Total columns = 1 (task name) + columns.length + 1 (separator)
  const totalCols = 1 + data.columns.length + 1;

  return (
    <div className="matrix-wrapper">
      <div className="title-bar">
        <span className="title-text">Courtney AI — task matrix</span>
        <span className="title-date">April 2026</span>
      </div>
      <div className="matrix-card">
        <table className="matrix-table">
          <thead>
            <tr>
              <th className="corner-cell">
                <button className="add-group-btn" onClick={addGroup} title="Add group">
                  + Group
                </button>
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
                    onStatusClick={() => updateColumn(col.id, { status: nextStatus(col.status) })}
                    onRemove={() => removeColumn(col.id)}
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
            {data.groups.map((group) => (
              <GroupRows
                key={group.id}
                group={group}
                columns={data.columns}
                separatorAfter={data.separatorAfter}
                totalCols={totalCols}
                addingTaskGroup={addingTaskGroup}
                newTaskName={newTaskName}
                onSetAddingTaskGroup={setAddingTaskGroup}
                onSetNewTaskName={setNewTaskName}
                onAddTask={addTask}
                onUpdateTaskInGroup={updateTaskInGroup}
                onRemoveTask={removeTask}
                onCycleCell={cycleCell}
                onUpdateGroup={updateGroup}
                onRemoveGroup={removeGroup}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="footer-bar">
        <Legend />
        <button className="reset-btn" onClick={onReset}>Reset to defaults</button>
      </div>
    </div>
  );
}

interface GroupRowsProps {
  group: Group;
  columns: Column[];
  separatorAfter: number;
  totalCols: number;
  addingTaskGroup: string | null;
  newTaskName: string;
  onSetAddingTaskGroup: (id: string | null) => void;
  onSetNewTaskName: (name: string) => void;
  onAddTask: (groupId: string) => void;
  onUpdateTaskInGroup: (groupId: string, task: Task) => void;
  onRemoveTask: (groupId: string, taskId: string) => void;
  onCycleCell: (groupId: string, taskId: string, colId: string) => void;
  onUpdateGroup: (groupId: string, patch: any) => void;
  onRemoveGroup: (groupId: string) => void;
}

function GroupRows({
  group,
  columns,
  separatorAfter,
  totalCols,
  addingTaskGroup,
  newTaskName,
  onSetAddingTaskGroup,
  onSetNewTaskName,
  onAddTask,
  onUpdateTaskInGroup,
  onRemoveTask,
  onCycleCell,
  onUpdateGroup,
  onRemoveGroup,
}: GroupRowsProps) {
  return (
    <>
      <GroupHeader
        name={group.name}
        colSpan={totalCols + 1}
        onEdit={(name: string) => onUpdateGroup(group.id, { name })}
        onRemove={() => onRemoveGroup(group.id)}
      />
      {group.tasks.map((task: Task) => (
        <TaskRow
          key={task.id}
          task={task}
          columns={columns}
          separatorAfter={separatorAfter}
          onUpdateTask={(t: Task) => onUpdateTaskInGroup(group.id, t)}
          onRemove={() => onRemoveTask(group.id, task.id)}
          onCellClick={(colId: string) => onCycleCell(group.id, task.id, colId)}
        />
      ))}
      <tr className="add-task-row">
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
