-- Timesheets tables for SQLite/LibSQL

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

-- Ensure one timesheet per user per month
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
