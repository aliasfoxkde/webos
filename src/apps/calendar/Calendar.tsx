import { useState, useCallback, useEffect } from 'react';
import {
  getDaysInMonth,
  getFirstDayOfWeek,
  isToday,
  formatMonthYear,
} from './calendar-utils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STORAGE_KEY = 'webos-calendar-events';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
}

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function loadEvents(): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistEvents(events: CalendarEvent[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function Calendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>(loadEvents);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Persist events to localStorage
  useEffect(() => {
    persistEvents(events);
  }, [events]);

  const goToPrevMonth = useCallback(() => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
    setSelectedDay(null);
  }, [month]);

  const goToNextMonth = useCallback(() => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
    setSelectedDay(null);
  }, [month]);

  const goToToday = useCallback(() => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth());
    setSelectedDay(now.getDate());
  }, []);

  const eventsForDay = useCallback((day: number) => {
    const key = dateKey(year, month, day);
    return events.filter((e) => e.date === key);
  }, [year, month, events]);

  const handleDayClick = useCallback((day: number) => {
    setSelectedDay((prev) => (prev === day ? null : day));
  }, []);

  const handleAddEvent = useCallback((day: number) => {
    const key = dateKey(year, month, day);
    const title = prompt(`Add event for ${key}:`);
    if (title && title.trim()) {
      const newEvent: CalendarEvent = {
        id: crypto.randomUUID(),
        title: title.trim(),
        date: key,
      };
      setEvents((prev) => [...prev, newEvent]);
    }
  }, [year, month]);

  const handleDeleteEvent = useCallback((eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  }, []);

  // Build the grid cells (empty cells for days before the 1st)
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  const selectedEvents = selectedDay ? eventsForDay(selectedDay) : [];

  const navBtnClass =
    'px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer';

  return (
    <div
      className="flex h-full"
      style={{ backgroundColor: 'var(--os-bg-primary)' }}
    >
      {/* Calendar panel */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-4 py-3"
          style={{
            backgroundColor: 'var(--os-bg-secondary)',
            borderColor: 'var(--os-border)',
          }}
        >
          <button
            className={navBtnClass}
            style={{
              color: 'var(--os-text-secondary)',
              backgroundColor: 'var(--os-bg-tertiary)',
            }}
            onClick={goToPrevMonth}
          >
            &lt;
          </button>

          <div className="flex items-center gap-3">
            <span
              className="text-sm font-semibold"
              style={{ color: 'var(--os-text-primary)' }}
            >
              {formatMonthYear(year, month)}
            </span>
            <button
              className={navBtnClass}
              style={{
                color: 'var(--os-accent)',
                backgroundColor: 'var(--os-accent-muted)',
              }}
              onClick={goToToday}
            >
              Today
            </button>
          </div>

          <button
            className={navBtnClass}
            style={{
              color: 'var(--os-text-secondary)',
              backgroundColor: 'var(--os-bg-tertiary)',
            }}
            onClick={goToNextMonth}
          >
            &gt;
          </button>
        </div>

        {/* Calendar grid */}
        <div className="flex-1 p-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold py-1"
                style={{ color: 'var(--os-text-muted)' }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} />;
              }

              const todayHighlight = isToday(year, month, day);
              const dayEvents = eventsForDay(day);
              const isSelected = selectedDay === day;

              return (
                <div
                  key={day}
                  className="flex flex-col items-center justify-center h-9 rounded-lg text-sm cursor-pointer transition-colors relative"
                  style={{
                    color: todayHighlight
                      ? 'var(--os-accent)'
                      : 'var(--os-text-primary)',
                    backgroundColor: isSelected
                      ? 'var(--os-accent-muted)'
                      : todayHighlight
                        ? 'var(--os-accent-muted)'
                        : 'transparent',
                    fontWeight: todayHighlight || isSelected ? 700 : 400,
                  }}
                  onClick={() => handleDayClick(day)}
                  onDoubleClick={() => handleAddEvent(day)}
                  title={dayEvents.length > 0 ? dayEvents.map((e) => e.title).join(', ') : undefined}
                >
                  {day}
                  {/* Event dot indicator */}
                  {dayEvents.length > 0 && (
                    <div
                      className="absolute bottom-0.5 w-1 h-1 rounded-full"
                      style={{ backgroundColor: 'var(--os-accent)' }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <p
            className="text-[10px] mt-3 text-center"
            style={{ color: 'var(--os-text-muted)' }}
          >
            Click a day to view events. Double-click to add.
          </p>
        </div>
      </div>

      {/* Events sidebar */}
      {selectedDay && (
        <div
          className="w-48 border-l flex flex-col shrink-0"
          style={{
            borderColor: 'var(--os-border)',
            backgroundColor: 'var(--os-bg-secondary)',
          }}
        >
          <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--os-border)' }}>
            <span className="text-xs font-semibold" style={{ color: 'var(--os-text-primary)' }}>
              {dateKey(year, month, selectedDay)}
            </span>
            <button
              className="ml-2 px-1.5 py-0.5 text-[10px] rounded cursor-pointer"
              style={{
                color: 'var(--os-accent)',
                backgroundColor: 'var(--os-accent-muted)',
              }}
              onClick={() => handleAddEvent(selectedDay)}
            >
              + Add
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {selectedEvents.length === 0 ? (
              <p className="text-[10px]" style={{ color: 'var(--os-text-muted)' }}>
                No events
              </p>
            ) : (
              selectedEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between gap-1 rounded px-2 py-1 mb-1 group"
                  style={{ backgroundColor: 'var(--os-bg-tertiary)' }}
                >
                  <span
                    className="text-[11px] truncate"
                    style={{ color: 'var(--os-text-primary)' }}
                  >
                    {ev.title}
                  </span>
                  <button
                    className="opacity-0 group-hover:opacity-100 text-[10px] w-4 h-4 flex items-center justify-center rounded-full shrink-0 cursor-pointer"
                    style={{ color: 'white', backgroundColor: 'rgba(239,68,68,0.8)' }}
                    onClick={() => handleDeleteEvent(ev.id)}
                  >
                    x
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
