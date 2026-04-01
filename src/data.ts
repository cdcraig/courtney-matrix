export type Status = 'done' | 'wip' | 'review' | 'blocked' | 'deferred' | 'todo' | 'empty';

export const STATUS_ORDER: Status[] = ['done', 'wip', 'review', 'blocked', 'deferred', 'todo', 'empty'];

export function nextStatus(s: Status): Status {
  const i = STATUS_ORDER.indexOf(s);
  return STATUS_ORDER[(i + 1) % STATUS_ORDER.length];
}

export interface Column {
  id: string;
  name: string;
  subtitle: string;
  status: Status;
}

export interface Task {
  id: string;
  name: string;
  status: Status;
  cells: Record<string, Status>; // column id -> status
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
  separatorAfter: number; // index after which to show separator
  groups: Group[];
}

let _id = 0;
function id(prefix: string) {
  return `${prefix}-${++_id}`;
}

export function createDefaultData(): MatrixData {
  const cols: Column[] = [
    { id: 'claude', name: 'Claude', subtitle: 'MCP', status: 'wip' },
    { id: 'chatgpt', name: 'ChatGPT', subtitle: 'MCP', status: 'review' },
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
      name: 'MCP / embedded UI',
      tasks: [
        { id: id('t'), name: 'Embedded UI / MCP cards', status: 'done', cells: cellsFromArr(['done', 'done', null, null, null, null, 'done', null]) },
        { id: id('t'), name: 'Thinking modal', status: 'done', cells: cellsFromArr([null, null, null, null, null, null, 'done', null]) },
        { id: id('t'), name: 'Loading animation', status: 'done', cells: cellsFromArr([null, null, null, null, null, null, 'done', null]) },
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
    {
      id: id('g'),
      name: 'Foundation layers',
      foundation: true,
      tasks: [
        { id: id('t'), name: 'Facility knowledge', status: 'blocked', foundation: true, cells: cellsFromArr(['blocked', 'blocked', 'blocked', 'blocked', 'blocked', 'blocked', 'blocked', 'blocked']) },
        { id: id('t'), name: 'Authentication', status: 'wip', foundation: true, cells: cellsFromArr(['deferred', 'deferred', 'deferred', 'todo', 'todo', 'todo', 'done', 'todo']) },
        { id: id('t'), name: 'CourtsApp knowledge', status: 'review', foundation: true, cells: cellsFromArr(['review', 'review', 'review', 'review', 'review', 'review', 'review', 'review']) },
      ],
    },
    {
      id: id('g'),
      name: 'Tools',
      foundation: true,
      tasks: [
        { id: id('t'), name: 'Search availability', status: 'done', foundation: true, cells: cellsFromArr(['done', 'done', 'done', 'done', 'done', 'done', 'done', 'done']) },
        { id: id('t'), name: 'Booking', status: 'done', foundation: true, cells: cellsFromArr(['done', 'done', 'done', 'done', 'done', 'done', 'done', 'done']) },
        { id: id('t'), name: 'Charge payments', status: 'deferred', foundation: true, cells: cellsFromArr(['deferred', 'deferred', 'deferred', 'deferred', 'deferred', 'deferred', 'todo', 'deferred']) },
        { id: id('t'), name: 'Account viewing', status: 'blocked', foundation: true, cells: cellsFromArr(['blocked', 'blocked', 'blocked', 'blocked', 'blocked', 'blocked', 'blocked', 'blocked']) },
        { id: id('t'), name: 'Account editing', status: 'deferred', foundation: true, cells: cellsFromArr(['deferred', 'deferred', 'deferred', 'done', 'done', 'done', 'done', 'deferred']) },
        { id: id('t'), name: 'Dynamic prompts per modality', status: 'done', foundation: true, cells: cellsFromArr(['done', 'done', 'done', 'done', 'done', 'done', 'done', 'done']) },
        { id: id('t'), name: 'Zendesk support tickets', status: 'done', foundation: true, cells: cellsFromArr(['done', 'done', 'done', 'done', 'done', 'done', 'done', 'done']) },
        { id: id('t'), name: 'General knowledge', status: 'done', foundation: true, cells: cellsFromArr(['done', 'done', 'done', 'done', 'done', 'done', 'done', 'done']) },
      ],
    },
  ];

  return {
    columns: cols,
    separatorAfter: 2, // after index 2 (3rd-party), separator before voice
    groups,
  };
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const STATUS_COLORS: Record<Status, string> = {
  done: '#4CAF50',
  wip: '#FF9800',
  review: '#5C6BC0',
  blocked: '#E53935',
  deferred: '#B0BEC5',
  todo: '#ccc',
  empty: 'transparent',
};

export const STATUS_LABELS: Record<Status, string> = {
  done: 'Done',
  wip: 'WIP',
  review: 'Review',
  blocked: 'Blocked',
  deferred: 'Deferred',
  todo: 'To do',
  empty: '',
};

export const CELL_BG: Record<Status, string> = {
  done: 'rgba(76, 175, 80, 0.10)',
  wip: 'rgba(255, 152, 0, 0.08)',
  review: 'rgba(92, 107, 188, 0.08)',
  blocked: 'rgba(229, 57, 53, 0.06)',
  deferred: 'rgba(0, 0, 0, 0.02)',
  todo: 'rgba(0, 0, 0, 0.03)',
  empty: 'transparent',
};

export const CHIP_BG: Record<Status, string> = {
  done: 'rgba(76, 175, 80, 0.15)',
  wip: 'rgba(255, 152, 0, 0.15)',
  review: 'rgba(92, 107, 188, 0.15)',
  blocked: 'rgba(229, 57, 53, 0.12)',
  deferred: 'rgba(176, 190, 197, 0.20)',
  todo: 'rgba(0, 0, 0, 0.06)',
  empty: 'transparent',
};

export const STORAGE_KEY = 'courtney-matrix-data';
