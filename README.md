# MCP SoftOne ERP Server (@cactus-digital-sa/mcp-softone-erp)

A Model Context Protocol (MCP) server for integrating with SoftOne ERP API, providing comprehensive ERP data access and analysis capabilities.

## Features

- **Authentication**: Secure login and session management with SoftOne ERP
- **Data Discovery**: Explore ERP objects, tables, and fields structure  
- **Data Retrieval**: Get records, browse data lists, and generate reports
- **Data Operations**: Insert, update, delete, and calculate ERP records
- **Business Intelligence**: Built-in prompts for customer, sales, inventory, and financial analysis
- **Resources**: Access to API documentation and database schema

## Installation

### Using npx (Recommended)
```bash
npx @cactus-digital-sa/mcp-softone-erp
```

### Global Installation
```bash
npm install -g @cactus-digital-sa/mcp-softone-erp
```

## Usage

### Starting the Server
```bash
npx @cactus-digital-sa/mcp-softone-erp
```

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

## Examples

### Customer Lookup
```javascript
// Search for customers containing "ACME" in code, name, or tax ID
await lookupCustomer({ searchTerm: "ACME" });
```

### Sales Analysis
```javascript
// Get sales documents for date range
await lookupSales({ 
  dateFrom: "2024-01-01", 
  dateTo: "2024-01-31",
  customer: "CUST001" // optional
});
```

### Data Discovery
```javascript
// Discover available objects
await getObjects();

// Get tables for customer object
await getObjectTables({ object: "CUSTOMER" });

// Get fields for customer main table
await getTableFields({ object: "CUSTOMER", table: "CUSTOMER" });
```

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

### 1.0.0
- Initial release
- Authentication and session management
- Data discovery and retrieval tools
- Customer and sales lookup functions
- Business analysis prompts
- Resource access for documentation and schema
