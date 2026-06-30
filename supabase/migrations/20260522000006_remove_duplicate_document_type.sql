-- Remove duplicate `type` column from documents table.
-- `doc_type` serves the same purpose and is used throughout the codebase.
alter table public.documents drop column if exists type;
