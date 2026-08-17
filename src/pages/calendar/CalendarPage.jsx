/**
 * ============================================================================
 * FILE: src/pages/calendar/CalendarPage.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Provides an interactive Monthly Planner Calendar where users can view 
 *   scheduled study slots, exam dates, and expense payment reminders.
 * ============================================================================
 */

import React, { useState } from 'react';
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
  FiX 
} from 'react-icons/fi';

export const CalendarPage = () => {
  // Calendar Events State
  const [events, setEvents] = useState([
    { id: 'ev-1', day: 26, title: 'Spring Boot 3 JWT Security', type: 'STUDY', color: '#8b5cf6', time: '10:00 AM' },
    { id: 'ev-2', day: 27, title: 'Claude Pro Subscription Renewal', type: 'EXPENSE', color: '#ec4899', time: '2:00 PM' },
    { id: 'ev-3', day: 28, title: 'React Hooks System Design Quiz', type: 'EXAM', color: '#3b82f6', time: '4:30 PM' },
    { id: 'ev-4', day: 30, title: 'MySQL Query Optimization Workshop', type: 'STUDY', color: '#06b6d4', time: '11:00 AM' }
  ]);

  // Selected Day State
  const [selectedDay, setSelectedDay] = useState(26);

  // Add Event Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    day: 26,
    type: 'STUDY',
    time: '10:00 AM',
    color: '#8b5cf6'
  });

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEvent.title) return;

    const created = {
      id: `ev-${Date.now()}`,
      title: newEvent.title,
      day: Number(newEvent.day),
      type: newEvent.type,
      time: newEvent.time,
      color: newEvent.type === 'STUDY' ? '#8b5cf6' : newEvent.type === 'EXPENSE' ? '#ec4899' : '#3b82f6'
    };

    setEvents([...events, created]);
    setNewEvent({ title: '', day: 26, type: 'STUDY', time: '10:00 AM', color: '#8b5cf6' });
    setIsModalOpen(false);
  };

  // Generate 31 days grid
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  // Events on selected day
  const selectedDayEvents = events.filter(e => e.day === selectedDay);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Planner Calendar</h2>
          <p className="text-xs text-slate-400 mt-1">Schedule study sessions, exams, and expense payment deadlines</p>
        </div>

        <GlassButton variant="primary" icon={FiPlus} onClick={() => setIsModalOpen(true)}>
          Add Planner Event
        </GlassButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid (8 cols) */}
        <GlassCard className="lg:col-span-8 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-white font-mono">July 2026</h3>
              <Badge variant="purple">31 Days</Badge>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300">
                <FiChevronLeft />
              </button>
              <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300">
                <FiChevronRight />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map((day) => {
              const dayEvents = events.filter(e => e.day === day);
              const isSelected = selectedDay === day;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[64px] p-2 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-purple-600/30 border-purple-500 text-white shadow-lg shadow-purple-900/40'
                      : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold font-mono">{day}</span>
                  
                  {/* Event Badges */}
                  <div className="space-y-1 mt-1">
                    {dayEvents.map(ev => (
                      <div 
                        key={ev.id} 
                        className="text-[9px] px-1.5 py-0.5 rounded-lg truncate font-semibold text-white"
                        style={{ backgroundColor: `${ev.color}40`, border: `1px solid ${ev.color}80` }}
                      >
                        {ev.title}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* Selected Day Agenda Drawer (4 cols) */}
        <GlassCard className="lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FiCalendar className="text-purple-400" /> Day {selectedDay} Agenda
              </h3>
              <Badge variant="neutral">{selectedDayEvents.length} Events</Badge>
            </div>

            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No events scheduled for July {selectedDay}.
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayEvents.map(ev => (
                  <div key={ev.id} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{ev.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-white/10 text-purple-300">
                        {ev.type}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <FiClock className="w-3 h-3 text-cyan-400" /> {ev.time}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 mt-6">
            <GlassButton variant="glass" size="sm" className="w-full" onClick={() => setIsModalOpen(true)}>
              + Add Event for Day {selectedDay}
            </GlassButton>
          </div>
        </GlassCard>
      </div>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="water-glass-panel w-full max-w-md rounded-3xl p-6 border border-white/15 shadow-2xl relative">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FiPlus className="text-purple-400" /> Schedule Event
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spring Security Exam Revision"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Day of Month (1 - 31)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={newEvent.day}
                    onChange={(e) => setNewEvent({ ...newEvent, day: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Event Type</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="STUDY">Study Session</option>
                    <option value="EXPENSE">Expense Due</option>
                    <option value="EXAM">Exam / Quiz</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <GlassButton type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </GlassButton>
                <GlassButton type="submit" variant="primary">
                  Save Event
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
