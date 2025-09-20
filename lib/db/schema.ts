import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// Users
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  avatar: text('avatar'),
  initials: text('initials').notNull(),
  role: text('role', { length: 16 }).notNull(), // 'admin' | 'user'
  status: text('status', { length: 16 }), // 'Active' | 'Away' | 'Inactive'
  passwordHash: text('password_hash'),
})

// Projects
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  status: text('status', { length: 16 }).notNull(), // planning | in-progress | review | completed | on-hold
  priority: text('priority', { length: 8 }).notNull(), // low | medium | high
  startDate: text('start_date').notNull(),
  dueDate: text('due_date').notNull(),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at'),
  completedAt: text('completed_at'),
  progress: integer('progress').notNull().default(0), // 0-100
  ownerId: text('owner_id').notNull().references(() => users.id),
  color: text('color').notNull(),
  budget: real('budget'),
  estimatedHours: real('estimated_hours'),
  actualHours: real('actual_hours'),
})

// Project team (many-to-many)
export const projectTeam = sqliteTable(
  'project_team',
  {
    projectId: text('project_id').notNull().references(() => projects.id),
    userId: text('user_id').notNull().references(() => users.id),
  },
  (t) => ({ pk: primaryKey({ columns: [t.projectId, t.userId] }) })
)

// Project tags (simple m2m via tag string)
export const projectTags = sqliteTable(
  'project_tags',
  {
    projectId: text('project_id').notNull().references(() => projects.id),
    tag: text('tag').notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.projectId, t.tag] }) })
)

// Tasks
export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: text('status', { length: 16 }).notNull(), // todo | in-progress | review | done
  priority: text('priority', { length: 8 }).notNull(),
  startDate: text('start_date').notNull(),
  dueDate: text('due_date').notNull(),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at'),
  completedAt: text('completed_at'),
  // assignment and approvals
  createdById: text('created_by_id').notNull().references(() => users.id),
  approvalStatus: text('approval_status', { length: 16 }), // pending | approved | rejected
  approvedAt: text('approved_at'),
  approvedById: text('approved_by_id').references(() => users.id),
  rejectionReason: text('rejection_reason'),
  // progress
  progress: integer('progress').notNull().default(0),
})

// Task assignees (m2m)
export const taskAssignees = sqliteTable(
  'task_assignees',
  {
    taskId: text('task_id').notNull().references(() => tasks.id),
    userId: text('user_id').notNull().references(() => users.id),
  },
  (t) => ({ pk: primaryKey({ columns: [t.taskId, t.userId] }) })
)

// Task tags
export const taskTags = sqliteTable(
  'task_tags',
  {
    taskId: text('task_id').notNull().references(() => tasks.id),
    tag: text('tag').notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.taskId, t.tag] }) })
)

// Subtasks
export const subtasks = sqliteTable('subtasks', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull().references(() => tasks.id),
  title: text('title').notNull(),
  description: text('description'),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  startDate: text('start_date'),
  dueDate: text('due_date'),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at'),
  assigneeId: text('assignee_id').references(() => users.id),
  priority: text('priority', { length: 8 }),
})

// Subtask tags
export const subtaskTags = sqliteTable(
  'subtask_tags',
  {
    subtaskId: text('subtask_id').notNull().references(() => subtasks.id),
    tag: text('tag').notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.subtaskId, t.tag] }) })
)

// Comments (polymorphic: task | subtask)
export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  entityType: text('entity_type', { length: 16 }).notNull(), // 'task' | 'subtask'
  entityId: text('entity_id').notNull(),
  userId: text('user_id').notNull().references(() => users.id),
  userName: text('user_name').notNull(),
  avatar: text('avatar'),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at'),
})

// Attachments (polymorphic: task | project | subtask)
export const attachments = sqliteTable('attachments', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  size: text('size').notNull(),
  url: text('url').notNull(),
  type: text('type').notNull(),
  uploadedAt: text('uploaded_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  uploadedById: text('uploaded_by_id').notNull().references(() => users.id),
  uploadedByName: text('uploaded_by_name').notNull(),
  entityType: text('entity_type', { length: 16 }).notNull(), // 'task' | 'project' | 'subtask'
  entityId: text('entity_id').notNull(),
})

// Notifications
export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  read: integer('read', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  userId: text('user_id').notNull().references(() => users.id),
  relatedId: text('related_id'),
  relatedType: text('related_type'), // 'task' | 'project' | 'subtask'
})

// User notification settings
export const userSettings = sqliteTable('user_settings', {
  // One row per user
  userId: text('user_id').primaryKey().references(() => users.id),
  // Notification preferences
  emailNotifications: integer('email_notifications', { mode: 'boolean' }).notNull().default(true),
  pushNotifications: integer('push_notifications', { mode: 'boolean' }).notNull().default(false),
  taskReminders: integer('task_reminders', { mode: 'boolean' }).notNull().default(true),
  projectUpdates: integer('project_updates', { mode: 'boolean' }).notNull().default(true),
  // Appearance
  timezone: text('timezone').notNull().default('UTC'),
  // Timestamps
  updatedAt: text('updated_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

// Web Push subscriptions per user (multiple browsers/devices)
export const pushSubscriptions = sqliteTable('push_subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  endpoint: text('endpoint').notNull(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

// Timesheets (monthly per user)
export const timesheets = sqliteTable('timesheets', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  month: text('month').notNull(), // format YYYY-MM
  status: text('status', { length: 16 }).notNull().default('draft'), // draft | submitted | approved | returned | rejected
  submittedAt: text('submitted_at'),
  approvedAt: text('approved_at'),
  approvedById: text('approved_by_id').references(() => users.id),
  returnedAt: text('returned_at'),
  returnComments: text('return_comments'),
  rejectedAt: text('rejected_at'),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at'),
})

// Timesheet entries (per-day hours)
export const timesheetEntries = sqliteTable('timesheet_entries', {
  id: text('id').primaryKey(),
  timesheetId: text('timesheet_id').notNull().references(() => timesheets.id),
  date: text('date').notNull(), // YYYY-MM-DD
  hours: real('hours').notNull().default(0),
  note: text('note'),
})
