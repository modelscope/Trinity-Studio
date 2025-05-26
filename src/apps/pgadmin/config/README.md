# PostgreSQL Database Setup Guide

This guide provides instructions for setting up PostgreSQL and initializing the Trinity-RFT database in local dev mode.

## 1. Install PostgreSQL

### On macOS (using Homebrew)
```bash
brew install postgresql@14
brew services start postgresql@14
```

### On Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### On CentOS/RHEL
```bash
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo systemctl start postgresql
```

## 2. Configure PostgreSQL User

### Create and Configure postgres User
1. First, check if the postgres user exists:
```bash
psql -c "\du"
```

2. If the postgres user exists but lacks privileges, grant necessary permissions:
```bash
psql -d postgres -c "ALTER USER postgres WITH SUPERUSER CREATEDB CREATEROLE;"
```

3. Verify the postgres user has the correct privileges:
```bash
psql -d postgres -c "\du"
```
You should see attributes like "Superuser, Create role, Create DB" for the postgres user.

## 3. Initialize the Database

1. Make the setup script executable:
```bash
chmod +x setup_db.sh
```

2. Run the setup script as the postgres user:
```bash
sudo -u postgres ./setup_db.sh
```

The script will:
- Create the `as_rft` database
- Apply the schema
- Set up necessary permissions

## Troubleshooting

### Common Issues

1. **Permission Denied**
   - Ensure the postgres user has superuser privileges
   - Verify PostgreSQL is running: `pg_isready -U postgres`

2. **Database Already Exists**
   - The setup script includes error handling for existing databases
   - You can drop the existing database if needed: `psql -U postgres -c "DROP DATABASE as_rft;"`

3. **Connection Issues**
   - Check if PostgreSQL is running: `pg_isready`
   - Verify the postgres user can connect: `psql -U postgres`

### Additional Resources
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostgreSQL Installation Guide](https://www.postgresql.org/download/) 