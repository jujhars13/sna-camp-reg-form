-- Dev only: plain Postgres lacks Supabase's built-in roles, which
-- initdb/010-my-tables.sql grants to.
CREATE ROLE anon NOLOGIN;
