#!/bin/bash

# Exit on error
set -e

# Check if PostgreSQL is running
if ! pg_isready -U postgres; then
    echo "PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi

# Create the database if it doesn't exist
psql -U postgres -c "CREATE DATABASE as_rft;" || true

# Apply schema
psql -U postgres -d as_rft -f schema.sql

# Grant privileges
psql -U postgres -d as_rft -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;"
psql -U postgres -d as_rft -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;"
psql -U postgres -d as_rft -c "GRANT ALL PRIVILEGES ON DATABASE as_rft TO postgres;"

echo "Database setup completed successfully!" 