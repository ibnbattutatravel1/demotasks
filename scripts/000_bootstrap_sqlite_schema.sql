-- Bootstrap schema for SQLite/LibSQL (Turso)
-- This file creates all tables used by the app if they do not already exist.
-- Safe to run multiple times.

PRAGMA foreign_keys = ON;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  initials TEXT NOT NULL,
  role TEXT NOT NULL, -- 'admin' | 'user'
  status TEXT,        -- optional: 'Active' | 'Away' | 'Inactive'
  password_hash TEXT
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL, -- planning | in-progress | review | completed | on-hold
  priority TEXT NOT NULL, -- low | medium | high
  start_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT,
  completed_at TEXT,
  progress INTEGER NOT NULL DEFAULT 0,
  owner_id TEXT NOT NULL,
  color TEXT NOT NULL,
  budget REAL,
  estimated_hours REAL,
  actual_hours REAL,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_due_date ON projects(due_date);

-- Project team (m2m)
CREATE TABLE IF NOT EXISTS project_team (
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  PRIMARY KEY (project_id, user_id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Project tags (m2m via tag string)
CREATE TABLE IF NOT EXISTS project_tags (
  project_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  PRIMARY KEY (project_id, tag),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL, -- planning | todo | in-progress | review | done
  priority TEXT NOT NULL,
  start_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT,
  completed_at TEXT,
  created_by_id TEXT NOT NULL,
  approval_status TEXT,
  approved_at TEXT,
  approved_by_id TEXT,
  rejection_reason TEXT,
  progress INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (created_by_id) REFERENCES users(id),
  FOREIGN KEY (approved_by_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_approval ON tasks(approval_status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Task assignees (m2m)
CREATE TABLE IF NOT EXISTS task_assignees (
  task_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  PRIMARY KEY (task_id, user_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Task tags
CREATE TABLE IF NOT EXISTS task_tags (
  task_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  PRIMARY KEY (task_id, tag),
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);

-- Subtasks
CREATE TABLE IF NOT EXISTS subtasks (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo', -- planning | todo | in-progress | review | done
  completed INTEGER NOT NULL DEFAULT 0, -- boolean 0/1
  start_date TEXT,
  due_date TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT,
  assignee_id TEXT,
  priority TEXT,
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  FOREIGN KEY (assignee_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_subtasks_task ON subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_status ON subtasks(status);
CREATE INDEX IF NOT EXISTS idx_subtasks_assignee ON subtasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_completed ON subtasks(completed);

-- Subtask tags
CREATE TABLE IF NOT EXISTS subtask_tags (
  subtask_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  PRIMARY KEY (subtask_id, tag),
  FOREIGN KEY (subtask_id) REFERENCES subtasks(id)
);

-- Comments (polymorphic: task | subtask)
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL, -- 'task' | 'subtask'
  entity_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  avatar TEXT,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);

-- Attachments (polymorphic: task | project | subtask)
CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  size TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  uploaded_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  uploaded_by_id TEXT NOT NULL,
  uploaded_by_name TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- 'task' | 'project' | 'subtask'
  entity_id TEXT NOT NULL,
  FOREIGN KEY (uploaded_by_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_attachments_entity ON attachments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploader ON attachments(uploaded_by_id);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  user_id TEXT NOT NULL,
  related_id TEXT,
  related_type TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- User settings
CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY,
  email_notifications INTEGER NOT NULL DEFAULT 1,
  push_notifications INTEGER NOT NULL DEFAULT 0,
  task_reminders INTEGER NOT NULL DEFAULT 1,
  project_updates INTEGER NOT NULL DEFAULT 1,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Web push subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_push_user ON push_subscriptions(user_id);

-- Timesheets
CREATE TABLE IF NOT EXISTS timesheets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  month TEXT NOT NULL, -- YYYY-MM
  status TEXT NOT NULL DEFAULT 'draft', -- draft | submitted | approved | returned | rejected
  submitted_at TEXT,
  approved_at TEXT,
  approved_by_id TEXT,
  returned_at TEXT,
  return_comments TEXT,
  rejected_at TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (approved_by_id) REFERENCES users(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_timesheets_user_month ON timesheets(user_id, month);
CREATE INDEX IF NOT EXISTS idx_timesheets_status ON timesheets(status);

CREATE TABLE IF NOT EXISTS timesheet_entries (
  id TEXT PRIMARY KEY,
  timesheet_id TEXT NOT NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD
  hours REAL NOT NULL DEFAULT 0,
  note TEXT,
  FOREIGN KEY (timesheet_id) REFERENCES timesheets(id)
);
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_sheet ON timesheet_entries(timesheet_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_timesheet_entries_day ON timesheet_entries(timesheet_id, date);
