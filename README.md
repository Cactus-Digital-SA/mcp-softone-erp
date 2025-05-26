# MCP SoftOne ERP Server (@cactus-digital-sa/mcp-softone-erp)

A Model Context Protocol (MCP) server for integrating with SoftOne ERP API, providing comprehensive ERP data access and analysis capabilities.

## Features

- **Authentication**: Secure login and session management with SoftOne ERP
- **Character Encoding**: Automatic Windows-1253 to UTF-8 conversion for Greek text
- **Data Discovery**: Explore ERP objects, tables, and fields structure  
- **Data Retrieval**: Get records, browse data lists, and generate reports
- **Data Operations**: Insert, update, delete, and calculate ERP records
- **Business Intelligence**: Built-in prompts for customer, sales, inventory, and financial analysis
- **Resources**: Access to API documentation and database schema

## Installation MCP SoftOne

### Claude Desktop

To use this with Claude Desktop, add the following to your claude_desktop_config.json. The full path on MacOS: ~/Library/Application\ Support/Claude/claude_desktop_config.json, on Windows: %APPDATA%/Claude/claude_desktop_config.json.

```json
{
  "mcpServers": {
    "softone-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "@cactus-digital-sa/mcp-softone-erp"
      ]
    }
  }
}
```

### VS Code
Add this to your VS Code MCP config file. See VS Code MCP docs for more info.

```json
{
  "servers": {
    "softone-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@cactus-digital-sa/mcp-softone-erp"]
    }
  }
}
```

### Cursor

Install in Cursor
Go to: Settings -> Cursor Settings -> MCP -> Add new global MCP server

Pasting the following configuration into your Cursor ~/.cursor/mcp.json file is the recommended approach. You may also install in a specific project by creating .cursor/mcp.json in your project folder. See Cursor [MCP docs](https://docs.cursor.com/context/model-context-protocol) for more info.

```json
{
  "mcpServers": {
    "softone-mcp": {
      "command": "npx",
      "args": ["-y", "@cactus-digital-sa/mcp-softone-erp"]
    }
  }
}
```

## Usage

### Authentication
First, authenticate with your SoftOne ERP system using the login tool:

```javascript
{
  "registeredName": "your-company",
  "username": "your-username", 
  "password": "your-password",
  "appId": "your-app-id"
}
```

### Available Tools

#### Authentication
- `login` - Authenticate with SoftOne ERP system

#### Data Discovery  
- `getObjects` - Get all available ERP objects
- `getObjectTables` - Get tables for a specific object
- `getTableFields` - Get fields for a table

#### Data Retrieval
- `getData` - Get specific record data by primary key
- `getBrowserInfo` - Initialize browser query for data lists
- `getBrowserData` - Get browser query results with pagination

#### Data Operations
- `calculate` - Calculate field values and business logic
- `setData` - Insert or update records (not implemented in current version)
- `delData` - Delete records (not implemented in current version)

#### Convenience Tools
- `lookupCustomer` - Search customers by code, name, or tax ID
- `lookupSales` - Search sales documents by date range and optional customer

#### Debug Tools
- `debugEncoding` - Test character encoding conversion (Windows-1253 → UTF-8)

## Character Encoding

The server automatically converts responses from **Windows-1253** (Greek encoding) to **UTF-8**, similar to PHP's:
```php
iconv('Windows-1253', "UTF-8//TRANSLIT//IGNORE", $text)
```

This ensures proper display of Greek characters in customer names, addresses, product descriptions, and other text fields from SoftOne ERP.

### Testing Encoding
You can test the encoding conversion with:
```bash
# Basic encoding test
npm run test-encoding

# Real-world SoftOne ERP encoding test  
npm run test-encoding-real

# Or run directly
node encoding-test.js
node real-world-encoding-test.js
```

Or use the debug tool:
```javascript
await debugEncoding({ testString: "Test Greek text from SoftOne" });
```

### Available Resources

- `blackbook://api-documentation` - Complete SoftOne API documentation
- `s1schema://database-schema` - Database schema and structure

### Business Analysis Prompts

- `analyze-customers` - Comprehensive customer data analysis
- `analyze-sales` - Sales performance and trends analysis  
- `analyze-inventory` - Inventory optimization analysis
- `analyze-financials` - Financial performance analysis

## Configuration

The server connects to SoftOne ERP systems hosted at `https://{registeredName}.oncloud.gr`.

### Authentication Parameters
- **registeredName**: Your company's registered name in SoftOne Cloud
- **username**: Your SoftOne Web Accounts username
- **password**: Your SoftOne Web Accounts password  
- **appId**: Service ID defined in SoftOne Web Accounts


## Requirements

- Node.js 18+
- Valid SoftOne ERP credentials
- Network access to SoftOne cloud services

## Error Handling

The server provides comprehensive error handling for:
- Authentication failures
- API connectivity issues
- Data validation errors
- Permission restrictions

## API Reference

### SoftOne ERP Integration

This server integrates with the SoftOne ERP Web Services API, providing access to:

- Customer management and CRM data
- Sales document processing and reporting
- Inventory management and stock control
- Financial reporting and analysis
- Custom object manipulation and calculations

### Filter Syntax

When using browser queries, you can apply filters using SoftOne's filter syntax:
- `FIELD=value` - Exact match
- `FIELD=value*` - Starts with match  
- `FIELD1=value1&FIELD2=value2` - Multiple conditions (AND)
- `FIELD1=value1|FIELD2=value2` - Alternative conditions (OR)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Privacy & Analytics

This software includes optional, anonymous usage analytics to help identify potential commercial usage patterns for license compliance. 

**What is collected:**
- Anonymous session ID (machine fingerprint)
- Platform information (OS, architecture)
- Environment indicators (production/development)
- Session duration

**What is NOT collected:**
- Personal information
- Business data or ERP content  
- IP addresses or location data
- Specific usage patterns or data

**Opt-out:**
```bash
export DISABLE_ANALYTICS=true
# or
DISABLE_ANALYTICS=true npx @mcp-servers/softone-erp
```

All analytics help us understand usage patterns while maintaining your privacy and helping ensure license compliance.

## Licensing

This software is available under a **dual-license model**:

### 🆓 **Non-Commercial Use (Free)**
- ✅ Personal projects and learning
- ✅ Open source projects
- ✅ Academic research and education
- ✅ Non-profit organizations
- ✅ Evaluation and testing

### 💼 **Commercial Use (Paid License Required)**
- ❌ For-profit companies and organizations
- ❌ Production use in business environments
- ❌ Revenue-generating applications
- ❌ Organizations with more than 5 employees
- ❌ Commercial products and services

### License Compliance Checker

Not sure if you need a commercial license? Use our compliance checker:

```bash
# After installing the package
npx softone-erp-license-check

# Or if installed globally
softone-erp-license-check
```

This interactive tool will help you determine if your usage requires a commercial license.

## Support

For issues and questions:
- Create an issue on GitHub
- Check the API documentation resource
- Review the database schema resource
- Consult the SoftOne ERP documentation

## Changelog

### 1.0.6
- Initial release
- Authentication and session management
- Data discovery and retrieval tools
- Customer and sales lookup functions
- Business analysis prompts
- Resource access for documentation and schema
