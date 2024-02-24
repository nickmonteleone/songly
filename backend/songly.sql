\echo 'Delete and recreate songly db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE songly;
CREATE DATABASE songly;
\connect songly

\i songly-schema.sql
\i songly-seed.sql

\echo 'Delete and recreate songly_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE songly_test;
CREATE DATABASE songly_test;
\connect songly_test

\i songly-schema.sql