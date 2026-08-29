/**
 * ============================================================================
 * FILE: src/pages/calendar/CalendarPage.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Interactive Schedule & Planner Calendar with Live 5-Day Red Urgency Alerts.
 *
 * KEY FEATURES:
 *   1. Full Year, Month, Date, and Time Scheduling.
 *   2. Automatic 5-Day Red Alert Engine:
 *      - When a schedule date is within <= 5 days (or due today / overdue),
 *        it highlights in vibrant RED with countdown badges ("🔴 3 Days Left").
 *   3. Dynamic Month & Year Grid Navigator (supports any year from 2024 to 2030+).
 *   4. Urgent 5-Day Deadlines Quick Banner.
 *   5. Interactive Day Agenda with complete, delete, and add controls.
 *   6. Persistent LocalStorage synchronization via scheduleService.
 * ============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import Badge from '../../components/common/Badge';
import { 
  FiCalendar, 
  FiPlus, 
  FiChevronLeft, 
  FiChevronRight, 
  FiClock, 
  FiTag, 
  FiX, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiTrash2, 
  FiCheck,
  FiBell,
  FiZap,
  FiFilter,
  FiArrowRight,
  FiBookOpen,
  FiDollarSign,
  FiAward
} from 'react-icons/fi';
import { scheduleService, calculateDeadline, formatDateISO } from '../../services/scheduleService';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CATEGORY_CONFIG = {
  EXAM: { label: 'Exam / Quiz', color: '#ef4444', icon: FiAward, bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  STUDY: { label: 'Study Session', color: '#8b5cf6', icon: FiBookOpen, bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  EXPENSE: { label: 'Expense Due', color: '#ec4899', icon: FiDollarSign, bg: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
  ASSIGNMENT: { label: 'Assignment / Project', color: '#f97316', icon: FiZap, bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  MEETING: { label: 'Meeting / Review', color: '#06b6d4', icon: FiCalendar, bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  PERSONAL: { label: 'Personal Goal', color: '#10b981', icon: FiCheckCircle, bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
};

export const CalendarPage = () => {
  const now = new Date();

  // Current Calendar View Navigation (Year & Month)
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth()); // 0 - 11

  // Selected Date string 'YYYY-MM-DD'
  const [selectedDate, setSelectedDate] = useState(() => formatDateISO(now));

  // Category filter state
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'EXAM' | 'EXPENSE' | 'STUDY'

  // Schedule Events state loaded from service
  const [events, setEvents] = useState(() => scheduleService.getEvents());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);

  // Form State with full Year, Date, and Time
  const [formData, setFormData] = useState({
    title: '',
    targetDate: formatDateISO(now),
    targetTime: '10:00 AM',
    category: 'EXAM',
    priority: 'HIGH',
    notes: '',
    color: '#ef4444',
  });

  // Success Notification
  const [notification, setNotification] = useState('');

  // Reload events from service
  const reloadEvents = () => {
    setEvents(scheduleService.getEvents());
  };

  // --------------------------------------------------------------------------
  // DEADLINE & 5-DAY CRITICAL ALERT COMPUTATIONS
  // --------------------------------------------------------------------------
  const enrichedEvents = useMemo(() => {
    return events.map((ev) => {
      const deadline = calculateDeadline(ev.targetDate, ev.targetTime);
      return {
        ...ev,
        deadline,
      };
    });
  }, [events]);

  // Critical events reaching near <= 5 days or today or overdue
  const critical5DayEvents = useMemo(() => {
    return enrichedEvents
      .filter((ev) => !ev.completed && (ev.deadline.isDueSoon || ev.deadline.isToday || ev.deadline.isOverdue))
      .sort((a, b) => a.deadline.daysLeft - b.deadline.daysLeft);
  }, [enrichedEvents]);

  // Filtered list of events based on tab
  const displayedEvents = useMemo(() => {
    if (activeFilter === 'CRITICAL') {
      return critical5DayEvents;
    }
    if (activeFilter === 'ALL') {
      return enrichedEvents;
    }
    return enrichedEvents.filter((ev) => ev.category === activeFilter);
  }, [enrichedEvents, critical5DayEvents, activeFilter]);

  // Events on currently selected date
  const selectedDateEvents = useMemo(() => {
    return enrichedEvents.filter((ev) => ev.targetDate === selectedDate);
  }, [enrichedEvents, selectedDate]);

  // --------------------------------------------------------------------------
  // CALENDAR GRID CALCULATIONS
  // --------------------------------------------------------------------------
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 (Sun) to 6 (Sat)
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // 1. Previous Month Padding Days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonthDate = new Date(currentYear, currentMonth - 1, dayNum);
      const dateStr = formatDateISO(prevMonthDate);
      days.push({
        dayNum,
        dateStr,
        isCurrentMonth: false,
      });
    }

    // 2. Current Month Days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const currentDateObj = new Date(currentYear, currentMonth, d);
      const dateStr = formatDateISO(currentDateObj);
      days.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: true,
      });
    }

    // 3. Next Month Padding Days to fill grid to 35 or 42 cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let n = 1; n <= remainingCells; n++) {
      const nextMonthDate = new Date(currentYear, currentMonth + 1, n);
      const dateStr = formatDateISO(nextMonthDate);
      days.push({
        dayNum: n,
        dateStr,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Navigate Months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(formatDateISO(today));
  };

  // --------------------------------------------------------------------------
  // MODAL & EVENT ACTIONS
  // --------------------------------------------------------------------------
  const openAddModal = (defaultDate = null) => {
    setEditingEventId(null);
    setFormData({
      title: '',
      targetDate: defaultDate || selectedDate || formatDateISO(new Date()),
      targetTime: '10:00 AM',
      category: 'EXAM',
      priority: 'HIGH',
      notes: '',
      color: '#ef4444',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (ev) => {
    setEditingEventId(ev.id);
    setFormData({
      title: ev.title,
      targetDate: ev.targetDate,
      targetTime: ev.targetTime,
      category: ev.category,
      priority: ev.priority,
      notes: ev.notes || '',
      color: ev.color || '#8b5cf6',
    });
    setIsModalOpen(true);
  };

  const handleSaveEvent = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    scheduleService.saveEvent({
      id: editingEventId,
      ...formData,
    });

    reloadEvents();
    setIsModalOpen(false);
    showToast(editingEventId ? 'Schedule event updated!' : 'New schedule event added!');
  };

  const handleDeleteEvent = (id) => {
    scheduleService.deleteEvent(id);
    reloadEvents();
    showToast('Event removed from schedule');
  };

  const handleToggleComplete = (id) => {
    scheduleService.toggleComplete(id);
    reloadEvents();
  };

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  // Live preview in modal
  const modalDeadlinePreview = calculateDeadline(formData.targetDate, formData.targetTime);

  return (
    <div className="space-y-8 relative pb-12">
      {/* ---------------------------------------------------------------------- */}
      {/* TOAST NOTIFICATION                                                     */}
      {/* ---------------------------------------------------------------------- */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-slate-900/95 border border-purple-500/50 text-white text-sm shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5">
          <FiCheckCircle className="text-emerald-400 w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* PAGE HEADER & QUICK ACTIONS                                            */}
      {/* ---------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Schedule & Planner
            </h2>
            {critical5DayEvents.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-lg shadow-rose-950/40 animate-pulse">
                <FiBell className="w-3.5 h-3.5" />
                {critical5DayEvents.length} Due in ≤ 5 Days!
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Schedule deadlines with full Year, Date & Time · Auto 5-day red urgency countdown
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <GlassButton variant="glass" size="sm" onClick={handleJumpToToday}>
            Today
          </GlassButton>
          <GlassButton variant="primary" icon={FiPlus} onClick={() => openAddModal()}>
            + Schedule Event
          </GlassButton>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* 🔴 5-DAY CRITICAL ALERT BANNER (VIBRANT RED HIGHLIGHT)                  */}
      {/* ---------------------------------------------------------------------- */}
      {critical5DayEvents.length > 0 && (
        <div 
          className="relative rounded-3xl p-6 border shadow-2xl overflow-hidden transition-all"
          style={{
            background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.15) 0%, rgba(159, 18, 57, 0.25) 50%, rgba(30, 10, 20, 0.8) 100%)',
            borderColor: 'rgba(244, 63, 94, 0.6)',
            boxShadow: '0 0 50px rgba(225, 29, 72, 0.2), inset 0 0 30px rgba(225, 29, 72, 0.1)'
          }}
        >
          {/* Ambient Red Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-rose-600/20 blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center bg-rose-500/30 border border-rose-400/50 text-rose-300 shadow-lg shadow-rose-950">
                <FiAlertTriangle className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  5-Day Critical Countdown Alert
                </h3>
                <p className="text-xs text-rose-200/80">
                  The following items are within 5 days of their target date or due today!
                </p>
              </div>
            </div>
            <Badge variant="danger" className="text-xs px-3 py-1">
              🔴 Action Required
            </Badge>
          </div>

          {/* Cards Grid for Critical Events */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 relative z-10">
            {critical5DayEvents.map((ev) => (
              <div
                key={ev.id}
                onClick={() => setSelectedDate(ev.targetDate)}
                className="group p-4 rounded-2xl bg-black/40 hover:bg-black/60 border border-rose-500/40 hover:border-rose-400 transition-all cursor-pointer shadow-lg hover:shadow-rose-900/30 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-white group-hover:text-rose-200 transition-colors line-clamp-1">
                    {ev.title}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500 text-white shadow-md shadow-rose-950 animate-pulse whitespace-nowrap">
                    {ev.deadline.badgeText}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span className="flex items-center gap-1.5 text-rose-200 font-mono">
                    <FiCalendar className="w-3 h-3 text-rose-400" /> {ev.targetDate}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <FiClock className="w-3 h-3 text-rose-400" /> {ev.targetTime}
                  </span>
                </div>

                {ev.notes && (
                  <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                    "{ev.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* FILTER TABS                                                            */}
      {/* ---------------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            activeFilter === 'ALL'
              ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-900/40'
              : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
          }`}
        >
          All Events ({enrichedEvents.length})
        </button>

        <button
          onClick={() => setActiveFilter('CRITICAL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
            activeFilter === 'CRITICAL'
              ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-900/40'
              : 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-300'
          }`}
        >
          <span>🔴 Due in ≤ 5 Days</span>
          <span className="px-1.5 py-0.2 rounded-full bg-rose-950 text-[10px] font-bold">
            {critical5DayEvents.length}
          </span>
        </button>

        {Object.entries(CATEGORY_CONFIG).map(([catKey, conf]) => {
          const count = enrichedEvents.filter((e) => e.category === catKey).length;
          const isActive = activeFilter === catKey;
          return (
            <button
              key={catKey}
              onClick={() => setActiveFilter(catKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isActive
                  ? 'bg-white/20 border-white/40 text-white shadow-md'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400'
              }`}
            >
              {conf.label} ({count})
            </button>
          );
        })}
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* MAIN CONTENT: CALENDAR GRID (8 Cols) & DAY AGENDA DRAWER (4 Cols)      */}
      {/* ---------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CALENDAR VIEW (8 cols) */}
        <GlassCard className="lg:col-span-8 p-6 space-y-6">
          
          {/* Calendar Month & Year Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
            
            {/* Year & Month Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-purple-500/20 border border-purple-500/40 text-purple-300">
                <FiCalendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white font-mono tracking-wide flex items-center gap-2">
                  <span>{MONTH_NAMES[currentMonth]}</span>
                  <span className="text-purple-400">{currentYear}</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Showing {calendarDays.filter(d => d.isCurrentMonth).length} Days in {MONTH_NAMES[currentMonth]}
                </p>
              </div>
            </div>

            {/* Year & Month Selectors & Controls */}
            <div className="flex items-center gap-2">
              
              {/* Year Select dropdown */}
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                className="bg-slate-900 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs font-bold text-purple-300 focus:outline-none focus:border-purple-500 font-mono"
              >
                {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              {/* Month Select dropdown */}
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(Number(e.target.value))}
                className="bg-slate-900 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
              >
                {MONTH_NAMES.map((mName, idx) => (
                  <option key={mName} value={idx}>{mName}</option>
                ))}
              </select>

              {/* Nav Arrows */}
              <div className="flex items-center gap-1 pl-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all"
                  aria-label="Previous Month"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all"
                  aria-label="Next Month"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Weekday Column Headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            <span className="text-rose-400">Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span className="text-cyan-400">Sat</span>
          </div>

          {/* 7-Column Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((item, idx) => {
              const dayEvents = enrichedEvents.filter((e) => e.targetDate === item.dateStr);
              const isSelected = selectedDate === item.dateStr;
              const isToday = item.dateStr === formatDateISO(now);

              // Check if any event on this day has a 5-day red urgency
              const hasCriticalEvent = dayEvents.some(
                (e) => !e.completed && (e.deadline.isDueSoon || e.deadline.isToday || e.deadline.isOverdue)
              );

              return (
                <button
                  key={`${item.dateStr}-${idx}`}
                  onClick={() => setSelectedDate(item.dateStr)}
                  className={`min-h-[82px] p-2 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative group ${
                    isSelected
                      ? 'bg-purple-600/30 border-purple-400 text-white shadow-xl shadow-purple-950/60 ring-2 ring-purple-500/50'
                      : hasCriticalEvent
                        ? 'bg-rose-950/25 hover:bg-rose-950/40 border-rose-500/50 hover:border-rose-400 text-slate-200'
                        : item.isCurrentMonth
                          ? 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-300'
                          : 'bg-white/[0.02] hover:bg-white/5 border-transparent text-slate-600 opacity-40'
                  }`}
                >
                  {/* Top Bar inside cell: Day Number & Urgency Badge */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded-lg ${
                        isToday
                          ? 'bg-purple-500 text-white shadow-md'
                          : isSelected
                            ? 'text-purple-300 font-extrabold'
                            : 'text-slate-300'
                      }`}
                    >
                      {item.dayNum}
                    </span>

                    {/* 🔴 5-Day Red Alert Indicator Pill */}
                    {hasCriticalEvent && (
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-500/20 animate-pulse" title="Critical 5-Day Deadline" />
                    )}
                  </div>

                  {/* Event Badges List */}
                  <div className="space-y-1 mt-1 w-full overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={`text-[9px] px-1.5 py-0.5 rounded-md truncate font-semibold transition-all ${
                          ev.completed
                            ? 'line-through opacity-50 bg-white/5 text-slate-400'
                            : ev.deadline.isDueSoon || ev.deadline.isToday || ev.deadline.isOverdue
                              ? 'bg-rose-500/30 border border-rose-500/60 text-rose-200 font-bold'
                              : 'bg-white/10 text-slate-200'
                        }`}
                        style={
                          !ev.completed && !ev.deadline.isDueSoon
                            ? { backgroundColor: `${ev.color}35`, border: `1px solid ${ev.color}70` }
                            : {}
                        }
                      >
                        {ev.title}
                      </div>
                    ))}

                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-purple-300 font-bold px-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* -------------------------------------------------------------------- */}
        {/* SELECTED DAY AGENDA DRAWER (4 cols)                                  */}
        {/* -------------------------------------------------------------------- */}
        <GlassCard className="lg:col-span-4 flex flex-col justify-between p-6">
          <div className="space-y-4">
            
            {/* Header for Selected Day */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400">
                  Agenda for
                </span>
                <h3 className="text-base font-bold text-white font-mono flex items-center gap-1.5 mt-0.5">
                  <FiCalendar className="text-purple-400" /> {selectedDate}
                </h3>
              </div>
              <Badge variant="neutral">{selectedDateEvents.length} Events</Badge>
            </div>

            {/* List of events on selected day */}
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-white/5 border border-white/10 text-slate-400">
                  <FiClock className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-300">No events scheduled</p>
                <p className="text-[11px] text-slate-500">
                  No deadlines or study slots set for {selectedDate}. Click below to add one.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {selectedDateEvents.map((ev) => {
                  const catConfig = CATEGORY_CONFIG[ev.category] || CATEGORY_CONFIG.STUDY;
                  const IconComp = catConfig.icon;
                  const isCritical = !ev.completed && (ev.deadline.isDueSoon || ev.deadline.isToday || ev.deadline.isOverdue);

                  return (
                    <div
                      key={ev.id}
                      className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                        ev.completed
                          ? 'bg-white/[0.02] border-white/5 opacity-60'
                          : isCritical
                            ? 'bg-rose-950/30 border-rose-500/50 shadow-lg shadow-rose-950/30'
                            : 'bg-white/5 border-white/10'
                      }`}
                    >
                      {/* Top status & category */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`p-1.5 rounded-lg text-xs ${catConfig.bg}`}>
                            <IconComp className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-[11px] font-bold text-slate-300">
                            {catConfig.label}
                          </span>
                        </div>

                        {/* Exact Days Left / Urgency Badge in RED if <= 5 days */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            ev.completed
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : isCritical
                                ? 'bg-rose-500 text-white shadow-md shadow-rose-950 animate-pulse'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {ev.completed ? '✓ Completed' : ev.deadline.badgeText}
                        </span>
                      </div>

                      {/* Title & Notes */}
                      <div>
                        <h4 className={`text-sm font-bold text-white ${ev.completed ? 'line-through text-slate-400' : ''}`}>
                          {ev.title}
                        </h4>
                        {ev.notes && (
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            {ev.notes}
                          </p>
                        )}
                      </div>

                      {/* Time & Action Buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
                        <span className="flex items-center gap-1 text-[11px] font-mono">
                          <FiClock className="w-3 h-3 text-cyan-400" /> {ev.targetTime}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleComplete(ev.id)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              ev.completed
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                            }`}
                            title={ev.completed ? 'Mark pending' : 'Mark completed'}
                          >
                            <FiCheck className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => openEditModal(ev)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
                            title="Edit Event"
                          >
                            <FiCalendar className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteEvent(ev.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition-colors"
                            title="Delete Event"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Add for Selected Day */}
          <div className="pt-4 border-t border-white/10 mt-6">
            <GlassButton
              variant="glass"
              size="sm"
              className="w-full"
              onClick={() => openAddModal(selectedDate)}
            >
              + Add Event for {selectedDate}
            </GlassButton>
          </div>
        </GlassCard>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* ADD / EDIT SCHEDULE EVENT MODAL WITH YEAR, DATE & TIME INPUTS          */}
      {/* ---------------------------------------------------------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="water-glass-panel w-full max-w-lg rounded-3xl p-6 border border-white/15 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center bg-purple-500/20 border border-purple-500/40 text-purple-300">
                  <FiPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingEventId ? 'Edit Schedule Event' : 'Schedule New Event & Deadline'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Set Year, Date, and Time to track real-time countdowns
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEvent} className="space-y-4">
              
              {/* Event Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Event / Exam / Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spring Boot 3 Security Exam"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 placeholder:text-slate-500"
                />
              </div>

              {/* Category & Priority Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    {Object.entries(CATEGORY_CONFIG).map(([k, conf]) => (
                      <option key={k} value={k}>{conf.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="URGENT">🔴 Urgent</option>
                    <option value="HIGH">🟠 High Priority</option>
                    <option value="MEDIUM">🟡 Medium</option>
                    <option value="NORMAL">🔵 Normal</option>
                  </select>
                </div>
              </div>

              {/* -------------------------------------------------------------- */}
              {/* YEAR, DATE & TIME INPUTS                                       */}
              {/* -------------------------------------------------------------- */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block">
                  Target Date & Time Configuration
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Full Date Picker (Year, Month, Day) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Target Date (YYYY-MM-DD) *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.targetDate}
                      onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>

                  {/* Time Picker */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Time *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10:00 AM or 14:30"
                      value={formData.targetTime}
                      onChange={(e) => setFormData({ ...formData, targetTime: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                </div>

                {/* 🔴 LIVE 5-DAY COUNTDOWN PREVIEW */}
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    modalDeadlinePreview.isDueSoon || modalDeadlinePreview.isToday || modalDeadlinePreview.isOverdue
                      ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                      : 'bg-purple-950/20 border-purple-500/30 text-purple-200'
                  }`}
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <FiClock className="w-3.5 h-3.5" />
                    <span>Countdown Status:</span>
                  </span>
                  <span className="font-extrabold font-mono">
                    {modalDeadlinePreview.badgeText}
                    {modalDeadlinePreview.isDueSoon && ' (🔴 Red Alert Triggered!)'}
                  </span>
                </div>
              </div>

              {/* Notes / Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notes & Details (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Bring scientific calculator and student ID card"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500 placeholder:text-slate-500 resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <GlassButton type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </GlassButton>
                <GlassButton type="submit" variant="primary">
                  {editingEventId ? 'Update Event' : 'Save Schedule Event'}
                </GlassButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
