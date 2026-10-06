# Worksy

Worksy is a full-stack project management app for teams that need clear task ownership and controlled access. Manage work on Kanban-style task boards, assign tasks to teammates, and control who can do what with custom roles and permissions — all in one place.

## Features

- **Kanban Task Boards** — Organize tasks per project into drag-and-drop columns (e.g. To Do, In Progress, Done) powered by `dnd-kit`.
- **Task Assignment** — Assign tasks to specific team members and track ownership at a glance.
- **Role-Based Access Control (RBAC)** — Create custom roles and permissions, then assign them to members to control what each person can see and do within a project.
- **Member Invites** — Invite teammates to join a project and get them set up with the right role.
- **Notifications** — Keep users informed of relevant activity and updates on their tasks and projects.
- **Rich Text Editing** — Task descriptions and comments support rich formatting, links, images, and @mentions via Tiptap.
- **Activity Log** - Logs every activities for each member's actions. 
- **Dashboard** - Tracks every tasks, members, and overall progress of the project. 

## Tech Stack

| Layer            | Technology                                              |
|------------------|----------------------------------------------------------|
| Framework        | [Next.js 16](https://nextjs.org/) (App Router, full-stack) |
| UI               | React 19, [HeroUI](https://www.heroui.com/), Tailwind CSS 4 |
| Auth             | NextAuth.js                                             |
| ORM              | [Prisma](https://www.prisma.io/) (with `@prisma/adapter-pg`) |
| Database         | [Neon Postgres](https://neon.tech/) (Vercel free tier)   |
| File Storage     | Vercel Blob                                              |
| State/Data       | Zustand, TanStack React Query                            |
| Forms/Validation | React Hook Form, Zod                                     |
| Rich Text Editor | Tiptap                                                   |
| Drag & Drop      | dnd-kit                                                  |
| Deployment       | [Vercel](https://vercel.com/)                            |

## Getting Started

### Prerequisites

- Node.js 18+
- A Postgres database (e.g. a free [Neon](https://neon.tech/) instance)
- A Vercel account (for Blob storage, if using file uploads)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/worksy.git
   cd worksy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the project root with the following variables:
   ```env
   DATABASE_URL="your-neon-postgres-connection-string"
   NEXTAUTH_SECRET="a-random-secret-string"
   NEXTAUTH_URL="http://localhost:3000"
   BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
   ```

4. Push the Prisma schema to your database:
   ```bash
   npm run db:push
   ```

5. (Optional) Seed the database with initial data:
   ```bash
   npm run db:seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the app.

## Available Scripts

| Command              | Description                                      |
|-----------------------|--------------------------------------------------|
| `npm run dev`         | Start the development server                      |
| `npm run build`       | Build the app for production                      |
| `npm run start`       | Start the production server                       |
| `npm run lint`        | Run ESLint                                        |
| `npm run lint:fix`    | Run ESLint and auto-fix issues                    |
| `npm run db:push`     | Push the Prisma schema to the database            |
| `npm run db:seed`     | Seed the database                                 |
| `npm run db:reset`    | Reset the database (drops and recreates)          |
| `npm run studio`      | Open Prisma Studio to browse/edit data            |

## Deployment

Worksy is designed to deploy seamlessly on [Vercel](https://vercel.com/) with a [Neon](https://neon.tech/) Postgres database. Add your environment variables (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `BLOB_READ_WRITE_TOKEN`) to your Vercel project settings, then connect your repository and deploy.
