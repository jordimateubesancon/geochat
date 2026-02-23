-- 001_enable_postgis.sql
-- Enable the PostGIS extension for geographic data types and spatial queries.

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;
