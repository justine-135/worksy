<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

### User stories

Project owner:

- Go to projects, select new project

User member:

- Go to projects, get an invite by project owner, accept invite, receives new project card, click card to go inside project

Design a modern SaaS dashboard UI for a project management / Kanban platform with three role-based dashboard variants: Project Owner, Admin, and Project Member (User).

Global Design System:

- Desktop layout (1440px width)
- 12-column grid
- Left sidebar navigation (Dashboard, Projects, Members, Analytics, Settings)
- Top navbar with workspace switcher, search bar, notifications icon, and user profile dropdown
- Style: clean, minimal, professional B2B SaaS
- Inspiration: Linear, Notion, modern startup dashboards
- Typography: Inter
- Rounded 12px cards
- Soft shadows
- Neutral gray/slate base colors
- Primary accent: blue
- Status colors: green (done), yellow (warning), red (overdue), purple (in progress)
- Light mode

Create three separate dashboard screens:

---

1. PROJECT OWNER DASHBOARD (Executive View)

Purpose: High-level visibility, risk monitoring, team performance.

Sections:

- Top metrics row (4 stat cards):
  72% Complete
  Due: May 30
  8 Members
  Status: At Risk

- Project Health Grid:
  Project cards showing:
  • Project name
  • Progress bar with %
  • Overdue task count
  • Team member avatars
  • Last updated date

- Team Workload Chart:
  Bar chart showing tasks per member.
  Highlight overloaded members visually.

- Risk & Deadlines Panel:
  List of:
  • Overdue tasks
  • Tasks due in next 3 days
  • High-priority unfinished tasks

- Global Activity Feed (timeline style):
  Shows task created, moved, commented events.

---

2. ADMIN DASHBOARD (Operational View)

Purpose: Workflow management and bottleneck detection.

Sections:

- Workflow Stats Row:
  • Total Tasks
  • Tasks In Review
  • Blocked Tasks
  • Unassigned Tasks

- Task Status Distribution:
  Pie or donut chart for:
  • Backlog
  • In Progress
  • Review
  • Done

- Tasks Requiring Attention (table card):
  • Tasks without assignee
  • Tasks stuck in progress > 5 days
  • Overdue tasks
  Include priority badge and status badge.

- Member Overview Cards:
  • Member name
  • Assigned tasks count
  • Completed this week

- Recent Workspace Activity Feed

---

3. PROJECT MEMBER DASHBOARD (Personal Productivity View)

Purpose: Focused, task-oriented, minimal distractions.

Sections:

- Personal Overview Cards:
  • My Tasks
  • Due Today
  • Overdue
  • High Priority

- My Active Tasks List:
  Show:
  • Task title
  • Project name
  • Due date
  • Status badge
  • Priority tag

- Upcoming Deadlines Timeline:
  Vertical timeline sorted by due date.

- My Projects Overview:
  Small project cards with:
  • Project name
  • My assigned task count
  • Project progress bar

- Mentions / Notifications Panel:
  Tasks or comments where user was mentioned.

Ensure visual consistency across all three dashboards while clearly reflecting different priorities per role.

Use clean spacing, proper hierarchy, professional SaaS polish, and structured dashboard grid layout.

<!-- END:nextjs-agent-rules -->
