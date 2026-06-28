import React, { useState, useMemo, useRef, useEffect } from "react";

export default function DatePickerRenderer({ component, previewMode = false }: { component: any, previewMode?: boolean }) {
  const { label, required, placeholder } = component.properties;

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [viewDate, setViewDate] = useState<Date>(new Date());

  const calendarRef = useRef<HTMLDivElement>(null);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate();
  }, [year, month]);

  const firstDayIndex = useMemo(() => {
    return new Date(year, month, 1).getDay();
  }, [year, month]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleDateSelect = (day: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(new Date(year, month, day));
    setShowCalendar(false);
  };

  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "";

  const calendarCells = useMemo(() => {
    const cells = [];
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push(i);
    }
    return cells;
  }, [firstDayIndex, daysInMonth]);

  return (
    <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 shadow-sm relative">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {label || "Date Picker"}
        {required && <span className="text-red-500 ml-1 font-bold">*</span>}
      </label>

      <div className="relative" ref={calendarRef}>
        <div
          onClick={(e) => {
            if (!previewMode) return;
            e.stopPropagation();
            setShowCalendar(!showCalendar);
          }}
          className={`flex items-center justify-between pl-3 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-sm select-none transition-colors ${
            previewMode 
              ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" 
              : "cursor-default"
          }`}
        >
          <span className={formattedDate ? "text-gray-900 dark:text-gray-100" : "text-gray-400"}>
            {formattedDate || placeholder || "Select Date"}
          </span>
          <span className="text-gray-400">📅</span>
        </div>

        {showCalendar && (
          <div className="absolute left-0 mt-1 z-30 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 w-72 select-none">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevMonth}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-600 dark:text-gray-400"
              >
                ◀
              </button>
              <div className="text-sm font-bold text-gray-800 dark:text-gray-200">
                {monthNames[month]} {year}
              </div>
              <button
                onClick={handleNextMonth}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-600 dark:text-gray-400"
              >
                ▶
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500 mb-2">
              <div>Su</div>
              <div>Mo</div>
              <div>Tu</div>
              <div>We</div>
              <div>Th</div>
              <div>Fr</div>
              <div>Sa</div>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="h-8 w-8" />;
                }

                const isSelected =
                  selectedDate &&
                  selectedDate.getDate() === day &&
                  selectedDate.getMonth() === month &&
                  selectedDate.getFullYear() === year;

                const isToday =
                  new Date().getDate() === day &&
                  new Date().getMonth() === month &&
                  new Date().getFullYear() === year;

                return (
                  <button
                    key={`day-${day}`}
                    onClick={(e) => handleDateSelect(day, e)}
                    className={`h-8 w-8 text-xs font-semibold rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-[#005eb8] text-white"
                        : isToday
                        ? "border border-[#005eb8] text-[#005eb8] hover:bg-blue-50"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
