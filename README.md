# 📊 Tracklytics

> **Track your money. Measure your time. Understand your progress.**

**Tracklytics** is a smart personal analytics platform that brings **expense tracking and study productivity** into one unified dashboard.

Instead of keeping financial activity and academic progress in separate applications, Tracklytics connects both sides of everyday student life through a single, data-driven workspace.

The goal is simple:

**Capture → Analyze → Understand → Improve**

---

## 💡 Why Tracklytics?

Students often track expenses in one place, study hours somewhere else, and productivity in their own notes.

Tracklytics brings these activities together.

It transforms everyday actions such as:

```text
₹520 spent
     +
3h 20m studied
     +
15 day streak
     +
87% productivity
```

into meaningful insights that help users understand **where their time goes, where their money goes, and how consistently they are progressing.**

---

## ✨ Core Features

### 💰 Smart Expense Tracking

Track daily spending with structured information instead of simple transaction entries.

- Add, edit, and delete expenses
- Expense categories
- Payment methods
  - UPI
  - Cash
  - Card
- Tags and notes
- Receipt attachment support
- Spending history
- Budget monitoring
- Expense analytics

Example:

```text
Food
₹180
UPI
Lunch
Campus Canteen
```

---

### 📚 Study Tracking

Track learning activity and turn study sessions into measurable progress.

- Study timer
- Study hours
- Subject/course tracking
- Difficulty tracking
- Study notes
- Goals
- Calendar-based activity
- Daily streaks
- Productivity measurement

Instead of asking:

> "Did I study today?"

Tracklytics helps answer:

> **"How consistently am I studying, and how is my productivity changing?"**

---

## 🎙️ Voice-Driven Dashboard

One of Tracklytics' key concepts is **hands-free interaction**.

Users can interact with the dashboard through voice instead of navigating through multiple forms.

### Wake Word

```text
"Luna"
```

Once the wake word is detected, the assistant enters a conversational state.

Example:

```text
User:
"Luna"

Tracklytics:
"I'm listening."

User:
"Add expense"

Tracklytics:
"What's the amount?"

User:
"180 rupees"

Tracklytics:
"What was it for?"

User:
"Lunch"

Tracklytics:
"Expense added."
```

The same conversational approach can be used for study activities.

---

## 📈 Analytics Dashboard

Tracklytics converts raw activity into a visual overview of the user's day.

### Example KPIs

| Metric             | Example |
| ------------------ | ------: |
| 📚 Study Time      |  3h 20m |
| 💰 Today's Expense |    ₹520 |
| 🎯 Budget Used     |     72% |
| 🔥 Study Streak    | 15 Days |
| 💵 Savings         |  ₹4,850 |
| ⚡ Productivity     |     87% |

The dashboard provides a quick answer to:

**"How am I doing today?"**

---

## 🧠 From Tracking to Intelligence

Tracklytics isn't designed to simply store numbers.

The system is structured around turning activity into insights.

```text
                USER ACTIVITY
                     │
          ┌──────────┴──────────┐
          │                     │
       EXPENSE                 STUDY
          │                     │
          ▼                     ▼
    Transactions           Study Sessions
          │                     │
          └──────────┬──────────┘
                     ▼
                DATA LAYER
                     │
                     ▼
                ANALYTICS
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       Spending   Progress   Productivity
          │          │          │
          └──────────┼──────────┘
                     ▼
               USER INSIGHTS
```

---

## 🎯 Goals & Streaks

Consistency is one of the most important parts of building good habits.

Tracklytics uses:

- Daily goals
- Study streaks
- Progress tracking
- Calendar activity
- Productivity indicators

to make progress visible over time.

The objective isn't just to record yesterday's performance.

It's to understand **patterns across days and weeks.**

---

## 💳 Budget Management

Tracklytics allows users to define spending limits and monitor their usage.

```text
Monthly Budget
₹10,000
     │
     ▼
₹7,200 Used
     │
     ▼
72% Utilized
```

This can help users identify when spending approaches a defined limit.

Future versions can expand this into automated budget alerts and spending recommendations.

---

## 🎨 Product Design

Tracklytics follows a **premium SaaS dashboard** design philosophy.

### Design Principles

- Modern dark/light interface
- Aurora-inspired visual background
- Liquid/Water Glass UI
- Minimal visual clutter
- Interactive analytics
- Responsive dashboard
- Clear information hierarchy
- Smooth micro-interactions

The interface is designed to feel more like a **personal analytics platform** than a traditional student management application.

---

## 🛠️ Technology Stack

### Frontend

- React
- JavaScript
- HTML5
- CSS3
- Chart.js

### Data & Backend

The architecture is designed to support a persistent database layer for storing:

- Users
- Expenses
- Study sessions
- Goals
- Budgets
- Analytics
- Activity history

### Voice

- Browser speech recognition capabilities
- Speech synthesis
- Wake-word based interaction concept

---

## 🏗️ Architecture

```text
                    TRACKLYTICS
                         │
              ┌──────────┴──────────┐
              │                     │
          DASHBOARD             VOICE MODE
              │                     │
       ┌──────┴──────┐              │
       │             │              ▼
    EXPENSE        STUDY        Voice Input
       │             │              │
       └──────┬──────┘              ▼
              │               Command Processing
              ▼                     │
           ANALYTICS ◄──────────────┘
              │
              ▼
        INSIGHTS & GOALS
```

---

## 📂 Project Structure

```text
Tracklytics/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── modules/
│   │   ├── expenses/
│   │   ├── study/
│   │   ├── analytics/
│   │   └── voice/
│   ├── services/
│   └── assets/
│
├── public/
│
├── package.json
├── README.md
└── .gitignore
```

> The structure may evolve as new modules are introduced.

---

## 🚧 Development Status

Tracklytics is an actively evolving project.

### Implemented

- [x] Expense management
- [x] Study tracking
- [x] Dashboard analytics
- [x] Budget tracking concept
- [x] Study streaks
- [x] Productivity metrics
- [x] Dark/light interface
- [x] Liquid Glass inspired UI
- [x] Voice Mode
- [x] Wake-word concept
- [x] Voice-based expense flow
- [x] Voice-based study flow

### In Development

- [x] Persistent database integration
- [ ] Advanced financial analytics
- [ ] Personalized productivity insights
- [ ] Automated alerts
- [ ] Long-term trend analysis
- [x] More natural voice conversations
- [ ] Advanced goal intelligence

---

## 🔮 Future Vision

Tracklytics can evolve beyond a tracking application into a **personal decision-support system**.

Potential future capabilities:

```text
Expense History
       ↓
Spending Patterns
       ↓
Financial Insights

Study History
       ↓
Learning Patterns
       ↓
Productivity Insights

Combined Activity
       ↓
Personal Analytics
       ↓
Smarter Daily Decisions
```

Future versions could explore:

- 🤖 AI-powered personal insights
- 📊 Predictive spending analysis
- 📚 Adaptive study recommendations
- 🔔 Intelligent alerts
- 🎙️ More advanced voice interaction
- 📅 Smart schedule suggestions
- 📈 Long-term behavioral analytics
- 🔐 Secure cloud synchronization

---

## 🔐 Data & Privacy

Tracklytics is designed with user data ownership in mind.

Sensitive information such as financial activity and personal study data should be handled securely when persistent storage and cloud synchronization are introduced.

Future production implementations should include:

- Authentication
- Secure API communication
- Database access controls
- Input validation
- Protected user data
- Secure file/receipt handling

---

## 🤝 Contributing

Tracklytics is currently a personal development project.

If you have an idea, discover a bug, or want to improve the project:

1. Open an issue
2. Explain the problem or idea
3. Provide screenshots or reproduction steps when useful
4. Submit a pull request

---

## ⚠️ Disclaimer

Tracklytics is a personal productivity and expense-management project.

Financial insights generated by the application are intended for informational and tracking purposes and should not be considered professional financial advice.

---

## 👨‍💻 Built to Understand Your Day

Most applications help you **record** what happened.

Tracklytics is built around a different idea:

> **Don't just track your day. Understand it.**

Your money tells one story.
Your time tells another.

**Tracklytics brings them together.**

### 📊 Track. Analyze. Improve.

**That's Tracklytics.**
