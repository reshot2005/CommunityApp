DROP INDEX IF EXISTS users_auth_provider_identity_idx;

ALTER TABLE users
DROP COLUMN IF EXISTS auth_provider,
DROP COLUMN IF EXISTS auth_provider_user_id;

ALTER TABLE users
ALTER COLUMN password_hash SET NOT NULL;
