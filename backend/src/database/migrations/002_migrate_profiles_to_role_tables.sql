BEGIN;

CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  skills TEXT[] DEFAULT '{}',
  resume_url TEXT DEFAULT '',
  projects TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS company_profiles (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(150) NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS college_profiles (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  college_name VARCHAR(150) NOT NULL,
  location VARCHAR(150) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
  ) THEN
    INSERT INTO student_profiles (id, user_id, skills, resume_url, projects, created_at)
    SELECT
      p.id,
      p.user_id,
      COALESCE(p.skills, '{}'),
      '',
      '{}',
      p.created_at
    FROM profiles p
    INNER JOIN users u ON u.id = p.user_id
    WHERE u.role = 'student'
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO company_profiles (id, user_id, company_name, description, created_at)
    SELECT
      p.id,
      p.user_id,
      u.name,
      COALESCE(p.bio, ''),
      p.created_at
    FROM profiles p
    INNER JOIN users u ON u.id = p.user_id
    WHERE u.role = 'company'
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO college_profiles (id, user_id, college_name, location, created_at)
    SELECT
      p.id,
      p.user_id,
      u.name,
      '',
      p.created_at
    FROM profiles p
    INNER JOIN users u ON u.id = p.user_id
    WHERE u.role = 'college'
    ON CONFLICT (user_id) DO NOTHING;

    DROP TABLE profiles;
  END IF;
END $$;

COMMIT;
