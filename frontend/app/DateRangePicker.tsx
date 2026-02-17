'use client';

import { useState, useRef, useEffect } from 'react';
import { format, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from 'date-fns';

// Define DateRange type locally (matches react-day-picker's interface)
interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
}

export interface DateRangeValue {
  from: Date;
  to: Date;
  selectValue?: string;
}

interface QuickSelectOption {
  label: string;
  value: string;
  getRange: () => { from: Date; to: Date };
}

const quickSelectOptions: QuickSelectOption[] = [
  {
    label: 'Today',
    value: 'today',
    getRange: () => ({
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: 'Yesterday',
    value: 'yesterday',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 1)),
      to: endOfDay(subDays(new Date(), 1)),
    }),
  },
  {
    label: 'Last 7 Days',
    value: 'last7',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 6)),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: 'Last 14 Days',
    value: 'last14',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 13)),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: 'Last 30 Days',
    value: 'last30',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 29)),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: 'Last 60 Days',
    value: 'last60',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 59)),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: 'Last 90 Days',
    value: 'last90',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 89)),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: 'This Week',
    value: 'thisWeek',
    getRange: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 0 }),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: 'Last Week',
    value: 'lastWeek',
    getRange: () => ({
      from: startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 0 }),
      to: endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 0 }),
    }),
  },
  {
    label: 'This Month',
    value: 'thisMonth',
    getRange: () => ({
      from: startOfMonth(new Date()),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: 'Last Month',
    value: 'lastMonth',
    getRange: () => ({
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    }),
  },
];

interface CustomDateRangePickerProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
}

export function CustomDateRangePicker({ value, onChange }: CustomDateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange | undefined>({
    from: value.from,
    to: value.to,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync temp range with value
  useEffect(() => {
    setTempRange({ from: value.from, to: value.to });
  }, [value.from, value.to]);

  const handleQuickSelect = (option: QuickSelectOption) => {
    const range = option.getRange();
    onChange({
      from: range.from,
      to: range.to,
      selectValue: option.value,
    });
    setIsOpen(false);
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    setTempRange(range);

    // If both dates are selected, apply the range
    if (range?.from && range?.to) {
      onChange({
        from: startOfDay(range.from),
        to: endOfDay(range.to),
        selectValue: 'custom',
      });
      setIsOpen(false);
    }
  };

  const getDisplayLabel = (): string => {
    const option = quickSelectOptions.find(o => o.value === value.selectValue);
    if (option) {
      return option.label;
    }
    return 'Custom Range';
  };

  const formatDateRange = (): string => {
    if (!value.from || !value.to) return 'Select date range';

    const fromStr = format(value.from, 'MMM d, yyyy');
    const toStr = format(value.to, 'MMM d, yyyy');

    if (fromStr === toStr) {
      return fromStr;
    }
    return `${fromStr} - ${toStr}`;
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        {/* Calendar Icon */}
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>

        {/* Date Display */}
        <div className="flex flex-col items-start">
          <span className="text-xs font-medium text-gray-500">{getDisplayLabel()}</span>
          <span className="text-sm font-semibold text-gray-900">{formatDateRange()}</span>
        </div>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999]">
          <div className="flex">
            {/* Left Sidebar - Quick Selects */}
            <div className="w-44 border-r border-gray-200 py-3 bg-gray-50 rounded-l-xl">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Quick Select
              </div>
              <div className="space-y-0.5 px-2">
                {quickSelectOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleQuickSelect(option)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      value.selectValue === option.value
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Panel - Calendar */}
            <div className="p-4">
              <div className="text-sm font-medium text-gray-700 mb-4">
                Or select custom range:
              </div>

              {/* Custom Calendar Implementation */}
              <div className="flex gap-8">
                <CalendarMonth
                  month={tempRange?.from ? new Date(tempRange.from.getFullYear(), tempRange.from.getMonth(), 1) : new Date()}
                  selected={tempRange}
                  onSelect={handleCalendarSelect}
                  offset={0}
                />
                <CalendarMonth
                  month={tempRange?.from ? new Date(tempRange.from.getFullYear(), tempRange.from.getMonth() + 1, 1) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)}
                  selected={tempRange}
                  onSelect={handleCalendarSelect}
                  offset={1}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Custom Calendar Month Component
interface CalendarMonthProps {
  month: Date;
  selected: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
  offset: number;
}

function CalendarMonth({ month, selected, onSelect, offset }: CalendarMonthProps) {
  const [displayMonth, setDisplayMonth] = useState(month);

  // Update display month when selected range changes
  useEffect(() => {
    if (selected?.from) {
      const newMonth = new Date(selected.from.getFullYear(), selected.from.getMonth() + offset, 1);
      setDisplayMonth(newMonth);
    }
  }, [selected?.from, offset]);

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const days = getDaysInMonth(displayMonth);
  const today = startOfDay(new Date());

  const isSelected = (date: Date) => {
    if (!selected?.from) return false;
    const d = startOfDay(date);
    const from = startOfDay(selected.from);
    const to = selected.to ? startOfDay(selected.to) : from;
    return d.getTime() === from.getTime() || d.getTime() === to.getTime();
  };

  const isInRange = (date: Date) => {
    if (!selected?.from || !selected?.to) return false;
    const d = startOfDay(date);
    const from = startOfDay(selected.from);
    const to = startOfDay(selected.to);
    return d > from && d < to;
  };

  const isRangeStart = (date: Date) => {
    if (!selected?.from) return false;
    return startOfDay(date).getTime() === startOfDay(selected.from).getTime();
  };

  const isRangeEnd = (date: Date) => {
    if (!selected?.to) return false;
    return startOfDay(date).getTime() === startOfDay(selected.to).getTime();
  };

  const isToday = (date: Date) => {
    return startOfDay(date).getTime() === today.getTime();
  };

  const isDisabled = (date: Date) => {
    return date > today;
  };

  const handleDayClick = (date: Date) => {
    if (isDisabled(date)) return;

    if (!selected?.from || (selected.from && selected.to)) {
      // Start new selection
      onSelect({ from: date, to: undefined });
    } else {
      // Complete the range
      if (date < selected.from) {
        onSelect({ from: date, to: selected.from });
      } else {
        onSelect({ from: selected.from, to: date });
      }
    }
  };

  const prevMonth = () => {
    setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1));
  };

  return (
    <div className="w-64">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          type="button"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-gray-900">
          {format(displayMonth, 'MMMM yyyy')}
        </span>
        <button
          onClick={nextMonth}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          type="button"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day of Week Headers */}
      <div className="grid grid-cols-7 mb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="h-9 w-9" />;
          }

          const disabled = isDisabled(date);
          const selected = isSelected(date);
          const inRange = isInRange(date);
          const rangeStart = isRangeStart(date);
          const rangeEnd = isRangeEnd(date);
          const todayDate = isToday(date);

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => handleDayClick(date)}
              disabled={disabled}
              className={`
                h-9 w-9 flex items-center justify-center text-sm transition-colors
                ${disabled ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
                ${!disabled && !selected && !inRange ? 'hover:bg-gray-100' : ''}
                ${selected ? 'bg-blue-600 text-white font-medium' : ''}
                ${rangeStart && !rangeEnd ? 'rounded-l-md' : ''}
                ${rangeEnd && !rangeStart ? 'rounded-r-md' : ''}
                ${rangeStart && rangeEnd ? 'rounded-md' : ''}
                ${inRange ? 'bg-blue-50 text-blue-900' : ''}
                ${todayDate && !selected ? 'bg-orange-100 text-orange-900 font-semibold rounded-md' : ''}
                ${!selected && !inRange && !todayDate && !disabled ? 'text-gray-900' : ''}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
