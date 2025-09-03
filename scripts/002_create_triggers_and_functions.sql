-- Create database triggers and functions for automatic progress calculation

-- Function to update project progress based on task completion
CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Update project statistics
    UPDATE projects 
    SET 
        total_tasks = (
            SELECT COUNT(*) 
            FROM tasks 
            WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
        ),
        tasks_completed = (
            SELECT COUNT(*) 
            FROM tasks 
            WHERE project_id = COALESCE(NEW.project_id, OLD.project_id) 
            AND status = 'done'
        ),
        progress = CASE 
            WHEN (SELECT COUNT(*) FROM tasks WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)) = 0 
            THEN 0
            ELSE ROUND(
                (SELECT COUNT(*) FROM tasks WHERE project_id = COALESCE(NEW.project_id, OLD.project_id) AND status = 'done') * 100.0 / 
                (SELECT COUNT(*) FROM tasks WHERE project_id = COALESCE(NEW.project_id, OLD.project_id))
            )
        END,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update task progress based on subtask completion
CREATE OR REPLACE FUNCTION update_task_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Update task statistics
    UPDATE tasks 
    SET 
        total_subtasks = (
            SELECT COUNT(*) 
            FROM subtasks 
            WHERE task_id = COALESCE(NEW.task_id, OLD.task_id)
        ),
        subtasks_completed = (
            SELECT COUNT(*) 
            FROM subtasks 
            WHERE task_id = COALESCE(NEW.task_id, OLD.task_id) 
            AND completed = TRUE
        ),
        progress = CASE 
            WHEN (SELECT COUNT(*) FROM subtasks WHERE task_id = COALESCE(NEW.task_id, OLD.task_id)) = 0 
            THEN 0
            ELSE ROUND(
                (SELECT COUNT(*) FROM subtasks WHERE task_id = COALESCE(NEW.task_id, OLD.task_id) AND completed = TRUE) * 100.0 / 
                (SELECT COUNT(*) FROM subtasks WHERE task_id = COALESCE(NEW.task_id, OLD.task_id))
            )
        END,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.task_id, OLD.task_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for project progress updates
CREATE TRIGGER trigger_update_project_progress_on_task_change
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_project_progress();

-- Triggers for task progress updates
CREATE TRIGGER trigger_update_task_progress_on_subtask_change
    AFTER INSERT OR UPDATE OR DELETE ON subtasks
    FOR EACH ROW
    EXECUTE FUNCTION update_task_progress();

-- Triggers for updating timestamps
CREATE TRIGGER trigger_update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_subtasks_updated_at
    BEFORE UPDATE ON subtasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
