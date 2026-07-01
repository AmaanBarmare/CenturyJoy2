-- Migration 001 — New Service Request fields + 3D model uploads
-- Idempotent. Safe to re-run.

-- PROJECTS: project type, services, structured brief
alter table projects
  add column if not exists project_type varchar(20)
    check (project_type in ('residential','commercial','hospitality','retail','other')),
  add column if not exists services text[],
  add column if not exists brief_design_intent        text check (char_length(brief_design_intent) <= 2000),
  add column if not exists brief_client_requirements  text check (char_length(brief_client_requirements) <= 2000),
  add column if not exists brief_preferred_style      text check (char_length(brief_preferred_style) <= 2000),
  add column if not exists brief_material_preferences text check (char_length(brief_material_preferences) <= 2000),
  add column if not exists brief_special_instructions text check (char_length(brief_special_instructions) <= 2000);

-- PROJECT FILES: allow the new 3D-model category
alter table project_files drop constraint if exists project_files_category_check;
alter table project_files
  add constraint project_files_category_check
  check (category in (
    'plan_master','plan_floor','elevation',
    'sections','rcp_layouts','models_3d','references'
  ));
