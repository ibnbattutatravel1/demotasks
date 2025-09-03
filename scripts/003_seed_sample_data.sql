-- Seed database with sample data following the new hierarchy

-- Insert sample users
INSERT INTO users (id, name, email, avatar, initials, role) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Sarah Chen', 'sarah.chen@company.com', '/diverse-woman-portrait.png', 'SC', 'admin'),
('550e8400-e29b-41d4-a716-446655440002', 'Marcus Johnson', 'marcus.johnson@company.com', '/thoughtful-man.png', 'MJ', 'user'),
('550e8400-e29b-41d4-a716-446655440003', 'Elena Rodriguez', 'elena.rodriguez@company.com', '/professional-woman.png', 'ER', 'user'),
('550e8400-e29b-41d4-a716-446655440004', 'David Kim', 'david.kim@company.com', '/developer-working.png', 'DK', 'user'),
('550e8400-e29b-41d4-a716-446655440005', 'Alice Johnson', 'alice.johnson@company.com', '/diverse-woman-portrait.png', 'AJ', 'user'),
('550e8400-e29b-41d4-a716-446655440006', 'Bob Smith', 'bob.smith@company.com', '/thoughtful-man.png', 'BS', 'user');

-- Insert sample projects
INSERT INTO projects (id, name, description, status, priority, due_date, owner_id, tags, color, budget, estimated_hours) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Website Redesign', 'Complete overhaul of the company website with modern design and improved UX', 'in-progress', 'high', '2024-02-15', '550e8400-e29b-41d4-a716-446655440001', '{"Design", "Frontend", "UX"}', 'indigo', 50000.00, 400),
('660e8400-e29b-41d4-a716-446655440002', 'Mobile App Development', 'Native iOS and Android app for customer engagement and service delivery', 'in-progress', 'medium', '2024-03-30', '550e8400-e29b-41d4-a716-446655440001', '{"Mobile", "iOS", "Android"}', 'emerald', 75000.00, 600),
('660e8400-e29b-41d4-a716-446655440003', 'API Integration Platform', 'Unified platform for managing third-party integrations and data synchronization', 'review', 'high', '2024-01-20', '550e8400-e29b-41d4-a716-446655440002', '{"Backend", "API", "Integration"}', 'blue', 30000.00, 300);

-- Insert project team members
INSERT INTO project_team_members (project_id, user_id, role) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'Lead Designer'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440006', 'Frontend Developer'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'Developer'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'Mobile Developer'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Backend Developer'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 'API Developer'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'Integration Specialist');

-- Insert sample tasks
INSERT INTO tasks (id, project_id, title, description, status, priority, due_date, created_by_id, approval_status, tags) VALUES
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Design System Updates', 'Update color palette and typography', 'todo', 'high', '2024-01-15', '550e8400-e29b-41d4-a716-446655440001', 'approved', '{"Design", "UI"}'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Homepage Redesign', 'Complete redesign of the homepage layout', 'in-progress', 'high', '2024-01-18', '550e8400-e29b-41d4-a716-446655440001', 'approved', '{"Design", "Frontend"}'),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', 'User Authentication', 'Implement user login and registration', 'review', 'medium', '2024-01-20', '550e8400-e29b-41d4-a716-446655440002', 'pending', '{"Mobile", "Auth"}'),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440003', 'API Documentation', 'Create comprehensive API documentation', 'done', 'low', '2024-01-12', '550e8400-e29b-41d4-a716-446655440003', 'approved', '{"Documentation", "API"}');

-- Insert task assignments
INSERT INTO task_assignments (task_id, user_id, assigned_by_id) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003');

-- Insert sample subtasks
INSERT INTO subtasks (id, task_id, title, description, completed, due_date, assignee_id, priority, tags) VALUES
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Create button components', 'Design and implement all button variants', TRUE, '2024-01-10', '550e8400-e29b-41d4-a716-446655440005', 'high', '{"Design", "Components"}'),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', 'Design form elements', 'Create form input styles and validation states', TRUE, '2024-01-12', '550e8400-e29b-41d4-a716-446655440005', 'medium', '{"Design", "Forms"}'),
('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', 'Build card layouts', 'Implement responsive card components', TRUE, '2024-01-13', '550e8400-e29b-41d4-a716-446655440006', 'medium', '{"Frontend", "Components"}'),
('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440001', 'Navigation components', 'Create header and sidebar navigation', FALSE, '2024-01-16', '550e8400-e29b-41d4-a716-446655440006', 'high', '{"Frontend", "Navigation"}'),
('880e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440002', 'Hero section design', 'Design the main hero section layout', FALSE, '2024-01-17', '550e8400-e29b-41d4-a716-446655440005', 'high', '{"Design", "Homepage"}'),
('880e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440002', 'Responsive breakpoints', 'Implement mobile and tablet layouts', FALSE, '2024-01-19', '550e8400-e29b-41d4-a716-446655440006', 'medium', '{"Frontend", "Responsive"}');

-- Insert sample comments
INSERT INTO comments (id, content, user_id, task_id) VALUES
('990e8400-e29b-41d4-a716-446655440001', 'I''ve completed all button variants including hover states.', '550e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440002', 'Great work on the forms. The validation states look perfect.', '550e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440001');

INSERT INTO comments (id, content, user_id, subtask_id) VALUES
('990e8400-e29b-41d4-a716-446655440003', 'Working on the mobile navigation. Should be done by tomorrow.', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440004'),
('990e8400-e29b-41d4-a716-446655440004', 'Form validation is working perfectly!', '550e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440002');

-- Insert sample attachments
INSERT INTO attachments (id, name, file_size, file_url, file_type, uploaded_by_id, task_id) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', 'design-system-mockups.fig', '2.4 MB', '/attachments/design-system-mockups.fig', 'application/figma', '550e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440001'),
('aa0e8400-e29b-41d4-a716-446655440002', 'component-specs.pdf', '1.1 MB', '/attachments/component-specs.pdf', 'application/pdf', '550e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440001');

-- Insert sample notifications
INSERT INTO notifications (id, type, title, message, user_id, related_id, related_type) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', 'task_assigned', 'New Task Assigned', 'You have been assigned to "Design System Updates"', '550e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440001', 'task'),
('bb0e8400-e29b-41d4-a716-446655440002', 'task_approved', 'Task Approved', 'Your task "API Documentation" has been approved', '550e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', 'task'),
('bb0e8400-e29b-41d4-a716-446655440003', 'project_created', 'New Project Created', 'You have been added to the "Website Redesign" project', '550e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440001', 'project');
