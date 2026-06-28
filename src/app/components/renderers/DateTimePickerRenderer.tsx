import React, { useState, useMemo, useRef, useEffect } from "react";

export default function DateTimePickerRenderer({ component }: { component: any }) {
  const { label, required, placeholderDate, placeholderTime } = component.properties;

  // Calendar States
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [viewDate, setViewDate] = useState<Date>(new Date());
  
  // Time States
  const [hour, setHour] = useState<string>("12");
  const [minute, setMinute] = useState<string>("00");
  const [ampm, setAmpm] = useState<string>("AM");
  const [showTimeDropdown, setShowTimeDropdown] = useState<boolean>(false);
  const [timeSelected, setTimeSelected] = useState<boolean>(false);

  const calendarRef = useRef<HTMLDivElement>(null);
  const timeDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside listener to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) {
        setShowTimeDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calendar Helpers
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

  const formattedTime = timeSelected ? `${hour}:${minute} ${ampm}` : "";

  // Generate calendar grid array
  const calendarCells = useMemo(() => {
    const cells = [];
    // Padding cells
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(null);
    }
    // Month days
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push(i);
    }
    return cells;
  }, [firstDayIndex, daysInMonth]);

  return (
    <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 shadow-sm relative">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {label || "Date & Time Picker"}
        {required && <span className="text-red-500 ml-1 font-bold">*</span>}
      </label>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Date Selector Overlay */}
        <div className="flex-1 relative" ref={calendarRef}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowCalendar(!showCalendar);
              setShowTimeDropdown(false);
            }}
            className="flex items-center justify-between pl-3 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors select-none"
          >
            <span className={formattedDate ? "text-gray-900 dark:text-gray-100" : "text-gray-400"}>
              {formattedDate || placeholderDate || "Select Date"}
            </span>
            <span className="text-gray-400">📅</span>
          </div>

          {showCalendar && (
            <div className="absolute left-0 mt-1 z-30 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 w-72 select-none">
              {/* Header */}
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

              {/* Day Labels */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500 mb-2">
                <div>Su</div>
                <div>Mo</div>
                <div>Tu</div>
                <div>We</div>
                <div>Th</div>
                <div>Fr</div>
                <div>Sa</div>
              </div>

              {/* Grid Cells */}
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

        {/* Time Selector Overlay */}
        <div className="flex-1 relative" ref={timeDropdownRef}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowTimeDropdown(!showTimeDropdown);
              setShowCalendar(false);
            }}
            className="flex items-center justify-between pl-3 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors select-none"
          >
            <span className={formattedTime ? "text-gray-900 dark:text-gray-100" : "text-gray-400"}>
              {formattedTime || placeholderTime || "Select Time"}
            </span>
            <span className="text-gray-400">🕒</span>
          </div>

          {showTimeDropdown && (
            <div className="absolute right-0 mt-1 z-30 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 w-60 select-none">
              <div className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 text-center">
                Set Time
              </div>
              <div className="flex items-center justify-center gap-2 mb-4">
                {/* Hours Dropdown */}
                <select
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none"
                >
                  {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((hr) => (
                    <option key={hr} value={hr}>{hr}</option>
                  ))}
                </select>
                <span className="text-gray-500 font-bold">:</span>
                {/* Minutes Dropdown */}
                <select
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none"
                >
                  {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map((min) => (
                    <option key={min} value={min}>{min}</option>
                  ))}
                </select>
                {/* AM/PM Select */}
                <div className="flex rounded border border-gray-300 dark:border-gray-700 overflow-hidden text-xs">
                  <button
                    onClick={(e) => { e.stopPropagation(); setAmpm("AM"); }}
                    className={`px-2.5 py-1.5 font-bold transition-all ${
                      ampm === "AM"
                        ? "bg-[#005eb8] text-white"
                        : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    AM
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setAmpm("PM"); }}
                    className={`px-2.5 py-1.5 font-bold transition-all ${
                      ampm === "PM"
                        ? "bg-[#005eb8] text-white"
                        : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTimeSelected(true);
                  setShowTimeDropdown(false);
                }}
                className="w-full py-1.5 text-center text-xs font-bold text-white bg-[#005eb8] hover:bg-[#003087] rounded transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
