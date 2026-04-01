export type Status = 'done' | 'wip' | 'blocked' | 'todo' | 'empty';

export const STATUS_ORDER: Status[] = ['done', 'wip', 'blocked', 'todo', 'empty'];

export interface Column {
  id: string;
  name: string;
  subtitle: string;
  status: Status;
  image?: string;
}

export interface Task {
  id: string;
  name: string;
  status: Status;
  cells: Record<string, Status>;
  foundation?: boolean;
}

export interface Group {
  id: string;
  name: string;
  tasks: Task[];
  foundation?: boolean;
}

export interface MatrixData {
  columns: Column[];
  separatorAfter: number;
  groups: Group[];
}

let _id = 0;
function id(prefix: string) {
  return `${prefix}-${++_id}`;
}

export function createDefaultData(): MatrixData {
  const cols: Column[] = [
    { id: 'claude', name: 'Claude', subtitle: 'MCP', status: 'wip' },
    { id: 'chatgpt', name: 'ChatGPT', subtitle: 'MCP', status: 'wip' },
    { id: '3rdparty', name: '3rd-party', subtitle: 'MCP', status: 'wip' },
    { id: 'voice', name: 'Courtney Voice', subtitle: '833/phone', status: 'wip' },
    { id: 'sms', name: 'SMS', subtitle: 'Text msg', status: 'wip' },
    { id: 'receptionist', name: 'Hey Courtney Receptionist', subtitle: 'Facility', status: 'todo' },
    { id: 'embedded', name: 'Hey Courtney Embedded', subtitle: 'Web voice+chat', status: 'wip' },
    { id: 'licensing', name: 'Hey Courtney Licensing', subtitle: 'White label', status: 'todo' },
  ];

  const cellsFromArr = (statuses: (Status | null)[]): Record<string, Status> => {
    const result: Record<string, Status> = {};
    const colIds = ['claude', 'chatgpt', '3rdparty', 'voice', 'sms', 'receptionist', 'embedded', 'licensing'];
    statuses.forEach((s, i) => {
      if (s && s !== 'empty') result[colIds[i]] = s;
    });
    return result;
  };

  const groups: Group[] = [
    {
      id: id('g'),
      name: 'Foundation layers',
      foundation: true,
      tasks: [
        { id: id('t'), name: 'Facility knowledge', status: 'blocked', foundation: true, cells: cellsFromArr(['blocked', 'blocked', 'blocked', 'blocked', 'blocked', 'blocked', 'blocked', 'blocked']) },
        { id: id('t'), name: 'Authentication', status: 'wip', foundation: true, cells: cellsFromArr(['todo', 'todo', 'todo', 'todo', 'todo', 'todo', 'done', 'todo']) },
        { id: id('t'), name: 'CourtsApp knowledge', status: 'wip', foundation: true, cells: cellsFromArr(['wip', 'wip', 'wip', 'wip', 'wip', 'wip', 'wip', 'wip']) },
        { id: id('t'), name: 'Search availability', status: 'done', foundation: true, cells: cellsFromArr(['done', 'done', 'done', 'done', 'done', 'done', 'done', 'done']) },
        { id: id('t'), name: 'Booking', status: 'done', foundation: true, cells: cellsFromArr(['done', 'done', 'done', 'done', 'done', 'done', 'done', 'done']) },
        { id: id('t'), name: 'Charge payments', status: 'todo', foundation: true, cells: cellsFromArr(['todo', 'todo', 'todo', 'todo', 'todo', 'todo', 'todo', 'todo']) },
        { id: id('t'), name: 'Account viewing', status: 'blocked', foundation: true, cells: cellsFromArr(['blocked', 'blocked', 'blocked', 'blocked', 'blocked', 'blocked', 'blocked', 'blocked']) },
        { id: id('t'), name: 'Account editing', status: 'todo', foundation: true, cells: cellsFromArr(['todo', 'todo', 'todo', 'done', 'done', 'done', 'done', 'todo']) },
        { id: id('t'), name: 'Dynamic prompts per modality', status: 'done', foundation: true, cells: cellsFromArr(['done', 'done', 'done', 'done', 'done', 'done', 'done', 'done']) },
        { id: id('t'), name: 'Zendesk support tickets', status: 'done', foundation: true, cells: cellsFromArr(['done', 'done', 'done', 'done', 'done', 'done', 'done', 'done']) },
        { id: id('t'), name: 'General knowledge', status: 'done', foundation: true, cells: cellsFromArr(['done', 'done', 'done', 'done', 'done', 'done', 'done', 'done']) },
      ],
    },
    {
      id: id('g'),
      name: 'MCP',
      tasks: [
        { id: id('t'), name: 'Embedded UI / MCP cards', status: 'done', cells: cellsFromArr(['done', 'done', null, null, null, null, 'done', null]) },
        { id: id('t'), name: 'Dark mode error', status: 'todo', cells: cellsFromArr([null, null, null, null, null, null, null, null]) },
      ],
    },
    {
      id: id('g'),
      name: 'Embedded UI',
      tasks: [
        { id: id('t'), name: 'Thinking modal', status: 'done', cells: cellsFromArr([null, null, null, null, null, null, 'done', null]) },
        { id: id('t'), name: 'New loading animation', status: 'done', cells: cellsFromArr([null, null, null, null, null, null, 'done', null]) },
        { id: id('t'), name: 'Deployed to dev', status: 'todo', cells: cellsFromArr([null, null, null, null, null, null, null, null]) },
        { id: id('t'), name: 'Multimodal feedback', status: 'todo', cells: cellsFromArr([null, null, null, null, null, null, null, null]) },
        { id: id('t'), name: 'Minimize the chat', status: 'todo', cells: cellsFromArr([null, null, null, null, null, null, null, null]) },
      ],
    },
    {
      id: id('g'),
      name: 'Voice channels',
      tasks: [
        { id: id('t'), name: 'Professional voice', status: 'done', cells: cellsFromArr([null, null, null, 'done', null, 'done', 'done', null]) },
        { id: id('t'), name: 'Courtney sends SMS', status: 'done', cells: cellsFromArr([null, null, null, 'done', 'done', null, null, null]) },
      ],
    },
    {
      id: id('g'),
      name: 'SMS',
      tasks: [
        { id: id('t'), name: 'Card redesign', status: 'wip', cells: cellsFromArr([null, null, null, null, 'wip', null, null, null]) },
        { id: id('t'), name: 'OG card preview', status: 'done', cells: cellsFromArr([null, null, null, null, 'done', null, null, null]) },
      ],
    },
    {
      id: id('g'),
      name: 'Upcoming / to do',
      tasks: [],
    },
  ];

  return {
    columns: cols,
    separatorAfter: 2,
    groups,
  };
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const STATUS_COLORS: Record<Status, string> = {
  done: '#4CAF50',
  wip: '#FF9800',
  blocked: '#E53935',
  todo: '#B0BEC5',
  empty: 'transparent',
};

export const STATUS_LABELS: Record<Status, string> = {
  done: 'Done',
  wip: 'WIP',
  blocked: 'Blocked',
  todo: 'To do',
  empty: '',
};

export const CELL_BG: Record<Status, string> = {
  done: 'rgba(76, 175, 80, 0.10)',
  wip: 'rgba(255, 152, 0, 0.08)',
  blocked: 'rgba(229, 57, 53, 0.06)',
  todo: 'rgba(0, 0, 0, 0.03)',
  empty: 'transparent',
};

export const CHIP_BG: Record<Status, string> = {
  done: 'rgba(76, 175, 80, 0.15)',
  wip: 'rgba(255, 152, 0, 0.15)',
  blocked: 'rgba(229, 57, 53, 0.12)',
  todo: 'rgba(0, 0, 0, 0.06)',
  empty: 'transparent',
};

export const STORAGE_KEY = 'courtney-matrix-data';

const STATUS_PRIORITY: Record<Status, number> = {
  blocked: 0,
  todo: 1,
  wip: 2,
  done: 3,
  empty: -1,
};

export function deriveTaskStatus(cells: Record<string, Status>): Status {
  const statuses = Object.values(cells).filter(s => s !== 'empty');
  if (statuses.length === 0) return 'todo';
  let lowest: Status = 'done';
  for (const s of statuses) {
    if (STATUS_PRIORITY[s] < STATUS_PRIORITY[lowest]) {
      lowest = s;
    }
  }
  return lowest;
}
