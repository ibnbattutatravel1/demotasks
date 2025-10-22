-- ====================================
-- Questionnaires/Surveys System Tables
-- ====================================

-- Questionnaires (الاستبيانات)
CREATE TABLE IF NOT EXISTS questionnaires (
    id VARCHAR(191) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    instructions TEXT,
    created_by_id VARCHAR(191) NOT NULL,
    target_type VARCHAR(50) NOT NULL, -- 'all_users' | 'specific_users' | 'role_based'
    target_role VARCHAR(50), -- 'user' | 'project_lead' | null
    deadline DATETIME NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    allow_late_submission BOOLEAN DEFAULT FALSE,
    show_results_to_users BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft' | 'published' | 'closed'
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Target Users للاستبيان (لو specific users)
CREATE TABLE IF NOT EXISTS questionnaire_targets (
    id VARCHAR(191) PRIMARY KEY,
    questionnaire_id VARCHAR(191) NOT NULL,
    user_id VARCHAR(191) NOT NULL,
    is_notified BOOLEAN DEFAULT FALSE,
    notified_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Questions الأسئلة
CREATE TABLE IF NOT EXISTS questionnaire_questions (
    id VARCHAR(191) PRIMARY KEY,
    questionnaire_id VARCHAR(191) NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL, -- 'mcq' | 'text' | 'rating' | 'yes_no' | 'file' | 'date' | 'multiple_choice' | 'checkbox'
    is_required BOOLEAN DEFAULT TRUE,
    options JSON, -- للـ MCQ والـ Multiple Choice
    min_value INT, -- للـ Rating
    max_value INT, -- للـ Rating
    max_file_size INT, -- للـ File Upload (بالـ MB)
    allowed_file_types VARCHAR(500), -- 'pdf,doc,docx,jpg,png'
    placeholder_text VARCHAR(500),
    help_text TEXT,
    display_order INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE
);

-- User Responses الردود
CREATE TABLE IF NOT EXISTS questionnaire_responses (
    id VARCHAR(191) PRIMARY KEY,
    questionnaire_id VARCHAR(191) NOT NULL,
    user_id VARCHAR(191) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending' | 'submitted' | 'approved' | 'rejected' | 'returned'
    submitted_at DATETIME,
    reviewed_at DATETIME,
    reviewed_by_id VARCHAR(191),
    admin_notes TEXT, -- ملاحظات الأدمن
    is_late BOOLEAN DEFAULT FALSE,
    score DECIMAL(5,2), -- لو فيه درجات
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_response (questionnaire_id, user_id)
);

-- Answer للأسئلة
CREATE TABLE IF NOT EXISTS questionnaire_answers (
    id VARCHAR(191) PRIMARY KEY,
    response_id VARCHAR(191) NOT NULL,
    question_id VARCHAR(191) NOT NULL,
    answer_text TEXT, -- للـ Text
    answer_value VARCHAR(500), -- للـ MCQ, Yes/No, Date
    answer_number DECIMAL(10,2), -- للـ Rating
    answer_file_url VARCHAR(1000), -- للـ File Upload
    answer_options JSON, -- للـ Multiple Choice/Checkbox
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (response_id) REFERENCES questionnaire_responses(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questionnaire_questions(id) ON DELETE CASCADE
);

-- History/Audit Log
CREATE TABLE IF NOT EXISTS questionnaire_history (
    id VARCHAR(191) PRIMARY KEY,
    questionnaire_id VARCHAR(191) NOT NULL,
    response_id VARCHAR(191),
    user_id VARCHAR(191) NOT NULL,
    action VARCHAR(100) NOT NULL, -- 'submitted' | 'approved' | 'rejected' | 'returned' | 'resubmitted'
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE,
    FOREIGN KEY (response_id) REFERENCES questionnaire_responses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Comments/Feedback على الردود
CREATE TABLE IF NOT EXISTS questionnaire_feedback (
    id VARCHAR(191) PRIMARY KEY,
    response_id VARCHAR(191) NOT NULL,
    question_id VARCHAR(191),
    from_user_id VARCHAR(191) NOT NULL,
    message TEXT NOT NULL,
    is_critical BOOLEAN DEFAULT FALSE, -- للعرض باللون الأحمر
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (response_id) REFERENCES questionnaire_responses(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questionnaire_questions(id) ON DELETE SET NULL,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes للأداء
CREATE INDEX idx_questionnaires_created_by ON questionnaires(created_by_id);
CREATE INDEX idx_questionnaires_status ON questionnaires(status);
CREATE INDEX idx_questionnaires_deadline ON questionnaires(deadline);

CREATE INDEX idx_targets_questionnaire ON questionnaire_targets(questionnaire_id);
CREATE INDEX idx_targets_user ON questionnaire_targets(user_id);

CREATE INDEX idx_questions_questionnaire ON questionnaire_questions(questionnaire_id);
CREATE INDEX idx_questions_order ON questionnaire_questions(display_order);

CREATE INDEX idx_responses_questionnaire ON questionnaire_responses(questionnaire_id);
CREATE INDEX idx_responses_user ON questionnaire_responses(user_id);
CREATE INDEX idx_responses_status ON questionnaire_responses(status);

CREATE INDEX idx_answers_response ON questionnaire_answers(response_id);
CREATE INDEX idx_answers_question ON questionnaire_answers(question_id);

CREATE INDEX idx_history_questionnaire ON questionnaire_history(questionnaire_id);
CREATE INDEX idx_history_response ON questionnaire_history(response_id);

CREATE INDEX idx_feedback_response ON questionnaire_feedback(response_id);
CREATE INDEX idx_feedback_critical ON questionnaire_feedback(is_critical);
