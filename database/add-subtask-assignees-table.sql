-- Create subtask_assignees table for many-to-many relationship between subtasks and users
CREATE TABLE IF NOT EXISTS subtask_assignees (
    subtask_id VARCHAR(191) NOT NULL,
    user_id VARCHAR(191) NOT NULL,
    PRIMARY KEY (subtask_id, user_id),
    FOREIGN KEY (subtask_id) REFERENCES subtasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_subtask_assignees_subtask (subtask_id),
    INDEX idx_subtask_assignees_user (user_id)
);
