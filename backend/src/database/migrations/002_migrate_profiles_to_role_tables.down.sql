BEGIN;

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  skills TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO profiles (id, user_id, bio, skills, created_at)
SELECT
  sp.id,
  sp.user_id,
  NULL,
  COALESCE(sp.skills, '{}'),
  sp.created_at
FROM student_profiles sp
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO profiles (id, user_id, bio, skills, created_at)
SELECT
  cp.id,
  cp.user_id,
  COALESCE(cp.description, ''),
  NULL,
  cp.created_at
FROM company_profiles cp
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO profiles (id, user_id, bio, skills, created_at)
SELECT
  cp.id,
  cp.user_id,
  NULL,
  NULL,
  cp.created_at
FROM college_profiles cp
ON CONFLICT (user_id) DO NOTHING;

DROP TABLE IF EXISTS college_profiles;
DROP TABLE IF EXISTS company_profiles;
DROP TABLE IF EXISTS student_profiles;

COMMIT;
