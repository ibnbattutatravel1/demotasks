-- Create new database schema for Projects >> Tasks >> Subtasks hierarchy

-- Users table (for authentication and team management)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar TEXT,
    initials VARCHAR(10),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table (top level of hierarchy)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('planning', 'in-progress', 'review', 'completed', 'on-hold')),
    priority VARCHAR(10) NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Progress tracking
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    tasks_completed INTEGER DEFAULT 0,
    total_tasks INTEGER DEFAULT 0,
    
    -- Ownership
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    color VARCHAR(20) DEFAULT 'indigo',
    budget DECIMAL(10,2),
    estimated_hours INTEGER,
    actual_hours INTEGER
);

-- Tasks table (middle level of hierarchy)
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('todo', 'in-progress', 'review', 'done')),
    priority VARCHAR(10) NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Assignment and approval
    created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    approval_status VARCHAR(20) CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    
    -- Progress tracking
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    subtasks_completed INTEGER DEFAULT 0,
    total_subtasks INTEGER DEFAULT 0,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}'
);

-- Subtasks table (lowest level of hierarchy)
CREATE TABLE IF NOT EXISTS subtasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Assignment
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Metadata
    priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')),
    tags TEXT[] DEFAULT '{}'
);

-- Task assignments (many-to-many relationship for multiple assignees)
CREATE TABLE IF NOT EXISTS task_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(task_id, user_id)
);

-- Project team members (many-to-many relationship)
CREATE TABLE IF NOT EXISTS project_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Comments (can be attached to tasks or subtasks)
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- User who created the comment
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Polymorphic relationship (either task_id OR subtask_id)
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    subtask_id UUID REFERENCES subtasks(id) ON DELETE CASCADE,
    
    -- Ensure comment belongs to either a task or subtask, not both
    CONSTRAINT comment_belongs_to_one CHECK (
        (task_id IS NOT NULL AND subtask_id IS NULL) OR 
        (task_id IS NULL AND subtask_id IS NOT NULL)
    )
);

-- Attachments (can be attached to tasks)
CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    file_size VARCHAR(20),
    file_url TEXT NOT NULL,
    file_type VARCHAR(100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- User who uploaded the attachment
    uploaded_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Attached to task
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'task_assigned', 'task_approved', 'task_rejected', 'task_completed',
        'project_created', 'deadline_approaching'
    )),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- User who receives the notification
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Optional reference to related entity
    related_id UUID,
    related_type VARCHAR(20) CHECK (related_type IN ('task', 'project', 'subtask'))
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_due_date ON projects(due_date);

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by_id ON tasks(created_by_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_approval_status ON tasks(approval_status);

CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_assignee_id ON subtasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_completed ON subtasks(completed);

CREATE INDEX IF NOT EXISTS idx_task_assignments_task_id ON task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_user_id ON task_assignments(user_id);

CREATE INDEX IF NOT EXISTS idx_project_team_members_project_id ON project_team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_team_members_user_id ON project_team_members(user_id);

CREATE INDEX IF NOT EXISTS idx_comments_task_id ON comments(task_id);
CREATE INDEX IF NOT EXISTS idx_comments_subtask_id ON comments(subtask_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

CREATE INDEX IF NOT EXISTS idx_attachments_task_id ON attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by_id ON attachments(uploaded_by_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
