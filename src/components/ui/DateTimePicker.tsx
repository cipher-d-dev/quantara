import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface DateTimePickerProps {
  value: string; // "YYYY-MM-DDTHH:mm"
  onChange: (value: string) => void;
  min?: string;
  placeholder?: string;
  'aria-labelledby'?: string;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function pad(n: number) { return String(n).padStart(2, '0'); }

function toLocal(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function DateTimePicker({ value, onChange, min, placeholder = 'Select date & time', 'aria-labelledby': ariaLabelledBy }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [viewDate, setViewDate] = useState(() => {
    const base = value ? new Date(value) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [time, setTime] = useState(() => {
    if (value) { const d = new Date(value); return { h: pad(d.getHours()), m: pad(d.getMinutes()) }; }
    return { h: '12', m: '00' };
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const minDate = min ? new Date(min) : null;
  const selectedDate = value ? new Date(value) : null;

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropH = 360; // approximate dropdown height
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow > dropH ? rect.bottom + 6 : rect.top - dropH - 6;
    setDropdownPos({ top: top + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
  }, []);

  const openPicker = () => {
    updatePosition();
    setOpen(true);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || dropdownRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      document.removeEventListener('mousedown', handler);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = viewDate.getDay();

  const selectDay = (day: number) => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day, parseInt(time.h), parseInt(time.m));
    onChange(toLocal(d));
  };

  const updateTime = (field: 'h' | 'm', raw: string) => {
    const max = field === 'h' ? 23 : 59;
    const num = Math.min(max, Math.max(0, parseInt(raw) || 0));
    const next = { ...time, [field]: pad(num) };
    setTime(next);
    if (selectedDate) {
      const d = new Date(selectedDate);
      d.setHours(parseInt(next.h), parseInt(next.m));
      onChange(toLocal(d));
    }
  };

  const isDayDisabled = (day: number) => {
    if (!minDate) return false;
    return new Date(viewDate.getFullYear(), viewDate.getMonth(), day, 23, 59) < minDate;
  };

  const isDaySelected = (day: number) =>
    !!selectedDate &&
    selectedDate.getFullYear() === viewDate.getFullYear() &&
    selectedDate.getMonth() === viewDate.getMonth() &&
    selectedDate.getDate() === day;

  const displayValue = selectedDate
    ? selectedDate.toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })
    : '';

  const dropdown = open ? createPortal(
    <div
      ref={dropdownRef}
      style={{ position: 'absolute', top: dropdownPos.top, left: dropdownPos.left, width: Math.max(dropdownPos.width, 288), zIndex: 9999 }}
      className="rounded-2xl bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xl p-4"
    >
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
          className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer">
          <ChevronLeft className="w-4 h-4 text-surface-600 dark:text-surface-400" />
        </button>
        <span className="text-sm font-semibold text-surface-900 dark:text-surface-100">
          {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
        </span>
        <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
          className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer">
          <ChevronRight className="w-4 h-4 text-surface-600 dark:text-surface-400" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => <div key={d} className="text-center text-[10px] font-semibold text-surface-400 dark:text-surface-500 py-1">{d}</div>)}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const disabled = isDayDisabled(day);
          const selected = isDaySelected(day);
          return (
            <button key={day} type="button" disabled={disabled} onClick={() => selectDay(day)}
              className={`h-8 w-full rounded-lg text-xs font-medium transition-colors
                ${selected ? 'bg-brand-500 text-white' : ''}
                ${!selected && !disabled ? 'hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-900 dark:text-surface-100 cursor-pointer' : ''}
                ${disabled ? 'text-surface-300 dark:text-surface-700 cursor-not-allowed' : ''}
              `}
            >{day}</button>
          );
        })}
      </div>

      {/* Time row */}
      <div className="mt-3 pt-3 border-t border-surface-200 dark:border-surface-800 flex items-center justify-center gap-2">
        <Clock className="w-4 h-4 text-surface-400" />
        <input type="number" min={0} max={23} value={time.h}
          onChange={e => updateTime('h', e.target.value)} onBlur={e => updateTime('h', e.target.value)}
          className="w-12 h-8 text-center rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100 text-sm font-semibold border-none focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
        <span className="text-surface-600 dark:text-surface-400 font-bold">:</span>
        <input type="number" min={0} max={59} value={time.m}
          onChange={e => updateTime('m', e.target.value)} onBlur={e => updateTime('m', e.target.value)}
          className="w-12 h-8 text-center rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100 text-sm font-semibold border-none focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
        <button type="button" onClick={() => setOpen(false)}
          className="ml-2 px-3 h-8 rounded-lg bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600 transition-colors cursor-pointer">
          Done
        </button>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={openPicker}
        aria-labelledby={ariaLabelledBy}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`w-full h-11 px-3.5 rounded-xl bg-surface-0 dark:bg-surface-900 border text-left flex items-center justify-between transition-colors cursor-pointer
          ${open ? 'border-brand-500 ring-2 ring-brand-500/30' : 'border-surface-200 dark:border-surface-800 hover:border-surface-300 dark:hover:border-surface-700'}`}
      >
        <span className={`text-sm ${displayValue ? 'text-surface-900 dark:text-surface-100' : 'text-surface-400'}`}>
          {displayValue || placeholder}
        </span>
        <Clock className="w-4 h-4 text-surface-400 shrink-0" />
      </button>
      {dropdown}
    </div>
  );
}
