-- Quick SQL for Project Workspace Tables
-- Copy and paste this into MySQL

-- Notes Table
CREATE TABLE IF NOT EXISTS project_notes (
    id VARCHAR(191) PRIMARY KEY,
    project_id VARCHAR(191) NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_by_id VARCHAR(191) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Documents Table
CREATE TABLE IF NOT EXISTS project_documents (
    id VARCHAR(191) PRIMARY KEY,
    project_id VARCHAR(191) NOT NULL,
    name VARCHAR(500) NOT NULL,
    size INT NOT NULL,
    type VARCHAR(100) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    uploaded_by_id VARCHAR(191) NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_project_notes_project_id ON project_notes(project_id);
CREATE INDEX idx_project_notes_created_by ON project_notes(created_by_id);
CREATE INDEX idx_project_documents_project_id ON project_documents(project_id);
CREATE INDEX idx_project_documents_uploaded_by ON project_documents(uploaded_by_id);
