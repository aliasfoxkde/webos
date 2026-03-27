import { useState, useCallback } from 'react';
import {
  getDaysInMonth,
  getFirstDayOfWeek,
  isToday,
  formatMonthYear,
} from './calendar-utils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Calendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const goToPrevMonth = useCallback(() => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }, [month]);

  const goToNextMonth = useCallback(() => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }, [month]);

  const goToToday = useCallback(() => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  }, []);

  // Build the grid cells (empty cells for days before the 1st)
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  const navBtnClass =
    'px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer';

  return (
    <div
      className="flex h-full flex-col"
      style={{ backgroundColor: 'var(--os-bg-primary)' }}
    >
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

            return (
              <div
                key={day}
                className="flex items-center justify-center h-9 rounded-lg text-sm cursor-default transition-colors"
                style={{
                  color: todayHighlight
                    ? 'var(--os-accent)'
                    : 'var(--os-text-primary)',
                  backgroundColor: todayHighlight
                    ? 'var(--os-accent-muted)'
                    : 'transparent',
                  fontWeight: todayHighlight ? 700 : 400,
                }}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
