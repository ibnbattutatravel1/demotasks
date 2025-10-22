import { mysqlTable, varchar, int, decimal, text, boolean, datetime, primaryKey, json } from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'

// Users
export const users = mysqlTable('users', {
  id: varchar('id', { length: 191 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  avatar: text('avatar'),
  initials: varchar('initials', { length: 10 }).notNull(),
  role: varchar('role', { length: 16 }).notNull(), // 'admin' | 'user'
  status: varchar('status', { length: 16 }), // 'Active' | 'Away' | 'Inactive'
  passwordHash: text('password_hash'),
})

// Projects
export const projects = mysqlTable('projects', {
  id: varchar('id', { length: 191 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  status: varchar('status', { length: 16 }).notNull(), // planning | in-progress | review | completed | on-hold
  priority: varchar('priority', { length: 8 }).notNull(), // low | medium | high
  startDate: datetime('start_date').notNull(),
  dueDate: datetime('due_date').notNull(),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at'),
  completedAt: datetime('completed_at'),
  progress: int('progress').notNull().default(0), // 0-100
  ownerId: varchar('owner_id', { length: 191 }).notNull().references(() => users.id),
  color: varchar('color', { length: 50 }).notNull(),
})

// Project team (many-to-many)
export const projectTeam = mysqlTable(
  'project_team',
  {
    projectId: varchar('project_id', { length: 191 }).notNull().references(() => projects.id),
    userId: varchar('user_id', { length: 191 }).notNull().references(() => users.id),
  },
  (t) => ({ pk: primaryKey({ columns: [t.projectId, t.userId] }) })
)

// Project tags (simple m2m via tag string)
export const projectTags = mysqlTable(
  'project_tags',
  {
    projectId: varchar('project_id', { length: 191 }).notNull().references(() => projects.id),
    tag: varchar('tag', { length: 100 }).notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.projectId, t.tag] }) })
)

// Tasks
export const tasks = mysqlTable('tasks', {
  id: varchar('id', { length: 191 }).primaryKey(),
  projectId: varchar('project_id', { length: 191 }).notNull().references(() => projects.id),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description').notNull(),
  status: varchar('status', { length: 16 }).notNull(), // todo | in-progress | review | done
  priority: varchar('priority', { length: 8 }).notNull(),
  startDate: datetime('start_date').notNull(),
  dueDate: datetime('due_date').notNull(),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at'),
  completedAt: datetime('completed_at'),
  // assignment and approvals
  createdById: varchar('created_by_id', { length: 191 }).notNull().references(() => users.id),
  approvalStatus: varchar('approval_status', { length: 16 }), // pending | approved | rejected
  approvedAt: datetime('approved_at'),
  approvedById: varchar('approved_by_id', { length: 191 }).references(() => users.id),
  rejectionReason: text('rejection_reason'),
  // progress
  progress: int('progress').notNull().default(0),
})

// Task assignees (m2m)
export const taskAssignees = mysqlTable(
  'task_assignees',
  {
    taskId: varchar('task_id', { length: 191 }).notNull().references(() => tasks.id),
    userId: varchar('user_id', { length: 191 }).notNull().references(() => users.id),
  },
  (t) => ({ pk: primaryKey({ columns: [t.taskId, t.userId] }) })
)

// Task tags
export const taskTags = mysqlTable(
  'task_tags',
  {
    taskId: varchar('task_id', { length: 191 }).notNull().references(() => tasks.id),
    tag: varchar('tag', { length: 100 }).notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.taskId, t.tag] }) })
)

// Subtasks
export const subtasks = mysqlTable('subtasks', {
  id: varchar('id', { length: 191 }).primaryKey(),
  taskId: varchar('task_id', { length: 191 }).notNull().references(() => tasks.id),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 16 }).notNull().default('todo'), // todo | in-progress | review | done
  completed: boolean('completed').notNull().default(false),
  startDate: datetime('start_date'),
  dueDate: datetime('due_date'),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at'),
  assigneeId: varchar('assignee_id', { length: 191 }).references(() => users.id),
  priority: varchar('priority', { length: 8 }),
})

// Subtask tags
export const subtaskTags = mysqlTable(
  'subtask_tags',
  {
    subtaskId: varchar('subtask_id', { length: 191 }).notNull().references(() => subtasks.id),
    tag: varchar('tag', { length: 100 }).notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.subtaskId, t.tag] }) })
)

// Comments (polymorphic: task | subtask)
export const comments = mysqlTable('comments', {
  id: varchar('id', { length: 191 }).primaryKey(),
  entityType: varchar('entity_type', { length: 16 }).notNull(), // 'task' | 'subtask'
  entityId: varchar('entity_id', { length: 191 }).notNull(),
  userId: varchar('user_id', { length: 191 }).notNull().references(() => users.id),
  userName: varchar('user_name', { length: 255 }).notNull(),
  avatar: text('avatar'),
  content: text('content').notNull(),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at'),
})

// Attachments (polymorphic: task | project | subtask)
export const attachments = mysqlTable('attachments', {
  id: varchar('id', { length: 191 }).primaryKey(),
  name: varchar('name', { length: 500 }).notNull(),
  size: varchar('size', { length: 50 }).notNull(),
  url: text('url').notNull(),
  type: varchar('type', { length: 100 }).notNull(),
  uploadedAt: datetime('uploaded_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  uploadedById: varchar('uploaded_by_id', { length: 191 }).notNull().references(() => users.id),
  uploadedByName: varchar('uploaded_by_name', { length: 255 }).notNull(),
  entityType: varchar('entity_type', { length: 16 }).notNull(), // 'task' | 'project' | 'subtask'
  entityId: varchar('entity_id', { length: 191 }).notNull(),
})

// Notifications
export const notifications = mysqlTable('notifications', {
  id: varchar('id', { length: 191 }).primaryKey(),
  type: varchar('type', { length: 100 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  read: boolean('read').notNull().default(false),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  userId: varchar('user_id', { length: 191 }).notNull().references(() => users.id),
  relatedId: varchar('related_id', { length: 191 }),
  relatedType: varchar('related_type', { length: 16 }), // 'task' | 'project' | 'subtask'
})

// User notification settings
export const userSettings = mysqlTable('user_settings', {
  // One row per user
  userId: varchar('user_id', { length: 191 }).primaryKey().references(() => users.id),
  // Notification preferences
  emailNotifications: boolean('email_notifications').notNull().default(true),
  pushNotifications: boolean('push_notifications').notNull().default(false),
  taskReminders: boolean('task_reminders').notNull().default(true),
  projectUpdates: boolean('project_updates').notNull().default(true),
  // Appearance
  timezone: varchar('timezone', { length: 100 }).notNull().default('UTC'),
  // Timestamps
  updatedAt: datetime('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

// Web Push subscriptions per user (multiple browsers/devices)
export const pushSubscriptions = mysqlTable('push_subscriptions', {
  id: varchar('id', { length: 191 }).primaryKey(),
  userId: varchar('user_id', { length: 191 }).notNull().references(() => users.id),
  endpoint: text('endpoint').notNull(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

// Timesheets (monthly per user)
export const timesheets = mysqlTable('timesheets', {
  id: varchar('id', { length: 191 }).primaryKey(),
  userId: varchar('user_id', { length: 191 }).notNull().references(() => users.id),
  month: varchar('month', { length: 7 }).notNull(), // format YYYY-MM
  status: varchar('status', { length: 16 }).notNull().default('draft'), // draft | submitted | approved | returned | rejected
  submittedAt: datetime('submitted_at'),
  approvedAt: datetime('approved_at'),
  approvedById: varchar('approved_by_id', { length: 191 }).references(() => users.id),
  returnedAt: datetime('returned_at'),
  returnComments: text('return_comments'),
  rejectedAt: datetime('rejected_at'),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at'),
})

// Timesheet entries (per-day hours)
export const timesheetEntries = mysqlTable('timesheet_entries', {
  id: varchar('id', { length: 191 }).primaryKey(),
  timesheetId: varchar('timesheet_id', { length: 191 }).notNull().references(() => timesheets.id),
  date: varchar('date', { length: 10 }).notNull(), // YYYY-MM-DD
  hours: decimal('hours', { precision: 5, scale: 2 }).notNull().default('0'),
  note: text('note'),
})

// Project Notes (workspace collaboration)
export const projectNotes = mysqlTable('project_notes', {
  id: varchar('id', { length: 191 }).primaryKey(),
  projectId: varchar('project_id', { length: 191 }).notNull().references(() => projects.id),
  title: varchar('title', { length: 500 }).notNull(),
  content: text('content').notNull(),
  isPinned: boolean('is_pinned').notNull().default(false),
  createdById: varchar('created_by_id', { length: 191 }).notNull().references(() => users.id),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at'),
})

// Project Documents (workspace file sharing)
export const projectDocuments = mysqlTable('project_documents', {
  id: varchar('id', { length: 191 }).primaryKey(),
  projectId: varchar('project_id', { length: 191 }).notNull().references(() => projects.id),
  name: varchar('name', { length: 500 }).notNull(),
  size: int('size').notNull(), // in bytes
  type: varchar('type', { length: 100 }).notNull(), // MIME type
  url: varchar('url', { length: 1000 }).notNull(),
  uploadedById: varchar('uploaded_by_id', { length: 191 }).notNull().references(() => users.id),
  uploadedAt: datetime('uploaded_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

// ====================================
// Questionnaires/Surveys System
// ====================================

// Questionnaires
export const questionnaires = mysqlTable('questionnaires', {
  id: varchar('id', { length: 191 }).primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  instructions: text('instructions'),
  createdById: varchar('created_by_id', { length: 191 }).notNull().references(() => users.id),
  targetType: varchar('target_type', { length: 50 }).notNull(), // 'all_users' | 'specific_users' | 'role_based'
  targetRole: varchar('target_role', { length: 50 }), // 'user' | 'project_lead'
  deadline: datetime('deadline').notNull(),
  isMandatory: boolean('is_mandatory').notNull().default(true),
  allowLateSubmission: boolean('allow_late_submission').notNull().default(false),
  showResultsToUsers: boolean('show_results_to_users').notNull().default(false),
  status: varchar('status', { length: 50 }).notNull().default('draft'), // 'draft' | 'published' | 'closed'
  publishedAt: datetime('published_at'),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at'),
})

// Questionnaire Target Users
export const questionnaireTargets = mysqlTable('questionnaire_targets', {
  id: varchar('id', { length: 191 }).primaryKey(),
  questionnaireId: varchar('questionnaire_id', { length: 191 }).notNull().references(() => questionnaires.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 191 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  isNotified: boolean('is_notified').notNull().default(false),
  notifiedAt: datetime('notified_at'),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

// Questions
export const questionnaireQuestions = mysqlTable('questionnaire_questions', {
  id: varchar('id', { length: 191 }).primaryKey(),
  questionnaireId: varchar('questionnaire_id', { length: 191 }).notNull().references(() => questionnaires.id, { onDelete: 'cascade' }),
  questionText: text('question_text').notNull(),
  questionType: varchar('question_type', { length: 50 }).notNull(), // 'mcq' | 'text' | 'rating' | 'yes_no' | 'file' | 'date' | 'multiple_choice' | 'checkbox'
  isRequired: boolean('is_required').notNull().default(true),
  options: json('options'), // للـ MCQ
  minValue: int('min_value'),
  maxValue: int('max_value'),
  maxFileSize: int('max_file_size'),
  allowedFileTypes: varchar('allowed_file_types', { length: 500 }),
  placeholderText: varchar('placeholder_text', { length: 500 }),
  helpText: text('help_text'),
  displayOrder: int('display_order').notNull(),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

// User Responses
export const questionnaireResponses = mysqlTable('questionnaire_responses', {
  id: varchar('id', { length: 191 }).primaryKey(),
  questionnaireId: varchar('questionnaire_id', { length: 191 }).notNull().references(() => questionnaires.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 191 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending' | 'submitted' | 'approved' | 'rejected' | 'returned'
  submittedAt: datetime('submitted_at'),
  reviewedAt: datetime('reviewed_at'),
  reviewedById: varchar('reviewed_by_id', { length: 191 }).references(() => users.id, { onDelete: 'set null' }),
  adminNotes: text('admin_notes'),
  isLate: boolean('is_late').notNull().default(false),
  score: decimal('score', { precision: 5, scale: 2 }),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at'),
})

// Answers
export const questionnaireAnswers = mysqlTable('questionnaire_answers', {
  id: varchar('id', { length: 191 }).primaryKey(),
  responseId: varchar('response_id', { length: 191 }).notNull().references(() => questionnaireResponses.id, { onDelete: 'cascade' }),
  questionId: varchar('question_id', { length: 191 }).notNull().references(() => questionnaireQuestions.id, { onDelete: 'cascade' }),
  answerText: text('answer_text'),
  answerValue: varchar('answer_value', { length: 500 }),
  answerNumber: decimal('answer_number', { precision: 10, scale: 2 }),
  answerFileUrl: varchar('answer_file_url', { length: 1000 }),
  answerOptions: json('answer_options'),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at'),
})

// History/Audit
export const questionnaireHistory = mysqlTable('questionnaire_history', {
  id: varchar('id', { length: 191 }).primaryKey(),
  questionnaireId: varchar('questionnaire_id', { length: 191 }).notNull().references(() => questionnaires.id, { onDelete: 'cascade' }),
  responseId: varchar('response_id', { length: 191 }).references(() => questionnaireResponses.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 191 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 100 }).notNull(),
  notes: text('notes'),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

// Feedback/Comments
export const questionnaireFeedback = mysqlTable('questionnaire_feedback', {
  id: varchar('id', { length: 191 }).primaryKey(),
  responseId: varchar('response_id', { length: 191 }).notNull().references(() => questionnaireResponses.id, { onDelete: 'cascade' }),
  questionId: varchar('question_id', { length: 191 }).references(() => questionnaireQuestions.id, { onDelete: 'set null' }),
  fromUserId: varchar('from_user_id', { length: 191 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  isCritical: boolean('is_critical').notNull().default(false),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})
