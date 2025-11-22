import { mysqlTable, mysqlSchema, AnyMySqlColumn, foreignKey, varchar, text, datetime, index, mysqlEnum, timestamp, longtext, int, unique, decimal, tinyint, bigint } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const attachments = mysqlTable("attachments", {
	id: varchar({ length: 191 }).notNull(),
	name: varchar({ length: 500 }).notNull(),
	size: varchar({ length: 50 }).notNull(),
	url: text().notNull(),
	type: varchar({ length: 100 }).notNull(),
	uploadedAt: datetime("uploaded_at", { mode: 'string'}).default('current_timestamp()').notNull(),
	uploadedById: varchar("uploaded_by_id", { length: 191 }).notNull().references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	uploadedByName: varchar("uploaded_by_name", { length: 255 }).notNull(),
	entityType: varchar("entity_type", { length: 16 }).notNull(),
	entityId: varchar("entity_id", { length: 191 }).notNull(),
});

export const comments = mysqlTable("comments", {
	id: varchar({ length: 191 }).notNull(),
	entityType: varchar("entity_type", { length: 16 }).notNull(),
	entityId: varchar("entity_id", { length: 191 }).notNull(),
	userId: varchar("user_id", { length: 191 }).notNull().references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	userName: varchar("user_name", { length: 255 }).notNull(),
	avatar: text().default('NULL'),
	content: text().notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).default('current_timestamp()').notNull(),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
},
(table) => [
	index("idx_comments_entity").on(table.entityType, table.entityId),
]);

export const communities = mysqlTable("communities", {
	id: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 200 }).notNull(),
	description: text().default('NULL'),
	icon: varchar({ length: 100 }).default('NULL'),
	color: varchar({ length: 20 }).default('\'#6366f1\''),
	visibility: mysqlEnum(['public','private','secret']).default('\'private\''),
	createdBy: varchar("created_by", { length: 50 }).default('NULL'),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('current_timestamp()'),
	isArchived: tinyint("is_archived").default(0),
	archivedAt: timestamp("archived_at", { mode: 'string' }).default('NULL'),
	settings: longtext().default('NULL'),
	membersCount: int("members_count").default(0),
	postsCount: int("posts_count").default(0),
},
(table) => [
	index("idx_created_by").on(table.createdBy),
	index("idx_visibility").on(table.visibility),
	index("idx_archived").on(table.isArchived),
	index("idx_created_at").on(table.createdAt),
]);

export const communityActivity = mysqlTable("community_activity", {
	id: varchar({ length: 50 }).notNull(),
	communityId: varchar("community_id", { length: 50 }).notNull(),
	userId: varchar("user_id", { length: 50 }).notNull(),
	action: mysqlEnum(['created','updated','deleted','commented','reacted','joined','left','shared','mentioned','pinned','archived']).notNull(),
	targetType: mysqlEnum("target_type", ['post','comment','file','vault_item','member','community','category']).notNull(),
	targetId: varchar("target_id", { length: 50 }).default('NULL'),
	metadata: longtext().default('NULL'),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()'),
},
(table) => [
	index("idx_community").on(table.communityId),
	index("idx_user").on(table.userId),
	index("idx_action").on(table.action),
	index("idx_target").on(table.targetType, table.targetId),
	index("idx_created").on(table.createdAt),
	index("idx_activity_community_created").on(table.communityId, table.createdAt),
]);

export const communityCategories = mysqlTable("community_categories", {
	id: varchar({ length: 50 }).notNull(),
	communityId: varchar("community_id", { length: 50 }).notNull(),
	name: varchar({ length: 200 }).notNull(),
	description: text().default('NULL'),
	color: varchar({ length: 20 }).default('NULL'),
	icon: varchar({ length: 50 }).default('NULL'),
	parentCategoryId: varchar("parent_category_id", { length: 50 }).default('NULL'),
	displayOrder: int("display_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()'),
},
(table) => [
	index("idx_community").on(table.communityId),
	index("idx_parent").on(table.parentCategoryId),
	index("idx_order").on(table.displayOrder),
]);

export const communityComments = mysqlTable("community_comments", {
	id: varchar({ length: 50 }).notNull(),
	postId: varchar("post_id", { length: 50 }).notNull(),
	content: text().notNull(),
	authorId: varchar("author_id", { length: 50 }).notNull(),
	parentCommentId: varchar("parent_comment_id", { length: 50 }).default('NULL'),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('current_timestamp()'),
	editedAt: timestamp("edited_at", { mode: 'string' }).default('NULL'),
	reactions: longtext().default('NULL'),
	mentionedUsers: longtext("mentioned_users").default('NULL'),
	isDeleted: tinyint("is_deleted").default(0),
	isApproved: tinyint("is_approved").default(1).notNull(),
},
(table) => [
	index("idx_post").on(table.postId),
	index("idx_author").on(table.authorId),
	index("idx_parent").on(table.parentCommentId),
	index("idx_created").on(table.createdAt),
	index("idx_comments_post_created").on(table.postId, table.createdAt),
	index("idx_comments_post").on(table.postId, table.isDeleted),
	index("idx_comments_author").on(table.authorId),
]);

export const communityFiles = mysqlTable("community_files", {
	id: varchar({ length: 50 }).notNull(),
	communityId: varchar("community_id", { length: 50 }).notNull(),
	postId: varchar("post_id", { length: 50 }).default('NULL'),
	fileName: varchar("file_name", { length: 500 }).notNull(),
	filePath: varchar("file_path", { length: 1000 }).notNull(),
	fileType: varchar("file_type", { length: 100 }).default('NULL'),
	fileSize: bigint("file_size", { mode: "number" }).default('NULL'),
	mimeType: varchar("mime_type", { length: 100 }).default('NULL'),
	uploadedBy: varchar("uploaded_by", { length: 50 }).notNull(),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).default('current_timestamp()'),
	description: text().default('NULL'),
	notes: text().default('NULL'),
	tags: longtext().default('NULL'),
	downloadsCount: int("downloads_count").default(0),
	isPublic: tinyint("is_public").default(0),
	thumbnailPath: varchar("thumbnail_path", { length: 1000 }).default('NULL'),
},
(table) => [
	index("idx_community").on(table.communityId),
	index("idx_post").on(table.postId),
	index("idx_uploader").on(table.uploadedBy),
	index("idx_type").on(table.fileType),
	index("idx_uploaded").on(table.uploadedAt),
	index("idx_files_community_uploaded").on(table.communityId, table.uploadedAt),
	index("idx_files_community").on(table.communityId),
	index("idx_files_uploader").on(table.uploadedBy),
]);

export const communityMembers = mysqlTable("community_members", {
	id: varchar({ length: 50 }).notNull(),
	communityId: varchar("community_id", { length: 50 }).notNull(),
	userId: varchar("user_id", { length: 50 }).notNull(),
	role: mysqlEnum(['owner','admin','moderator','editor','contributor','viewer']).default('\'viewer\''),
	customPermissions: longtext("custom_permissions").default('NULL'),
	joinedAt: timestamp("joined_at", { mode: 'string' }).default('current_timestamp()'),
	lastActiveAt: timestamp("last_active_at", { mode: 'string' }).default('NULL'),
	isMuted: tinyint("is_muted").default(0),
},
(table) => [
	index("idx_community").on(table.communityId),
	index("idx_user").on(table.userId),
	index("idx_role").on(table.role),
	index("idx_joined").on(table.joinedAt),
	unique("unique_member").on(table.communityId, table.userId),
]);

export const communityPosts = mysqlTable("community_posts", {
	id: varchar({ length: 50 }).notNull(),
	communityId: varchar("community_id", { length: 50 }).notNull(),
	title: varchar({ length: 300 }).default('NULL'),
	content: longtext().default('NULL'),
	contentType: mysqlEnum("content_type", ['markdown','rich_text','plain_text']).default('\'markdown\''),
	authorId: varchar("author_id", { length: 50 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('current_timestamp()'),
	editedAt: timestamp("edited_at", { mode: 'string' }).default('NULL'),
	isPinned: tinyint("is_pinned").default(0),
	isFeatured: tinyint("is_featured").default(0),
	isDraft: tinyint("is_draft").default(0),
	isApproved: tinyint("is_approved").default(1).notNull(),
	isDeleted: tinyint("is_deleted").default(0),
	viewsCount: int("views_count").default(0),
	reactions: longtext().default('NULL'),
	tags: longtext().default('NULL'),
	mentionedUsers: longtext("mentioned_users").default('NULL'),
	parentPostId: varchar("parent_post_id", { length: 50 }).default('NULL'),
	categoryId: varchar("category_id", { length: 50 }).default('NULL'),
},
(table) => [
	index("idx_community").on(table.communityId),
	index("idx_author").on(table.authorId),
	index("idx_created").on(table.createdAt),
	index("idx_pinned").on(table.isPinned),
	index("idx_featured").on(table.isFeatured),
	index("idx_draft").on(table.isDraft),
	index("idx_parent").on(table.parentPostId),
	index("idx_category").on(table.categoryId),
	index("idx_posts_community_created").on(table.communityId, table.createdAt),
	index("idx_posts_author_created").on(table.authorId, table.createdAt),
	index("idx_posts_community").on(table.communityId, table.isDeleted, table.isDraft, table.isApproved),
	index("idx_posts_author").on(table.authorId),
	index("idx_posts_pinned").on(table.isPinned, table.createdAt),
]);

export const communityReactions = mysqlTable("community_reactions", {
	id: varchar({ length: 100 }).notNull(),
	postId: varchar("post_id", { length: 100 }).notNull(),
	userId: varchar("user_id", { length: 100 }).notNull(),
	reactionType: mysqlEnum("reaction_type", ['like','love','celebrate','support','insightful','curious']).default('\'like\'').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
},
(table) => [
	index("idx_post_reactions").on(table.postId),
	index("idx_user_reactions").on(table.userId),
	index("idx_reaction_type").on(table.reactionType),
	unique("unique_user_post_reaction").on(table.postId, table.userId, table.reactionType),
]);

export const communityStats = mysqlTable("community_stats", {
	id: varchar({ length: 50 }).default('NULL'),
	membersCount: int("members_count").default('NULL'),
	name: varchar({ length: 200 }).default('NULL'),
	postsCount: int("posts_count").default('NULL'),
	totalComments: bigint("total_comments", { mode: "number" }).default('NULL'),
	totalFiles: bigint("total_files", { mode: "number" }).default('NULL'),
	totalPosts: bigint("total_posts", { mode: "number" }).default('NULL'),
	totalViews: decimal("total_views", { precision: 32, scale: 0 }).default('NULL'),
});

export const communityVault = mysqlTable("community_vault", {
	id: varchar({ length: 50 }).notNull(),
	communityId: varchar("community_id", { length: 50 }).notNull(),
	title: varchar({ length: 300 }).notNull(),
	itemType: mysqlEnum("item_type", ['api_key','password','secret','certificate','token','credentials','other']).notNull(),
	encryptedContent: text("encrypted_content").notNull(),
	encryptionIv: varchar("encryption_iv", { length: 100 }).notNull(),
	encryptionTag: varchar("encryption_tag", { length: 100 }).default('NULL'),
	description: text().default('NULL'),
	tags: longtext().default('NULL'),
	createdBy: varchar("created_by", { length: 50 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('current_timestamp()'),
	expiresAt: timestamp("expires_at", { mode: 'string' }).default('NULL'),
	accessCount: int("access_count").default(0),
	lastAccessedAt: timestamp("last_accessed_at", { mode: 'string' }).default('NULL'),
	lastAccessedBy: varchar("last_accessed_by", { length: 50 }).default('NULL'),
	allowedRoles: longtext("allowed_roles").default('NULL'),
	allowedUsers: longtext("allowed_users").default('NULL'),
},
(table) => [
	index("idx_community").on(table.communityId),
	index("idx_type").on(table.itemType),
	index("idx_creator").on(table.createdBy),
	index("idx_expires").on(table.expiresAt),
	index("idx_created").on(table.createdAt),
]);

export const communityVaultAccessLog = mysqlTable("community_vault_access_log", {
	id: varchar({ length: 50 }).notNull(),
	vaultItemId: varchar("vault_item_id", { length: 50 }).notNull(),
	userId: varchar("user_id", { length: 50 }).notNull(),
	action: mysqlEnum(['view','copy','edit','delete','decrypt']).notNull(),
	ipAddress: varchar("ip_address", { length: 50 }).default('NULL'),
	userAgent: text("user_agent").default('NULL'),
	accessedAt: timestamp("accessed_at", { mode: 'string' }).default('current_timestamp()'),
},
(table) => [
	index("idx_vault_item").on(table.vaultItemId),
	index("idx_user").on(table.userId),
	index("idx_accessed").on(table.accessedAt),
	index("idx_action").on(table.action),
]);

export const communityVoiceNotes = mysqlTable("community_voice_notes", {
	id: varchar({ length: 50 }).notNull(),
	postId: varchar("post_id", { length: 50 }).default('NULL'),
	commentId: varchar("comment_id", { length: 50 }).default('NULL'),
	filePath: varchar("file_path", { length: 1000 }).notNull(),
	duration: int().default('NULL'),
	fileSize: bigint("file_size", { mode: "number" }).default('NULL'),
	transcription: text().default('NULL'),
	transcriptionStatus: mysqlEnum("transcription_status", ['pending','processing','completed','failed']).default('\'pending\''),
	createdBy: varchar("created_by", { length: 50 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()'),
},
(table) => [
	index("idx_post").on(table.postId),
	index("idx_comment").on(table.commentId),
	index("idx_creator").on(table.createdBy),
	index("idx_status").on(table.transcriptionStatus),
]);

export const meetings = mysqlTable("meetings", {
	id: varchar({ length: 191 }).notNull(),
	title: varchar({ length: 500 }).notNull(),
	description: text().notNull(),
	meetingLink: varchar("meeting_link", { length: 1000 }).notNull(),
	meetingType: varchar("meeting_type", { length: 32 }).default('\'zoom\'').notNull(),
	startTime: datetime("start_time", { mode: 'string'}).notNull(),
	endTime: datetime("end_time", { mode: 'string'}).notNull(),
	timezone: varchar({ length: 100 }).default('\'UTC\'').notNull(),
	status: varchar({ length: 16 }).default('\'scheduled\'').notNull(),
	createdById: varchar("created_by_id", { length: 191 }).notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).default('current_timestamp()').notNull(),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
	projectId: varchar("project_id", { length: 191 }).default('NULL'),
	reminderMinutes: int("reminder_minutes").default(15),
	agenda: text().default('NULL'),
	notes: text().default('NULL'),
	recordingUrl: varchar("recording_url", { length: 1000 }).default('NULL'),
	isRecurring: tinyint("is_recurring").default(0).notNull(),
	recurrencePattern: varchar("recurrence_pattern", { length: 50 }).default('NULL'),
	recurrenceEndDate: datetime("recurrence_end_date", { mode: 'string'}).default('NULL'),
},
(table) => [
	index("idx_meetings_start_time").on(table.startTime),
	index("idx_meetings_status").on(table.status),
	index("idx_meetings_created_by").on(table.createdById),
	index("idx_meetings_project").on(table.projectId),
]);

export const meetingAttendees = mysqlTable("meeting_attendees", {
	id: varchar({ length: 191 }).notNull(),
	meetingId: varchar("meeting_id", { length: 191 }).notNull(),
	userId: varchar("user_id", { length: 191 }).notNull(),
	role: varchar({ length: 16 }).default('\'attendee\'').notNull(),
	status: varchar({ length: 16 }).default('\'pending\'').notNull(),
	responseAt: datetime("response_at", { mode: 'string'}).default('NULL'),
	addedAt: datetime("added_at", { mode: 'string'}).default('current_timestamp()').notNull(),
	notificationSent: tinyint("notification_sent").default(0).notNull(),
	reminderSent: tinyint("reminder_sent").default(0).notNull(),
},
(table) => [
	index("idx_meeting_attendees_meeting").on(table.meetingId),
	index("idx_meeting_attendees_user").on(table.userId),
	index("idx_meeting_attendees_status").on(table.status),
]);

export const notifications = mysqlTable("notifications", {
	id: varchar({ length: 191 }).notNull(),
	type: varchar({ length: 100 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	read: tinyint().default(0).notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).default('current_timestamp()').notNull(),
	userId: varchar("user_id", { length: 191 }).notNull().references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	relatedId: varchar("related_id", { length: 191 }).default('NULL'),
	relatedType: varchar("related_type", { length: 16 }).default('NULL'),
},
(table) => [
	index("idx_notifications_user_id").on(table.userId),
	index("idx_notifications_user_read").on(table.userId, table.read),
]);

export const notificationsBackup = mysqlTable("notifications_backup", {
	id: varchar({ length: 191 }).notNull(),
	type: varchar({ length: 100 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	read: tinyint().default(0).notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).default('current_timestamp()').notNull(),
	userId: varchar("user_id", { length: 191 }).notNull(),
	relatedId: varchar("related_id", { length: 191 }).default('NULL'),
	relatedType: varchar("related_type", { length: 16 }).default('NULL'),
});

export const projects = mysqlTable("projects", {
	id: varchar({ length: 191 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	status: varchar({ length: 16 }).notNull(),
	priority: varchar({ length: 8 }).notNull(),
	startDate: datetime("start_date", { mode: 'string'}).notNull(),
	dueDate: datetime("due_date", { mode: 'string'}).notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).default('current_timestamp()').notNull(),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
	completedAt: datetime("completed_at", { mode: 'string'}).default('NULL'),
	progress: int().notNull(),
	ownerId: varchar("owner_id", { length: 191 }).notNull().references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	color: varchar({ length: 50 }).notNull(),
	budget: decimal({ precision: 10, scale: 2 }).default('NULL'),
	estimatedHours: decimal("estimated_hours", { precision: 10, scale: 2 }).default('NULL'),
	actualHours: decimal("actual_hours", { precision: 10, scale: 2 }).default('NULL'),
},
(table) => [
	index("idx_projects_owner_id").on(table.ownerId),
]);

export const projectDocuments = mysqlTable("project_documents", {
	id: varchar({ length: 191 }).notNull(),
	projectId: varchar("project_id", { length: 191 }).notNull(),
	name: varchar({ length: 500 }).notNull(),
	size: int().notNull(),
	type: varchar({ length: 100 }).notNull(),
	url: varchar({ length: 1000 }).notNull(),
	uploadedById: varchar("uploaded_by_id", { length: 191 }).notNull(),
	uploadedAt: datetime("uploaded_at", { mode: 'string'}).default('current_timestamp()').notNull(),
},
(table) => [
	index("idx_project_documents_project_id").on(table.projectId),
	index("idx_project_documents_uploaded_by").on(table.uploadedById),
	index("idx_project_documents_uploaded_at").on(table.uploadedAt),
]);

export const projectNotes = mysqlTable("project_notes", {
	id: varchar({ length: 191 }).notNull(),
	projectId: varchar("project_id", { length: 191 }).notNull(),
	title: varchar({ length: 500 }).notNull(),
	content: text().notNull(),
	isPinned: tinyint("is_pinned").default(0).notNull(),
	createdById: varchar("created_by_id", { length: 191 }).notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).default('current_timestamp()').notNull(),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
},
(table) => [
	index("idx_project_notes_project_id").on(table.projectId),
	index("idx_project_notes_created_by").on(table.createdById),
	index("idx_project_notes_pinned").on(table.isPinned),
	index("idx_project_notes_created_at").on(table.createdAt),
]);

export const projectTags = mysqlTable("project_tags", {
	projectId: varchar("project_id", { length: 191 }).notNull().references(() => projects.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	tag: varchar({ length: 100 }).notNull(),
});

export const projectTeam = mysqlTable("project_team", {
	projectId: varchar("project_id", { length: 191 }).notNull().references(() => projects.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	userId: varchar("user_id", { length: 191 }).notNull().references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" } ),
},
(table) => [
	index("idx_project_team_project_id").on(table.projectId),
	index("idx_project_team_user_id").on(table.userId),
]);

export const pushSubscriptions = mysqlTable("push_subscriptions", {
	id: varchar({ length: 191 }).notNull(),
	userId: varchar("user_id", { length: 191 }).notNull().references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	endpoint: text().notNull(),
	p256Dh: text().notNull(),
	auth: text().notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).default('current_timestamp()').notNull(),
});

export const questionnaires = mysqlTable("questionnaires", {
	id: varchar({ length: 191 }).notNull(),
	title: varchar({ length: 500 }).notNull(),
	description: text().default('NULL'),
	instructions: text().default('NULL'),
	createdById: varchar("created_by_id", { length: 191 }).notNull(),
	targetType: varchar("target_type", { length: 50 }).notNull(),
	targetRole: varchar("target_role", { length: 50 }).default('NULL'),
	deadline: datetime({ mode: 'string'}).notNull(),
	isMandatory: tinyint("is_mandatory").default(1),
	allowLateSubmission: tinyint("allow_late_submission").default(0),
	showResultsToUsers: tinyint("show_results_to_users").default(0),
	status: varchar({ length: 50 }).default('\'draft\''),
	publishedAt: datetime("published_at", { mode: 'string'}).default('NULL'),
	createdAt: datetime("created_at", { mode: 'string'}).default('current_timestamp()'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
},
(table) => [
	index("idx_questionnaires_created_by").on(table.createdById),
	index("idx_questionnaires_status").on(table.status),
	index("idx_questionnaires_deadline").on(table.deadline),
]);

export const questionnaireAnswers = mysqlTable("questionnaire_answers", {
	id: varchar({ length: 191 }).notNull(),
	responseId: varchar("response_id", { length: 191 }).notNull(),
	questionId: varchar("question_id", { length: 191 }).notNull(),
	answerText: text("answer_text").default('NULL'),
	answerValue: varchar("answer_value", { length: 500 }).default('NULL'),
	answerNumber: decimal("answer_number", { precision: 10, scale: 2 }).default('NULL'),
	answerFileUrl: varchar("answer_file_url", { length: 1000 }).default('NULL'),
	answerOptions: longtext("answer_options").default('NULL'),
	createdAt: datetime("created_at", { mode: 'string'}).default('current_timestamp()'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
},
(table) => [
	index("idx_answers_response").on(table.responseId),
	index("idx_answers_question").on(table.questionId),
]);

export const questionnaireFeedback = mysqlTable("questionnaire_feedback", {
	id: varchar({ length: 191 }).notNull(),
	responseId: varchar("response_id", { length: 191 }).notNull(),
	questionId: varchar("question_id", { length: 191 }).default('NULL'),
	fromUserId: varchar("from_user_id", { length: 191 }).notNull(),
	message: text().notNull(),
	isCritical: tinyint("is_critical").default(0),
	createdAt: datetime("created_at", { mode: 'string'}).default('current_timestamp()'),
},
(table) => [
	index("question_id").on(table.questionId),
	index("from_user_id").on(table.fromUserId),
	index("idx_feedback_response").on(table.responseId),
	index("idx_feedback_critical").on(table.isCritical),
]);

export const questionnaireHistory = mysqlTable("questionnaire_history", {
	id: varchar({ length: 191 }).notNull(),
	questionnaireId: varchar("questionnaire_id", { length: 191 }).notNull(),
	responseId: varchar("response_id", { length: 191 }).default('NULL'),
	userId: varchar("user_id", { length: 191 }).notNull(),
	action: varchar({ length: 100 }).notNull(),
	notes: text().default('NULL'),
	createdAt: datetime("created_at", { mode: 'string'}).default('current_timestamp()'),
},
(table) => [
	index("user_id").on(table.userId),
	index("idx_history_questionnaire").on(table.questionnaireId),
	index("idx_history_response").on(table.responseId),
]);

export const questionnaireQuestions = mysqlTable("questionnaire_questions", {
	id: varchar({ length: 191 }).notNull(),
	questionnaireId: varchar("questionnaire_id", { length: 191 }).notNull(),
	questionText: text("question_text").notNull(),
	questionType: varchar("question_type", { length: 50 }).notNull(),
	isRequired: tinyint("is_required").default(1),
	options: longtext().default('NULL'),
	minValue: int("min_value").default('NULL'),
	maxValue: int("max_value").default('NULL'),
	maxFileSize: int("max_file_size").default('NULL'),
	allowedFileTypes: varchar("allowed_file_types", { length: 500 }).default('NULL'),
	placeholderText: varchar("placeholder_text", { length: 500 }).default('NULL'),
	helpText: text("help_text").default('NULL'),
	displayOrder: int("display_order").notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).default('current_timestamp()'),
},
(table) => [
	index("idx_questions_questionnaire").on(table.questionnaireId),
	index("idx_questions_order").on(table.displayOrder),
]);

export const questionnaireResponses = mysqlTable("questionnaire_responses", {
	id: varchar({ length: 191 }).notNull(),
	questionnaireId: varchar("questionnaire_id", { length: 191 }).notNull(),
	userId: varchar("user_id", { length: 191 }).notNull(),
	status: varchar({ length: 50 }).default('\'pending\''),
	submittedAt: datetime("submitted_at", { mode: 'string'}).default('NULL'),
	reviewedAt: datetime("reviewed_at", { mode: 'string'}).default('NULL'),
	reviewedById: varchar("reviewed_by_id", { length: 191 }).default('NULL'),
	adminNotes: text("admin_notes").default('NULL'),
	isLate: tinyint("is_late").default(0),
	score: decimal({ precision: 5, scale: 2 }).default('NULL'),
	createdAt: datetime("created_at", { mode: 'string'}).default('current_timestamp()'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
},
(table) => [
	index("reviewed_by_id").on(table.reviewedById),
	index("idx_responses_questionnaire").on(table.questionnaireId),
	index("idx_responses_user").on(table.userId),
	index("idx_responses_status").on(table.status),
	unique("unique_user_response").on(table.questionnaireId, table.userId),
]);

export const questionnaireTargets = mysqlTable("questionnaire_targets", {
	id: varchar({ length: 191 }).notNull(),
	questionnaireId: varchar("questionnaire_id", { length: 191 }).notNull(),
	userId: varchar("user_id", { length: 191 }).notNull(),
	isNotified: tinyint("is_notified").default(0),
	notifiedAt: datetime("notified_at", { mode: 'string'}).default('NULL'),
	createdAt: datetime("created_at", { mode: 'string'}).default('current_timestamp()'),
},
(table) => [
	index("idx_targets_questionnaire").on(table.questionnaireId),
	index("idx_targets_user").on(table.userId),
]);

export const subtasks = mysqlTable("subtasks", {
	id: varchar({ length: 191 }).notNull(),
	taskId: varchar("task_id", { length: 191 }).notNull().references(() => tasks.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	title: varchar({ length: 500 }).notNull(),
	description: text().default('NULL'),
	status: varchar({ length: 16 }).default('\'todo\'').notNull(),
	completed: tinyint().default(0).notNull(),
	startDate: datetime("start_date", { mode: 'string'}).default('NULL'),
	dueDate: datetime("due_date", { mode: 'string'}).default('NULL'),
	createdAt: datetime("created_at", { mode: 'string'}).default('current_timestamp()').notNull(),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
	assigneeId: varchar("assignee_id", { length: 191 }).default('NULL').references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	priority: varchar({ length: 8 }).default('NULL'),
},
(table) => [
	index("idx_subtasks_task_id").on(table.taskId),
]);

export const subtaskAssignees = mysqlTable("subtask_assignees", {
	subtaskId: varchar("subtask_id", { length: 191 }).notNull(),
	userId: varchar("user_id", { length: 191 }).notNull(),
},
(table) => [
	index("idx_subtask_assignees_subtask").on(table.subtaskId),
	index("idx_subtask_assignees_user").on(table.userId),
]);

export const subtaskTags = mysqlTable("subtask_tags", {
	subtaskId: varchar("subtask_id", { length: 191 }).notNull().references(() => subtasks.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	tag: varchar({ length: 100 }).notNull(),
});

export const tasks = mysqlTable("tasks", {
	id: varchar({ length: 191 }).notNull(),
	projectId: varchar("project_id", { length: 191 }).notNull().references(() => projects.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	title: varchar({ length: 500 }).notNull(),
	description: text().notNull(),
	status: varchar({ length: 16 }).notNull(),
	priority: varchar({ length: 8 }).notNull(),
	startDate: datetime("start_date", { mode: 'string'}).notNull(),
	dueDate: datetime("due_date", { mode: 'string'}).notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).default('current_timestamp()').notNull(),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
	completedAt: datetime("completed_at", { mode: 'string'}).default('NULL'),
	createdById: varchar("created_by_id", { length: 191 }).notNull().references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	approvalStatus: varchar("approval_status", { length: 16 }).default('NULL'),
	approvedAt: datetime("approved_at", { mode: 'string'}).default('NULL'),
	approvedById: varchar("approved_by_id", { length: 191 }).default('NULL').references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	rejectionReason: text("rejection_reason").default('NULL'),
	progress: int().notNull(),
},
(table) => [
	index("idx_tasks_project_id").on(table.projectId),
	index("idx_tasks_created_by").on(table.createdById),
	index("idx_tasks_approval_status").on(table.approvalStatus),
]);

export const taskAssignees = mysqlTable("task_assignees", {
	taskId: varchar("task_id", { length: 191 }).notNull().references(() => tasks.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	userId: varchar("user_id", { length: 191 }).notNull().references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" } ),
},
(table) => [
	index("idx_task_assignees_user_id").on(table.userId),
	index("idx_task_assignees_task_id").on(table.taskId),
]);

export const taskTags = mysqlTable("task_tags", {
	taskId: varchar("task_id", { length: 191 }).notNull().references(() => tasks.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	tag: varchar({ length: 100 }).notNull(),
});

export const timesheets = mysqlTable("timesheets", {
	id: varchar({ length: 191 }).notNull(),
	userId: varchar("user_id", { length: 191 }).notNull().references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	month: varchar({ length: 7 }).notNull(),
	status: varchar({ length: 16 }).default('\'draft\'').notNull(),
	submittedAt: datetime("submitted_at", { mode: 'string'}).default('NULL'),
	approvedAt: datetime("approved_at", { mode: 'string'}).default('NULL'),
	approvedById: varchar("approved_by_id", { length: 191 }).default('NULL').references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	returnedAt: datetime("returned_at", { mode: 'string'}).default('NULL'),
	returnComments: text("return_comments").default('NULL'),
	rejectedAt: datetime("rejected_at", { mode: 'string'}).default('NULL'),
	createdAt: datetime("created_at", { mode: 'string'}).default('current_timestamp()').notNull(),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
});

export const timesheetEntries = mysqlTable("timesheet_entries", {
	id: varchar({ length: 191 }).notNull(),
	timesheetId: varchar("timesheet_id", { length: 191 }).notNull().references(() => timesheets.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	date: varchar({ length: 10 }).notNull(),
	hours: decimal({ precision: 5, scale: 2 }).default('0.00').notNull(),
	note: text().default('NULL'),
});

export const users = mysqlTable("users", {
	id: varchar({ length: 191 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	avatar: text().default('NULL'),
	initials: varchar({ length: 10 }).notNull(),
	role: varchar({ length: 16 }).notNull(),
	status: varchar({ length: 16 }).default('NULL'),
	passwordHash: text("password_hash").default('NULL'),
});

export const userSettings = mysqlTable("user_settings", {
	userId: varchar("user_id", { length: 191 }).notNull().references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	emailNotifications: tinyint("email_notifications").default(1).notNull(),
	pushNotifications: tinyint("push_notifications").default(0).notNull(),
	taskReminders: tinyint("task_reminders").default(1).notNull(),
	projectUpdates: tinyint("project_updates").default(1).notNull(),
	timezone: varchar({ length: 100 }).default('\'UTC\'').notNull(),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('current_timestamp()').notNull(),
	meetingReminders: tinyint("meeting_reminders").default(1).notNull(),
	meetingUpdates: tinyint("meeting_updates").default(1).notNull(),
});
