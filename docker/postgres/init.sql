-- Hermes OS — Postgres initialization
-- Creates the separate database used by Evolution API alongside the main hermes_os DB.

CREATE DATABASE evolution;

-- Required extensions for the main DB
\c hermes_os;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
