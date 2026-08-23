/**
 * ============================================================================
 * FILE: src/services/scheduleService.js
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Comprehensive Schedule & Deadline Management Engine for Tracklytics:
 *     1. Handles full Year, Month, Date, and Time scheduling.
 *     2. Calculates live countdowns (Days & Hours left).
 *     3. Identifies 5-Day Critical Thresholds:
 *        - When an event is within <= 5 days (or overdue), it triggers RED ALERT styling
 *          with glowing borders, red badges, and exact days left (e.g. "🔴 3 Days Left").
 *     4. Persists schedule items to localStorage (tracklytics_schedule_events).
 * ============================================================================
 */

const STORAGE_KEY = 'tracklytics_schedule_events';

// Helper to format Date object into YYYY-MM-DD
export function formatDateISO(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate realistic default seed events relative to today
function getInitialSeedEvents() {
  const now = new Date();

  // Helper to add days to now
  const addDays = (n) => {
    const d = new Date(now);
    d.setDate(d.getDate() + n);
    return d;
  };

  const d1 = addDays(2);  // 2 days left (within 5 days -> RED)
  const d2 = addDays(4);  // 4 days left (within 5 days -> RED)
  const d3 = addDays(5);  // 5 days left (exact 5-day boundary -> RED)
  const d4 = addDays(11); // 11 days left (normal)
  const d5 = addDays(19); // 19 days left (normal)
  const d6 = addDays(0);  // Today (0 days left -> RED)

  return [
    {
      id: 'sch-1',
      title: 'Spring Boot Microservices Final Exam',
      category: 'EXAM',
      targetDate: formatDateISO(d1),
      targetTime: '10:00 AM',
      year: d1.getFullYear(),
      month: d1.getMonth() + 1,
      day: d1.getDate(),
      priority: 'URGENT',
      color: '#ef4444',
      notes: 'Chapters 4-9: JWT Auth, Filter Chain, Docker Deployment',
      completed: false,
    },
    {
      id: 'sch-2',
      title: 'Claude & ChatGPT API Monthly Billing',
      category: 'EXPENSE',
      targetDate: formatDateISO(d2),
      targetTime: '02:00 PM',
      year: d2.getFullYear(),
      month: d2.getMonth() + 1,
      day: d2.getDate(),
      priority: 'HIGH',
      color: '#ec4899',
      notes: 'Renew Pro Subscription — estimated $40.00 total',
      completed: false,
    },
    {
      id: 'sch-3',
      title: 'React System Design Project Submission',
      category: 'ASSIGNMENT',
      targetDate: formatDateISO(d3),
      targetTime: '11:59 PM',
      year: d3.getFullYear(),
      month: d3.getMonth() + 1,
      day: d3.getDate(),
      priority: 'URGENT',
      color: '#f97316',
      notes: 'Push frontend repository and verify Vercel deployment link',
      completed: false,
    },
    {
      id: 'sch-4',
      title: 'Database Architecture & Indexing Review',
      category: 'STUDY',
      targetDate: formatDateISO(d4),
      targetTime: '04:30 PM',
      year: d4.getFullYear(),
      month: d4.getMonth() + 1,
      day: d4.getDate(),
      priority: 'NORMAL',
      color: '#8b5cf6',
      notes: 'B-Trees, Composite Indexes, and Query EXPLAIN plans',
      completed: false,
    },
    {
      id: 'sch-5',
      title: 'AWS Cloud Practitioner Certification Mock Test',
      category: 'EXAM',
      targetDate: formatDateISO(d5),
      targetTime: '09:00 AM',
      year: d5.getFullYear(),
      month: d5.getMonth() + 1,
      day: d5.getDate(),
      priority: 'NORMAL',
      color: '#3b82f6',
      notes: 'Complete 65 practice questions under 90 minutes',
      completed: false,
    },
    {
      id: 'sch-6',
      title: 'Daily Deep Focus Study Slot',
      category: 'STUDY',
      targetDate: formatDateISO(d6),
      targetTime: '06:00 PM',
      year: d6.getFullYear(),
      month: d6.getMonth() + 1,
      day: d6.getDate(),
      priority: 'HIGH',
      color: '#10b981',
      notes: '2-hour uninterrupted Pomodoro coding block',
      completed: false,
    },
  ];
}

/**
 * Calculates deadline metrics and 5-day warning indicators for an event.
 *
 * @param {string} targetDate - 'YYYY-MM-DD'
 * @param {string} [targetTime] - 'HH:MM AM/PM' or 'HH:MM'
 * @returns {object} deadline analysis details
 */
export function calculateDeadline(targetDate, targetTime = '23:59') {
  if (!targetDate) {
    return {
      daysLeft: 0,
      hoursLeft: 0,
      isDueSoon: false,
      isOverdue: false,
      isToday: false,
      badgeText: 'No Date',
      urgency: 'normal',
      colorTheme: 'purple',
    };
  }

  const now = new Date();
  const todayStr = formatDateISO(now);

  // Parse Target Date at start of day vs now
  const [year, month, day] = targetDate.split('-').map(Number);
  const targetMidnight = new Date(year, month - 1, day, 0, 0, 0);
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

  // Exact difference in calendar days
  const msPerDay = 1000 * 60 * 60 * 24;
  const dayDifference = Math.round((targetMidnight.getTime() - todayMidnight.getTime()) / msPerDay);

  const isToday = targetDate === todayStr;
  const isOverdue = dayDifference < 0;
  const isDueSoon = !isOverdue && dayDifference <= 5; // <= 5 days triggers RED ALERT!

  // Formatting badge text
  let badgeText = '';
  let urgency = 'normal'; // 'critical' | 'warning' | 'normal'
  let colorTheme = 'purple'; // 'red' | 'orange' | 'purple' | 'blue'

  if (isOverdue) {
    const overdueDays = Math.abs(dayDifference);
    badgeText = `⚠️ Overdue (${overdueDays}d ago)`;
    urgency = 'critical';
    colorTheme = 'red';
  } else if (isToday) {
    badgeText = '🔴 Due Today!';
    urgency = 'critical';
    colorTheme = 'red';
  } else if (dayDifference === 1) {
    badgeText = '🔴 1 Day Left!';
    urgency = 'critical';
    colorTheme = 'red';
  } else if (dayDifference <= 5) {
    badgeText = `🔴 ${dayDifference} Days Left`;
    urgency = 'critical'; // <--- RED COLOR within 5 days!
    colorTheme = 'red';
  } else if (dayDifference <= 10) {
    badgeText = `⏳ ${dayDifference} Days Left`;
    urgency = 'warning';
    colorTheme = 'orange';
  } else {
    badgeText = `📅 ${dayDifference} Days Left`;
    urgency = 'normal';
    colorTheme = 'purple';
  }

  return {
    daysLeft: dayDifference,
    isDueSoon,
    isOverdue,
    isToday,
    badgeText,
    urgency,
    colorTheme,
  };
}

/**
 * Schedule Database Manager (LocalStorage + State Synchronization)
 */
export const scheduleService = {
  // Get all events from storage
  getEvents: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        const initial = getInitialSeedEvents();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return getInitialSeedEvents();
    }
  },

  // Add or Update an event
  saveEvent: (eventData) => {
    const events = scheduleService.getEvents();
    let updated;

    const [year, month, day] = (eventData.targetDate || formatDateISO(new Date())).split('-').map(Number);

    const eventRecord = {
      id: eventData.id || `sch-${Date.now()}`,
      title: eventData.title.trim(),
      category: eventData.category || 'STUDY',
      targetDate: eventData.targetDate,
      targetTime: eventData.targetTime || '10:00 AM',
      year,
      month,
      day,
      priority: eventData.priority || 'NORMAL',
      color: eventData.color || '#8b5cf6',
      notes: eventData.notes || '',
      completed: !!eventData.completed,
      updatedAt: new Date().toISOString(),
    };

    if (eventData.id) {
      // Update existing
      updated = events.map((e) => (e.id === eventData.id ? { ...e, ...eventRecord } : e));
    } else {
      // Add new
      updated = [eventRecord, ...events];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  // Delete an event
  deleteEvent: (id) => {
    const events = scheduleService.getEvents();
    const updated = events.filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  // Toggle completed status
  toggleComplete: (id) => {
    const events = scheduleService.getEvents();
    const updated = events.map((e) =>
      e.id === id ? { ...e, completed: !e.completed } : e
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  // Reset to initial seed
  resetDefaults: () => {
    const initial = getInitialSeedEvents();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  },
};

export default scheduleService;
