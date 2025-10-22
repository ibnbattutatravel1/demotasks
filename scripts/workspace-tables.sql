-- ====================================
-- Project Workspace Tables
-- ====================================
-- Run this SQL directly in your MySQL database
-- Use MySQL Workbench or command line:
-- mysql -u your_user -p your_database < workspace-tables.sql

-- Create project_notes table
CREATE TABLE IF NOT EXISTS project_notes (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    project_id VARCHAR(191) NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_by_id VARCHAR(191) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    
    -- Foreign keys
    CONSTRAINT fk_project_notes_project 
        FOREIGN KEY (project_id) REFERENCES projects(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_project_notes_creator 
        FOREIGN KEY (created_by_id) REFERENCES users(id) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create project_documents table
CREATE TABLE IF NOT EXISTS project_documents (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    project_id VARCHAR(191) NOT NULL,
    name VARCHAR(500) NOT NULL,
    size INT NOT NULL,
    type VARCHAR(100) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    uploaded_by_id VARCHAR(191) NOT NULL,
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_project_docs_project 
        FOREIGN KEY (project_id) REFERENCES projects(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_project_docs_uploader 
        FOREIGN KEY (uploaded_by_id) REFERENCES users(id) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better performance
CREATE INDEX idx_project_notes_project_id ON project_notes(project_id);
CREATE INDEX idx_project_notes_created_by ON project_notes(created_by_id);
CREATE INDEX idx_project_notes_pinned ON project_notes(is_pinned);
CREATE INDEX idx_project_notes_created_at ON project_notes(created_at);

CREATE INDEX idx_project_documents_project_id ON project_documents(project_id);
CREATE INDEX idx_project_documents_uploaded_by ON project_documents(uploaded_by_id);
CREATE INDEX idx_project_documents_uploaded_at ON project_documents(uploaded_at);

-- Verify tables were created
SHOW TABLES LIKE 'project_%';

-- Check table structure
DESCRIBE project_notes;
DESCRIBE project_documents;
