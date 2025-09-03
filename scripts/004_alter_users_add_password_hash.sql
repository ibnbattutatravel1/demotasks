-- Add password_hash column to users if it does not exist
ALTER TABLE users ADD COLUMN password_hash TEXT;
