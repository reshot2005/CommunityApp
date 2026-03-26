ALTER TABLE users
ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE users
ADD COLUMN auth_provider VARCHAR(20),
ADD COLUMN auth_provider_user_id VARCHAR(255);

CREATE UNIQUE INDEX users_auth_provider_identity_idx
ON users (auth_provider, auth_provider_user_id)
WHERE auth_provider IS NOT NULL AND auth_provider_user_id IS NOT NULL;
