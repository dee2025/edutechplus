-- Drop polls tables
-- This migration removes all polls-related tables from the database

-- Drop tables in reverse order due to foreign key constraints
DROP TABLE IF EXISTS `poll_votes`;
DROP TABLE IF EXISTS `poll_options`;
DROP TABLE IF EXISTS `polls`;
