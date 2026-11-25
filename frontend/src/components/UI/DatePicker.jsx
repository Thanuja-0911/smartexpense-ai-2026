import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DatePicker = ({
  label,
  value,
  onChange,
  error,
  helperText,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse initial date from YYYY-MM-DD
  const parseDate = (val) => {
    if (!val) {
      const now = new Date();
      return {
        year: now.getFullYear(),
        month: now.getMonth(),
        day: now.getDate(),
      };
    }
    const parts = val.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return { year: y, month: m, day: d };
      }
    }
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate(),
    };
  };

  const parsed = parseDate(value);
  const [displayYear, setDisplayYear] = useState(parsed.year);
  const [displayMonth, setDisplayMonth] = useState(parsed.month);

  // Keep display year/month in sync when value changes externally
  useEffect(() => {
    const p = parseDate(value);
    setDisplayYear(p.year);
    setDisplayMonth(p.month);
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(displayYear, displayMonth, 1).getDay();

  // Generate Year options (e.g. 2015 to 2035)
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 10; y <= currentYear + 10; y++) {
    years.push(y);
  }

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear((prev) => prev - 1);
    } else {
      setDisplayMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear((prev) => prev + 1);
    } else {
      setDisplayMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day) => {
    const mStr = String(displayMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const formatted = `${displayYear}-${mStr}-${dStr}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const handleSelectToday = (e) => {
    e.stopPropagation();
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();
    const mStr = String(m + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    onChange(`${y}-${mStr}-${dStr}`);
    setDisplayYear(y);
    setDisplayMonth(m);
    setIsOpen(false);
  };

  const today = new Date();
  const isToday = (day) =>
    today.getFullYear() === displayYear &&
    today.getMonth() === displayMonth &&
    today.getDate() === day;

  const isSelected = (day) =>
    parsed.year === displayYear &&
    parsed.month === displayMonth &&
    parsed.day === day;

  // Format display text: DD-MM-YYYY
  const formatDisplayText = () => {
    if (!value) return 'Select date';
    const mStr = String(parsed.month + 1).padStart(2, '0');
    const dStr = String(parsed.day).padStart(2, '0');
    return `${dStr}-${mStr}-${parsed.year}`;
  };

  return (
    <div className={`w-full space-y-1.5 relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </label>
      )}

      {/* Input Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between bg-slate-900/80 border ${
          error
            ? 'border-rose-500 ring-1 ring-rose-500'
            : isOpen
            ? 'border-brand-500 ring-2 ring-brand-500/30'
            : 'border-slate-800 hover:border-slate-700'
        } rounded-xl px-3.5 py-2.5 text-sm text-slate-100 transition-all text-left focus:outline-none`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Calendar className="w-4 h-4 text-brand-400 shrink-0" />
          <span className="font-medium text-slate-100 truncate">
            {formatDisplayText()}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? 'rotate-180 text-brand-400' : ''
          }`}
        />
      </button>

      {/* Calendar Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 w-full max-w-sm backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header with Month and Year Selectors */}
          <div className="flex items-center justify-between gap-1.5 mb-3 pb-2.5 border-b border-slate-800">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-100 rounded-lg transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 flex-1 justify-center">
              {/* Month Selector */}
              <select
                value={displayMonth}
                onChange={(e) => setDisplayMonth(parseInt(e.target.value, 10))}
                className="bg-slate-800 border border-slate-700 text-slate-100 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx} className="bg-slate-900 text-slate-100">
                    {name}
                  </option>
                ))}
              </select>

              {/* Year Selector */}
              <select
                value={displayYear}
                onChange={(e) => setDisplayYear(parseInt(e.target.value, 10))}
                className="bg-slate-800 border border-slate-700 text-slate-100 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-slate-900 text-slate-100">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-100 rounded-lg transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {WEEKDAYS.map((day) => (
              <span
                key={day}
                className="text-[11px] font-semibold text-slate-400 py-1"
              >
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty slots before first day of month */}
            {Array.from({ length: firstDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="h-8 w-8" />
            ))}

            {/* Day buttons */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const selected = isSelected(day);
              const current = isToday(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-8 w-8 rounded-lg text-xs font-medium transition-all flex items-center justify-center mx-auto ${
                    selected
                      ? 'bg-brand-500 text-white font-bold shadow-md shadow-brand-500/30'
                      : current
                      ? 'border border-brand-400 text-brand-300 hover:bg-slate-800'
                      : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Controls: Today & Close */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors px-2 py-1 rounded hover:bg-slate-800/60"
            >
              Select Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors px-2 py-1 rounded hover:bg-slate-800/60"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
};
