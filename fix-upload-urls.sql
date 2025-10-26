-- Fix upload URLs to include /api prefix
-- This fixes URLs that were stored without the /api prefix

-- Fix project documents
UPDATE project_documents 
SET url = CONCAT('/api', url) 
WHERE url LIKE '/uploads/%' AND url NOT LIKE '/api/uploads/%';

-- Fix community files
UPDATE community_files 
SET file_path = CONCAT('/api', file_path) 
WHERE file_path LIKE '/uploads/%' AND file_path NOT LIKE '/api/uploads/%';

-- Check results
SELECT COUNT(*) as fixed_project_docs FROM project_documents WHERE url LIKE '/api/uploads/%';
SELECT COUNT(*) as fixed_community_files FROM community_files WHERE file_path LIKE '/api/uploads/%';
