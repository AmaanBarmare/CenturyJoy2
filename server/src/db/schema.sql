-- ============================================================
-- Century Joy — Database schema (Supabase / PostgreSQL 15)
-- Run this in the Supabase SQL editor once per project.
-- Auth is handled by our Express API (custom JWT), so all
-- access goes through the service-role key. RLS is ENABLED with
-- NO permissive policies => anon/authenticated roles are denied
-- entirely; only the service role (our server) can read/write.
-- ============================================================

create extension if not exists pgcrypto;

-- ── USERS ───────────────────────────────────────────────
create table if not exists users (
  id                    uuid primary key default gen_random_uuid(),
  email                 varchar(255) unique not null,
  name                  varchar(255) not null,
  role                  varchar(20) not null check (role in ('client','studio','admin')),
  password_hash         text not null,
  is_active             boolean not null default true,
  must_change_password  boolean not null default true,
  company_name          varchar(255),
  phone                 varchar(20),
  failed_login_count    smallint not null default 0,
  locked_until          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  last_login_at         timestamptz,
  created_by            uuid references users(id)
);

-- ── REFRESH TOKENS ──────────────────────────────────────
create table if not exists refresh_tokens (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  token_hash  text not null unique,
  expires_at  timestamptz not null,
  revoked_at  timestamptz,
  ip_address  inet,
  user_agent  text,
  created_at  timestamptz not null default now()
);

-- ── PASSWORD RESET TOKENS ───────────────────────────────
create table if not exists password_reset_tokens (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  token_hash  text not null unique,
  expires_at  timestamptz not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

-- ── PROJECTS ────────────────────────────────────────────
-- Global incrementing counter; year in reference_number is display only.
create sequence if not exists project_seq start 1;

create table if not exists projects (
  id                uuid primary key default gen_random_uuid(),
  reference_number  varchar(20) unique not null
                    default ('CJ-' || extract(year from now())::text || '-'
                             || lpad(nextval('project_seq')::text, 4, '0')),
  client_id         uuid not null references users(id),
  title             varchar(255) not null,
  status            varchar(40) not null default 'pending'
                    check (status in (
                      'pending','accepted','in_progress',
                      'first_draft_submitted',
                      'revision_1_requested','revision_1_in_progress','revision_1_submitted',
                      'revision_2_requested','revision_2_in_progress','revision_2_submitted',
                      'completed','closed'
                    )),
  project_type      varchar(20) check (project_type in ('residential','commercial','hospitality','retail','other')),
  services          text[],
  concept_note      text check (char_length(concept_note) <= 250),   -- legacy; new projects use the structured brief below
  brief_design_intent        text check (char_length(brief_design_intent) <= 2000),
  brief_client_requirements  text check (char_length(brief_client_requirements) <= 2000),
  brief_preferred_style      text check (char_length(brief_preferred_style) <= 2000),
  brief_material_preferences text check (char_length(brief_material_preferences) <= 2000),
  brief_special_instructions text check (char_length(brief_special_instructions) <= 2000),
  number_of_views   smallint not null check (number_of_views between 1 and 10),
  revisions_used    smallint not null default 0 check (revisions_used <= 2),
  revisions_allowed smallint not null default 2,
  is_deleted        boolean not null default false,
  accepted_at       timestamptz,
  accepted_by       uuid references users(id),
  completed_at      timestamptz,
  closed_at         timestamptz,
  closed_by         uuid references users(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── PROJECT FILES (client uploads) ──────────────────────
create table if not exists project_files (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references projects(id) on delete cascade,
  category        varchar(30) not null check (category in (
                    'plan_master','plan_floor','elevation',
                    'sections','rcp_layouts','models_3d','references'
                  )),
  original_name   varchar(255) not null,
  storage_key     varchar(600) not null unique,
  file_size_bytes bigint not null,
  mime_type       varchar(100) not null,
  is_confirmed    boolean not null default false,
  uploaded_by     uuid not null references users(id),
  created_at      timestamptz not null default now()
);

-- ── DELIVERABLES (studio uploads) ───────────────────────
create table if not exists deliverables (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references projects(id) on delete cascade,
  view_number     smallint not null check (view_number between 1 and 10),
  iteration       varchar(20) not null default 'original'
                  check (iteration in ('original','revision_1','revision_2')),
  original_name   varchar(255) not null,
  storage_key     varchar(600) not null unique,
  file_size_bytes bigint not null,
  mime_type       varchar(100) not null,
  is_confirmed    boolean not null default false,
  uploaded_by     uuid not null references users(id),
  created_at      timestamptz not null default now()
);

-- ── REVISION REQUESTS ───────────────────────────────────
create table if not exists revision_requests (
  id               uuid primary key default gen_random_uuid(),
  project_id       uuid not null references projects(id),
  revision_number  smallint not null check (revision_number in (1, 2)),
  requested_by     uuid not null references users(id),
  notes            text check (char_length(notes) <= 500),
  created_at       timestamptz not null default now()
);

-- ── PROJECT STATUS HISTORY (immutable) ──────────────────
create table if not exists project_status_history (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id),
  from_status varchar(40),
  to_status   varchar(40) not null,
  changed_by  uuid not null references users(id),
  reason      text,
  created_at  timestamptz not null default now()
);

-- ── AUDIT LOG (immutable) ───────────────────────────────
create table if not exists audit_log (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references users(id),
  user_email   varchar(255),
  user_role    varchar(20),
  action       varchar(100) not null,
  entity_type  varchar(50),
  entity_id    uuid,
  metadata     jsonb,
  ip_address   inet,
  user_agent   text,
  created_at   timestamptz not null default now()
);

-- ── EMAIL NOTIFICATION LOG ──────────────────────────────
create table if not exists email_notifications (
  id               uuid primary key default gen_random_uuid(),
  recipient_email  varchar(255) not null,
  subject          varchar(255) not null,
  template         varchar(100) not null,
  payload          jsonb,
  project_id       uuid references projects(id),
  status           varchar(20) not null default 'pending'
                   check (status in ('pending','sent','failed','dead')),
  retry_count      smallint not null default 0,
  sent_at          timestamptz,
  error_message    text,
  created_at       timestamptz not null default now()
);

-- ── INDEXES ─────────────────────────────────────────────
create index if not exists idx_projects_client_id    on projects(client_id);
create index if not exists idx_projects_status       on projects(status);
create index if not exists idx_projects_created_at   on projects(created_at desc);
create index if not exists idx_project_files_project on project_files(project_id);
create index if not exists idx_deliverables_project  on deliverables(project_id);
create index if not exists idx_audit_log_user        on audit_log(user_id);
create index if not exists idx_audit_log_created     on audit_log(created_at desc);
create index if not exists idx_refresh_tokens_user   on refresh_tokens(user_id);
create index if not exists idx_refresh_tokens_hash   on refresh_tokens(token_hash);
create index if not exists idx_email_notifications_pending on email_notifications(created_at)
  where status = 'pending';
create index if not exists idx_project_files_unconfirmed on project_files(created_at)
  where is_confirmed = false;
create index if not exists idx_deliverables_unconfirmed  on deliverables(created_at)
  where is_confirmed = false;

-- ── ROW LEVEL SECURITY (lock everything to service role) ─
-- No policies are created => the anon and authenticated roles
-- cannot select/insert/update/delete. Our Express server uses the
-- service-role key, which bypasses RLS. Access control + ownership
-- checks are enforced in the API service layer.
alter table users                  enable row level security;
alter table refresh_tokens         enable row level security;
alter table password_reset_tokens  enable row level security;
alter table projects               enable row level security;
alter table project_files          enable row level security;
alter table deliverables           enable row level security;
alter table revision_requests      enable row level security;
alter table project_status_history enable row level security;
alter table audit_log              enable row level security;
alter table email_notifications    enable row level security;
