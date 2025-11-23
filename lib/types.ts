// User and Team Member Types
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  initials: string
  role: "admin" | "user"
}

export interface TeamMember {
  id: string
  name: string
  avatar?: string
  initials: string
  email?: string
  role?: string
}

// Comment Type (shared across tasks and subtasks)
export interface Comment {
  id: string
  userId: string
  user: string
  avatar?: string
  content: string
  createdAt: string
  updatedAt?: string
}

// Subtask Type (lowest level in hierarchy)
export interface Subtask {
  id: string
  taskId: string // Foreign key to parent task
  title: string
  description?: string
  status?: "planning" | "todo" | "in-progress" | "review" | "done" | "blocked" | "postponed"
  completed: boolean
  startDate?: string
  dueDate?: string
  createdAt: string
  updatedAt?: string
  assigneeIds?: string[] // Multiple assignee IDs
  assignees?: TeamMember[] // Multiple assignee objects
  comments: Comment[]
  priority?: "low" | "medium" | "high"
  tags: string[]
}

// Task Type (middle level in hierarchy)
export interface Task {
  id: string
  projectId: string // Foreign key to parent project
  title: string
  description: string
  status: "planning" | "todo" | "in-progress" | "review" | "done" | "blocked" | "postponed"
  priority: "low" | "medium" | "high"
  startDate: string
  dueDate: string
  createdAt: string
  updatedAt?: string
  completedAt?: string

  // Assignment and approval
  assigneeId?: string
  assignee?: TeamMember
  assignees: TeamMember[] // Support multiple assignees
  createdById: string
  createdBy: TeamMember
  approvalStatus?: "pending" | "approved" | "rejected"
  approvedAt?: string
  approvedById?: string
  rejectionReason?: string

  // Progress tracking
  progress: number // 0-100
  subtasks: Subtask[]
  subtasksCompleted: number
  totalSubtasks: number

  // Metadata
  comments: Comment[]
  attachments: Attachment[]
}

// Project Type (top level in hierarchy)
export interface Project {
  id: string
  name: string
  description: string
  status: "planning" | "in-progress" | "review" | "completed" | "on-hold"
  priority: "low" | "medium" | "high"
  startDate: string
  dueDate: string
  createdAt: string
  updatedAt?: string
  completedAt?: string

  // Progress tracking
  progress: number // 0-100 (calculated from tasks)
  tasks: Task[]
  tasksCompleted: number
  totalTasks: number

  // Team and ownership
  ownerId: string
  owner: TeamMember
  team: TeamMember[]

  // Metadata
  tags: string[]
  color: string // For UI theming
}

// Attachment Type
export interface Attachment {
  id: string
  name: string
  size: string
  url: string
  type: string
  uploadedAt: string
  uploadedById: string
  uploadedBy: TeamMember
}

// Filter and View Types
export interface ProjectFilters {
  status?: Project["status"][]
  priority?: Project["priority"][]
  owner?: string[]
  tags?: string[]
  dateRange?: {
    start: string
    end: string
  }
}

export interface TaskFilters {
  status?: Task["status"][]
  priority?: Task["priority"][]
  assignee?: string[]
  project?: string[]
  approvalStatus?: Task["approvalStatus"][]
  dateRange?: {
    start: string
    end: string
  }
}

// Dashboard Statistics Types
export interface ProjectStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  overdue: number
  avgProgress: number
}

export interface TaskStats {
  totalTasks: number
  pendingApproval: number
  inProgress: number
  completed: number
  overdue: number
  myTasks: number
  myCreated: number
}

// Notification Types
export interface Notification {
  id: string
  type:
    | "task_assigned"
    | "task_approved"
    | "task_rejected"
    | "task_completed"
    | "project_created"
    | "deadline_approaching"
  title: string
  message: string
  read: boolean
  createdAt: string
  userId: string
  relatedId?: string // ID of related task/project
  relatedType?: "task" | "project" | "subtask"
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Form Types
export interface CreateProjectForm {
  name: string
  description: string
  priority: Project["priority"]
  startDate: string
  dueDate: string
  ownerId: string
  teamIds: string[]
  tags: string[]
  color: string
}

export interface CreateTaskForm {
  projectId: string
  title: string
  description: string
  priority: Task["priority"]
  startDate: string
  dueDate: string
  assigneeIds: string[]
}

export interface CreateSubtaskForm {
  taskId: string
  title: string
  description?: string
  startDate?: string
  dueDate?: string
  assigneeId?: string
  priority?: Subtask["priority"]
  tags: string[]
}
