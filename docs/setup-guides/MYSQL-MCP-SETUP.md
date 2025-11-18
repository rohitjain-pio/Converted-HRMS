# MySQL MCP Server Setup and Usage

## Overview
This workspace now includes the MySQL Model Context Protocol (MCP) server which allows AI assistants to interact with MySQL databases safely and efficiently.

## Installed Server
- **@berthojoris/mcp-mysql-server** (v1.4.5) - Feature-rich MySQL MCP server with:
  - Dynamic per-project permissions
  - Data export capabilities  
  - DDL/DML support
  - Operation logging
  - Connection pooling

## Configuration
The MySQL MCP server is configured in `.vscode/mcp-settings.json` with these settings:

```json
{
  "mysql": {
    "command": "npx",
    "args": ["-y", "@berthojoris/mcp-mysql-server"],
    "env": {
      "MYSQL_HOST": "localhost",
      "MYSQL_PORT": "3306", 
      "MYSQL_USER": "root",
      "MYSQL_PASSWORD": "",
      "MYSQL_DATABASE": "hrms"
    }
  }
}
```

## Database Configuration
Update the environment variables in `mcp-settings.json` to match your MySQL setup:

- **MYSQL_HOST**: Your MySQL server host (default: localhost)
- **MYSQL_PORT**: MySQL port (default: 3306)
- **MYSQL_USER**: Database username (default: root)
- **MYSQL_PASSWORD**: Database password (empty by default)
- **MYSQL_DATABASE**: Target database name (set to: hrms)

## Features Available Through MCP

### Database Operations
- **Schema Introspection**: Explore database structure, tables, columns
- **Query Execution**: Run SELECT, INSERT, UPDATE, DELETE statements
- **DDL Operations**: Create/alter/drop tables and indexes
- **Transaction Support**: Manage database transactions
- **Data Export**: Export query results to various formats

### Security Features  
- **Permission Control**: Configurable permissions for DDL/DML operations
- **Row Limits**: Configurable maximum rows returned
- **Operation Logging**: Track all database operations
- **Connection Limits**: Prevent connection exhaustion

## Usage Examples

Once configured, you can ask AI assistants to:

1. **Explore Database Structure**
   - "Show me all tables in the HRMS database"
   - "Describe the employees table structure"
   - "What are the relationships between tables?"

2. **Query Data**
   - "Show me the first 10 employees"
   - "Find all employees in the IT department"
   - "Get attendance records for last month"

3. **Modify Data**
   - "Add a new employee record"
   - "Update employee department"
   - "Create a new table for tracking projects"

## Troubleshooting

### Connection Issues
- Ensure MySQL server is running on localhost:3306
- Verify credentials in the environment variables
- Check that the 'hrms' database exists
- Ensure firewall allows connections

### Permission Issues  
- Verify the MySQL user has appropriate permissions
- Check the permissions configuration in `mysql-mcp-config.json`
- Ensure the user can connect from localhost

### Performance Issues
- Adjust connection limits in configuration
- Monitor query execution times
- Use appropriate indexes for large tables

## Configuration Files
- **mcp-settings.json**: Main MCP server configuration
- **mysql-mcp-config.json**: Detailed MySQL server settings
- **MYSQL-MCP-SETUP.md**: This documentation file

## Support
For issues with the MySQL MCP server:
- GitHub: https://github.com/berthojoris/mcp-mysql-server
- NPM: https://www.npmjs.com/package/@berthojoris/mcp-mysql-server

## Security Notes
- Never commit database passwords to version control
- Use environment variables or secure credential management
- Limit database permissions to only what's needed
- Enable operation logging for audit trails
- Consider using SSL connections for production