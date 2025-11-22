import { relations } from "drizzle-orm/relations";
import { users, attachments, comments, notifications, projects, projectTags, projectTeam, pushSubscriptions, subtasks, tasks, subtaskTags, taskAssignees, taskTags, timesheets, timesheetEntries, userSettings } from "./schema";

export const attachmentsRelations = relations(attachments, ({one}) => ({
	user: one(users, {
		fields: [attachments.uploadedById],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	attachments: many(attachments),
	comments: many(comments),
	notifications: many(notifications),
	projects: many(projects),
	projectTeams: many(projectTeam),
	pushSubscriptions: many(pushSubscriptions),
	subtasks: many(subtasks),
	tasks_approvedById: many(tasks, {
		relationName: "tasks_approvedById_users_id"
	}),
	tasks_createdById: many(tasks, {
		relationName: "tasks_createdById_users_id"
	}),
	taskAssignees: many(taskAssignees),
	timesheets_approvedById: many(timesheets, {
		relationName: "timesheets_approvedById_users_id"
	}),
	timesheets_userId: many(timesheets, {
		relationName: "timesheets_userId_users_id"
	}),
	userSettings: many(userSettings),
}));

export const commentsRelations = relations(comments, ({one}) => ({
	user: one(users, {
		fields: [comments.userId],
		references: [users.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
}));

export const projectsRelations = relations(projects, ({one, many}) => ({
	user: one(users, {
		fields: [projects.ownerId],
		references: [users.id]
	}),
	projectTags: many(projectTags),
	projectTeams: many(projectTeam),
	tasks: many(tasks),
}));

export const projectTagsRelations = relations(projectTags, ({one}) => ({
	project: one(projects, {
		fields: [projectTags.projectId],
		references: [projects.id]
	}),
}));

export const projectTeamRelations = relations(projectTeam, ({one}) => ({
	project: one(projects, {
		fields: [projectTeam.projectId],
		references: [projects.id]
	}),
	user: one(users, {
		fields: [projectTeam.userId],
		references: [users.id]
	}),
}));

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({one}) => ({
	user: one(users, {
		fields: [pushSubscriptions.userId],
		references: [users.id]
	}),
}));

export const subtasksRelations = relations(subtasks, ({one, many}) => ({
	user: one(users, {
		fields: [subtasks.assigneeId],
		references: [users.id]
	}),
	task: one(tasks, {
		fields: [subtasks.taskId],
		references: [tasks.id]
	}),
	subtaskTags: many(subtaskTags),
}));

export const tasksRelations = relations(tasks, ({one, many}) => ({
	subtasks: many(subtasks),
	user_approvedById: one(users, {
		fields: [tasks.approvedById],
		references: [users.id],
		relationName: "tasks_approvedById_users_id"
	}),
	user_createdById: one(users, {
		fields: [tasks.createdById],
		references: [users.id],
		relationName: "tasks_createdById_users_id"
	}),
	project: one(projects, {
		fields: [tasks.projectId],
		references: [projects.id]
	}),
	taskAssignees: many(taskAssignees),
	taskTags: many(taskTags),
}));

export const subtaskTagsRelations = relations(subtaskTags, ({one}) => ({
	subtask: one(subtasks, {
		fields: [subtaskTags.subtaskId],
		references: [subtasks.id]
	}),
}));

export const taskAssigneesRelations = relations(taskAssignees, ({one}) => ({
	task: one(tasks, {
		fields: [taskAssignees.taskId],
		references: [tasks.id]
	}),
	user: one(users, {
		fields: [taskAssignees.userId],
		references: [users.id]
	}),
}));

export const taskTagsRelations = relations(taskTags, ({one}) => ({
	task: one(tasks, {
		fields: [taskTags.taskId],
		references: [tasks.id]
	}),
}));

export const timesheetsRelations = relations(timesheets, ({one, many}) => ({
	user_approvedById: one(users, {
		fields: [timesheets.approvedById],
		references: [users.id],
		relationName: "timesheets_approvedById_users_id"
	}),
	user_userId: one(users, {
		fields: [timesheets.userId],
		references: [users.id],
		relationName: "timesheets_userId_users_id"
	}),
	timesheetEntries: many(timesheetEntries),
}));

export const timesheetEntriesRelations = relations(timesheetEntries, ({one}) => ({
	timesheet: one(timesheets, {
		fields: [timesheetEntries.timesheetId],
		references: [timesheets.id]
	}),
}));

export const userSettingsRelations = relations(userSettings, ({one}) => ({
	user: one(users, {
		fields: [userSettings.userId],
		references: [users.id]
	}),
}));