-- Yantiq proposed reference schema v1.0.0-design (PostgreSQL).
-- NOT an Alembic migration. Review against target PostgreSQL version first.
-- Execute only in an explicitly disposable empty database during implementation.
-- UUIDs are supplied by application/seed code; no extension is required.
BEGIN;

CREATE TABLE guardians (
  id uuid PRIMARY KEY,
  firebase_uid text NOT NULL UNIQUE,
  display_name text,
  role text NOT NULL DEFAULT 'guardian' CHECK (role IN ('guardian','administrator')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE guardian_consents (
  id uuid PRIMARY KEY,
  guardian_id uuid NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  policy_version text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (guardian_id, policy_version)
);
CREATE TABLE avatars (
  id text PRIMARY KEY,
  label_ar text NOT NULL,
  label_en text NOT NULL,
  active boolean NOT NULL DEFAULT true
);
CREATE TABLE children (
  id uuid PRIMARY KEY,
  guardian_id uuid NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  nickname text NOT NULL CHECK (char_length(nickname) BETWEEN 1 AND 40),
  age_group text NOT NULL CHECK (age_group IN ('4_5','6_7')),
  avatar_id text NOT NULL REFERENCES avatars(id),
  lifecycle_version bigint NOT NULL DEFAULT 1 CHECK (lifecycle_version > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  purge_after timestamptz,
  CHECK ((deleted_at IS NULL AND purge_after IS NULL) OR
         (deleted_at IS NOT NULL AND purge_after = deleted_at + interval '7 days'))
);
CREATE INDEX children_guardian_idx ON children (guardian_id, created_at);
CREATE INDEX children_purge_idx ON children (purge_after) WHERE deleted_at IS NOT NULL;

CREATE TABLE catalog_state (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO catalog_state (singleton) VALUES (true);

CREATE TABLE media_assets (
  id uuid PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('image','reference_audio')),
  content_type text NOT NULL,
  byte_length bigint NOT NULL CHECK (byte_length > 0),
  sha256 char(64) NOT NULL CHECK (sha256 ~ '^[a-f0-9]{64}$'),
  payload bytea NOT NULL,
  created_by uuid NOT NULL REFERENCES guardians(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (octet_length(payload) = byte_length)
);
CREATE INDEX media_hash_idx ON media_assets (sha256);

CREATE TABLE levels (
  id uuid PRIMARY KEY,
  position smallint NOT NULL UNIQUE CHECK (position BETWEEN 1 AND 4),
  title_ar text NOT NULL,
  title_en text NOT NULL,
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)
);
CREATE TABLE stages (
  id uuid PRIMARY KEY,
  level_id uuid NOT NULL REFERENCES levels(id),
  position integer NOT NULL CHECK (position > 0),
  title_ar text NOT NULL,
  title_en text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0),
  UNIQUE (level_id, position) DEFERRABLE INITIALLY IMMEDIATE
);
CREATE TABLE lessons (
  id uuid PRIMARY KEY,
  stage_id uuid NOT NULL REFERENCES stages(id),
  position integer NOT NULL CHECK (position > 0),
  title_ar text NOT NULL,
  title_en text NOT NULL,
  instructions_ar text NOT NULL,
  instructions_en text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0),
  UNIQUE (stage_id, position) DEFERRABLE INITIALLY IMMEDIATE
);
CREATE TABLE exercises (
  id uuid PRIMARY KEY,
  lesson_id uuid NOT NULL REFERENCES lessons(id),
  position integer NOT NULL CHECK (position > 0),
  active boolean NOT NULL DEFAULT true,
  required boolean NOT NULL DEFAULT true,
  current_revision_id uuid NOT NULL,
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0),
  UNIQUE (lesson_id, position) DEFERRABLE INITIALLY IMMEDIATE
);
CREATE TABLE exercise_revisions (
  id uuid PRIMARY KEY,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  assessment_key uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('letter','word','sentence')),
  title_ar text NOT NULL,
  title_en text NOT NULL,
  instructions_ar text NOT NULL,
  instructions_en text NOT NULL,
  expected_text text NOT NULL CHECK (char_length(expected_text) BETWEEN 1 AND 2000),
  language text NOT NULL DEFAULT 'ar-MSA' CHECK (language = 'ar-MSA'),
  pass_score numeric(5,2) NOT NULL CHECK (pass_score BETWEEN 0 AND 100),
  image_media_id uuid REFERENCES media_assets(id),
  reference_audio_media_id uuid REFERENCES media_assets(id),
  created_by uuid NOT NULL REFERENCES guardians(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (exercise_id, id)
);
ALTER TABLE exercises ADD CONSTRAINT current_revision_matches_exercise
  FOREIGN KEY (id, current_revision_id) REFERENCES exercise_revisions(exercise_id, id)
  DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX revisions_exercise_idx ON exercise_revisions (exercise_id, created_at);

CREATE TABLE exercise_progress (
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id),
  completed_at timestamptz,
  stars smallint NOT NULL DEFAULT 0 CHECK (stars BETWEEN 0 AND 3),
  attempt_count bigint NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  last_attempt_at timestamptz,
  best_revision_id uuid,
  best_assessment_key uuid,
  best_evaluated_at timestamptz,
  best_evidence jsonb,
  best_score numeric GENERATED ALWAYS AS ((best_evidence ->> 'pronunciation_score')::numeric) STORED,
  best_scoring_version text GENERATED ALWAYS AS (best_evidence ->> 'scoring_version') STORED,
  PRIMARY KEY (child_id, exercise_id),
  FOREIGN KEY (exercise_id, best_revision_id) REFERENCES exercise_revisions (exercise_id, id),
  CHECK (best_score IS NULL OR best_score BETWEEN 0 AND 100),
  CHECK (best_evidence IS NULL OR jsonb_typeof(best_evidence) = 'object'),
  CHECK ((best_evidence IS NULL AND best_revision_id IS NULL AND best_assessment_key IS NULL AND best_evaluated_at IS NULL)
    OR (best_evidence IS NOT NULL AND best_revision_id IS NOT NULL AND best_assessment_key IS NOT NULL AND best_evaluated_at IS NOT NULL
        AND best_score IS NOT NULL AND best_scoring_version IS NOT NULL)),
  CHECK (stars = 0 OR completed_at IS NOT NULL)
);
CREATE INDEX progress_exercise_idx ON exercise_progress (exercise_id);

CREATE TABLE lesson_progress (
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id),
  completed_at timestamptz NOT NULL,
  PRIMARY KEY (child_id, lesson_id)
);
CREATE TABLE daily_activity (
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  activity_date date NOT NULL,
  evaluation_count bigint NOT NULL DEFAULT 0 CHECK (evaluation_count >= 0),
  new_completions bigint NOT NULL DEFAULT 0 CHECK (new_completions >= 0),
  PRIMARY KEY (child_id, activity_date)
);
CREATE TABLE phoneme_aggregates (
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id),
  assessment_key uuid NOT NULL,
  scoring_version text NOT NULL,
  phoneme text NOT NULL,
  opportunities bigint NOT NULL DEFAULT 0 CHECK (opportunities >= 0),
  errors bigint NOT NULL DEFAULT 0 CHECK (errors >= 0 AND errors <= opportunities),
  inserted_count bigint NOT NULL DEFAULT 0 CHECK (inserted_count >= 0),
  PRIMARY KEY (child_id, exercise_id, assessment_key, scoring_version, phoneme)
);
CREATE TABLE badge_definitions (
  id text PRIMARY KEY,
  title_ar text NOT NULL,
  title_en text NOT NULL,
  rule_key text NOT NULL CHECK (rule_key IN ('FIRST_COMPLETION','TEN_COMPLETIONS','LEVEL_COMPLETED')),
  rule_value integer NOT NULL CHECK (rule_value > 0),
  active boolean NOT NULL DEFAULT true,
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)
);
CREATE TABLE child_badges (
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  badge_id text NOT NULL REFERENCES badge_definitions(id),
  awarded_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (child_id, badge_id)
);

-- No audio and no winning/losing response body in this coordination table.
CREATE TABLE evaluation_receipts (
  id uuid PRIMARY KEY,
  guardian_id uuid NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id),
  exercise_revision_id uuid NOT NULL,
  child_lifecycle_version bigint NOT NULL,
  idempotency_key uuid NOT NULL,
  request_fingerprint text NOT NULL,
  state text NOT NULL CHECK (state IN ('processing','completed','failed')),
  error_code text,
  started_at timestamptz NOT NULL DEFAULT now(),
  processing_deadline timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  UNIQUE (guardian_id, idempotency_key),
  FOREIGN KEY (exercise_id, exercise_revision_id) REFERENCES exercise_revisions (exercise_id, id),
  CHECK (processing_deadline > started_at AND expires_at > processing_deadline)
);
CREATE UNIQUE INDEX one_processing_evaluation_per_child
  ON evaluation_receipts (child_id) WHERE state = 'processing';
CREATE INDEX receipts_expiry_idx ON evaluation_receipts (expires_at);

-- Control/audit metadata; never include audio, child names or result payloads.
CREATE TABLE admin_audit_events (
  id uuid PRIMARY KEY,
  actor_guardian_id uuid NOT NULL REFERENCES guardians(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text NOT NULL,
  old_version text,
  new_version text,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- Also export this minimal purge ledger to recovery storage independent of DB snapshots.
CREATE TABLE child_deletion_tombstones (
  child_id uuid PRIMARY KEY,
  purged_at timestamptz NOT NULL,
  retain_until timestamptz NOT NULL CHECK (retain_until > purged_at)
);

COMMIT;
