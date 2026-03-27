import { useState, useEffect, useCallback } from 'react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

type Filter = 'all' | 'active' | 'completed';

const STORAGE_KEY = 'webos-tasks';

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Task[];
  } catch {
    // ignore
  }
  return [];
}

function saveTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
];

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const addTask = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setTasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text, completed: false },
    ]);
    setInput('');
  }, [input]);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div
      className="flex h-full flex-col"
      style={{ backgroundColor: 'var(--os-bg-primary)' }}
    >
      {/* Add task input */}
      <div
        className="flex gap-2 border-b px-4 py-3"
        style={{
          borderColor: 'var(--os-border)',
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="Add a task..."
          className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
          style={{
            borderColor: 'var(--os-border)',
            backgroundColor: 'var(--os-bg-tertiary)',
            color: 'var(--os-text-primary)',
          }}
        />
        <button
          className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors cursor-pointer"
          style={{ backgroundColor: 'var(--os-accent)' }}
          onClick={addTask}
        >
          Add
        </button>
      </div>

      {/* Filter tabs + count */}
      <div
        className="flex items-center justify-between border-b px-4 py-2"
        style={{
          backgroundColor: 'var(--os-bg-secondary)',
          borderColor: 'var(--os-border)',
        }}
      >
        <div className="flex gap-3">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="px-1 py-1 text-xs font-medium transition-colors cursor-pointer"
              style={{
                color:
                  filter === f.id
                    ? 'var(--os-accent)'
                    : 'var(--os-text-secondary)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span
          className="text-xs"
          style={{ color: 'var(--os-text-muted)' }}
        >
          {completedCount} of {tasks.length} completed
        </span>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <span
              className="text-3xl"
              style={{ color: 'var(--os-text-muted)' }}
            >
              {tasks.length === 0 ? '\uD83D\uDCCB' : '\u2705'}
            </span>
            <span
              className="text-sm"
              style={{ color: 'var(--os-text-secondary)' }}
            >
              {tasks.length === 0
                ? 'No tasks yet. Add one above!'
                : 'No matching tasks.'}
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
                style={{
                  borderColor: 'var(--os-border)',
                  backgroundColor: 'var(--os-bg-secondary)',
                }}
              >
                <button
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors cursor-pointer"
                  style={{
                    borderColor: task.completed
                      ? 'var(--os-accent)'
                      : 'var(--os-border)',
                    backgroundColor: task.completed
                      ? 'var(--os-accent)'
                      : 'transparent',
                  }}
                  onClick={() => toggleTask(task.id)}
                  aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {task.completed && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6L5 9L10 3"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>

                <span
                  className="flex-1 text-sm"
                  style={{
                    color: task.completed
                      ? 'var(--os-text-muted)'
                      : 'var(--os-text-primary)',
                    textDecoration: task.completed ? 'line-through' : 'none',
                  }}
                >
                  {task.text}
                </span>

                <button
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded transition-colors cursor-pointer"
                  style={{
                    color: 'var(--os-text-muted)',
                  }}
                  onClick={() => deleteTask(task.id)}
                  title="Delete task"
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = 'var(--os-error)';
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--os-bg-tertiary)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = 'var(--os-text-muted)';
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
