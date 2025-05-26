import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";
import fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// Get the current directory
const __dirname = dirname(fileURLToPath(import.meta.url));
const resourcesDir = join(__dirname, '..', 'mcp-softone/resources');

// Read the blackbook content and SQL schema
const blackbookContent = fs.readFileSync(join(resourcesDir, "blackbook.md"), "utf8");
const sqlSchema = fs.readFileSync(join(resourcesDir, "S1Schema.sql"), "utf8");

// Create MCP server
const server = new McpServer({
    name: "SoftOne ERP API Server",
    version: "1.0.0"
});

// ERP API state
let erpApiBaseUrl = "";
let clientID = "";
let appId = "";

// Utility function for ERP API calls
async function callSoftOneApi(method, params = {}) {
    if (!clientID && method !== "login") {
        throw new Error("Not authenticated. Please login first.");
    }

    try {
        const response = await axios.post(`${erpApiBaseUrl}/s1services`, {
            service: method,
            clientID: method !== "login" ? clientID : undefined,
            appId,
            ...params
        });

        if (!response.data.success && response.data.error) {
            throw new Error(`SoftOne API Error: ${response.data.error}`);
        }

        return response.data;
    } catch (error) {
        throw new Error(`SoftOne API Error: ${error.message}`);
    }
}

// RESOURCES

// Expose blackbook as a resource
server.resource(
    "blackbook",
    "blackbook://api-documentation",
    async (uri) => ({
        contents: [{
            uri: uri.href,
            text: blackbookContent
        }]
    })
);

server.resource(
    "s1revival-schema",
    "s1revival://database-schema",
    async (uri) => ({
        contents: [{
            uri: uri.href,
            text: sqlSchema,
            mimeType: "application/sql"
        }]
    })
);

// AUTHENTICATION TOOLS

// Login tool
server.tool("login",
    {
        registeredName: z.string().describe("The registered name for the SoftOne account"),
        username: z.string().describe("Username defined in SoftOne Web Accounts"),
        password: z.string().describe("Password defined in SoftOne Web Accounts"),
        appId: z.string().describe("ID of the Service defined in SoftOne Web Accounts")
    },
    async ({ registeredName, username, password, appId: serviceAppId }) => {
        try {
            // Set base URL and appId
            erpApiBaseUrl = `https://${registeredName}.oncloud.gr`;
            appId = serviceAppId;

            // Login to SoftOne API
            const loginResponse = await axios.post(`${erpApiBaseUrl}/s1services`, {
                service: "login",
                username,
                password,
                appId: serviceAppId
            });

            if (!loginResponse.data.success) {
                return {
                    content: [{ type: "text", text: `Login failed: ${loginResponse.data.error}` }],
                    isError: true
                };
            }

            // Store temporary clientID
            const tempClientID = loginResponse.data.clientID;
            const companyInfo = loginResponse.data.objs[0];

            // Authenticate using the temporary clientID
            const authResponse = await axios.post(`${erpApiBaseUrl}/s1services`, {
                service: "authenticate",
                clientID: tempClientID,
                company: companyInfo.COMPANY,
                branch: companyInfo.BRANCH,
                module: companyInfo.MODULE,
                refid: companyInfo.REFID
            });

            if (!authResponse.data.success) {
                return {
                    content: [{ type: "text", text: `Authentication failed: ${authResponse.data.error}` }],
                    isError: true
                };
            }

            // Store the authenticated clientID for future API calls
            clientID = authResponse.data.clientID;

            return {
                content: [{
                    type: "text",
                    text: `Successfully logged in to ${registeredName}.oncloud.gr\nConnected to company "${companyInfo.COMPANYNAME}", branch "${companyInfo.BRANCHNAME}"\nSession established`
                }]
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: `Error connecting to SoftOne API: ${error.message}` }],
                isError: true
            };
        }
    }
);

// DATA DISCOVERY TOOLS

// Get available objects
server.tool("getObjects",
    {},
    async () => {
        try {
            const response = await callSoftOneApi("getObjects");
            return {
                content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: error.message }],
                isError: true
            };
        }
    }
);

// Get tables for an object
server.tool("getObjectTables",
    {
        object: z.string().describe("SoftOne EditMaster Object Name")
    },
    async ({ object }) => {
        try {
            const response = await callSoftOneApi("getObjectTables", { object });
            return {
                content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: error.message }],
                isError: true
            };
        }
    }
);

// Get fields for a table
server.tool("getTableFields",
    {
        object: z.string().describe("SoftOne EditMaster Object Name"),
        table: z.string().describe("Table name")
    },
    async ({ object, table }) => {
        try {
            const response = await callSoftOneApi("getTableFields", { object, table });
            return {
                content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: error.message }],
                isError: true
            };
        }
    }
);

// DATA RETRIEVAL TOOLS

// Get data for a record
server.tool("getData",
    {
        object: z.string().describe("SoftOne Object Name"),
        form: z.string().optional().describe("Form Name"),
        key: z.number().describe("Primary key of the record"),
        locateinfo: z.string().optional().describe("Tables and fields to return")
    },
    async ({ object, form = "", key, locateinfo }) => {
        try {
            const response = await callSoftOneApi("getData", {
                object,
                form,
                key,
                locateinfo
            });
            return {
                content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: error.message }],
                isError: true
            };
        }
    }
);

// Get browser info (for querying data lists)
server.tool("getBrowserInfo",
    {
        object: z.string().describe("SoftOne EditMaster Object Name"),
        list: z.string().describe("List Name"),
        filters: z.string().optional().describe("Filter criteria")
    },
    async ({ object, list, filters = "" }) => {
        try {
            const response = await callSoftOneApi("getBrowserInfo", {
                object,
                list,
                filters
            });
            return {
                content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: error.message }],
                isError: true
            };
        }
    }
);

// Get browser data
server.tool("getBrowserData",
    {
        reqID: z.string().describe("Reference ID from getBrowserInfo"),
        start: z.number().describe("Start record (zero-based)"),
        limit: z.number().describe("Number of records to return")
    },
    async ({ reqID, start, limit }) => {
        try {
            const response = await callSoftOneApi("getBrowserData", {
                reqID,
                start,
                limit
            });
            return {
                content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: error.message }],
                isError: true
            };
        }
    }
);

// Get report info
server.tool("getReportInfo",
    {
        object: z.string().describe("SoftOne Report Object Name"),
        list: z.string().describe("Report Name"),
        filters: z.string().optional().describe("Filter criteria")
    },
    async ({ object, list, filters = "" }) => {
        try {
            const response = await callSoftOneApi("getReportInfo", {
                object,
                list,
                filters
            });
            return {
                content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: error.message }],
                isError: true
            };
        }
    }
);

// Get report data
server.tool("getReportData",
    {
        reqID: z.string().describe("Reference ID from getReportInfo"),
        pagenum: z.number().describe("Page number")
    },
    async ({ reqID, pagenum }) => {
        try {
            const response = await callSoftOneApi("getReportData", {
                reqID,
                pagenum
            });
            return {
                content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: error.message }],
                isError: true
            };
        }
    }
);

// DATA MODIFICATION TOOLS

// Set data (insert or update)
server.tool("setData",
    {
        object: z.string().describe("SoftOne Object Name"),
        objectparams: z.record(z.any()).optional().describe("Object parameters"),
        key: z.union([z.string(), z.number()]).optional().describe("Primary key (leave empty for new record)"),
        data: z.record(z.array(z.record(z.any()))).describe("Data structure with tables and fields")
    },
    async ({ object, objectparams, key, data }) => {
        try {
            const response = await callSoftOneApi("setData", {
                object,
                objectparams,
                key,
                data
            });
            return {
                content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: error.message }],
                isError: true
            };
        }
    }
);

// Calculate fields
server.tool("calculate",
    {
        object: z.string().describe("SoftOne Object Name"),
        key: z.union([z.string(), z.number()]).optional().describe("Primary key"),
        locateinfo: z.string().describe("Tables and fields to return"),
        data: z.record(z.array(z.record(z.any()))).describe("Data structure with fields for calculation")
    },
    async ({ object, key, locateinfo, data }) => {
        try {
            const response = await callSoftOneApi("calculate", {
                object,
                key,
                locateinfo,
                data
            });
            return {
                content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: error.message }],
                isError: true
            };
        }
    }
);

// Delete data
server.tool("delData",
    {
        object: z.string().describe("SoftOne Object Name"),
        form: z.string().optional().describe("Form Name"),
        key: z.number().describe("Primary key of the record to delete")
    },
    async ({ object, form = "", key }) => {
        try {
            const response = await callSoftOneApi("delData", {
                object,
                form,
                key
            });
            return {
                content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: error.message }],
                isError: true
            };
        }
    }
);

// CONVENIENCE TOOLS

// Customer lookup
server.tool("lookupCustomer",
    {
        searchTerm: z.string().describe("Customer code, name, or tax ID")
    },
    async ({ searchTerm }) => {
        try {
            // First get browser info with filter
            const browserInfo = await callSoftOneApi("getBrowserInfo", {
                object: "CUSTOMER",
                list: "",
                filters: `CUSTOMER.CODE=${searchTerm}*|CUSTOMER.NAME=${searchTerm}*|CUSTOMER.AFM=${searchTerm}*`
            });

            if (!browserInfo.success) {
                throw new Error(`Failed to get customer browser: ${browserInfo.error || "Unknown error"}`);
            }

            if(!browserInfo.reqID){
                throw new Error(`Failed to get customer browser: ${browserInfo.error || "Req Id"}`);
            }

            // Get the customer data
            const browserData = await callSoftOneApi("getBrowserData", {
                reqID: browserInfo.reqID,
                start: 0,
                limit: 10
            });

            if (!browserData.success) {
                throw new Error(`Failed to get customer data: ${browserData.error || "Unknown error"}`);
            }

            return {
                content: [{
                    type: "text",
                    text: `Found ${browserData.totalcount} customers matching "${searchTerm}":\n\n${JSON.stringify(browserData.rows, null, 2)}`
                }]
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: error.message }],
                isError: true
            };
        }
    }
);

// Sales lookup
server.tool("lookupSales",
    {
        dateFrom: z.string().describe("Start date in YYYY-MM-DD format"),
        dateTo: z.string().describe("End date in YYYY-MM-DD format"),
        customer: z.string().optional().describe("Optional customer code or ID")
    },
    async ({ dateFrom, dateTo, customer = "" }) => {
        try {
            // Build filter string
            let filters = `SALDOC.TRNDATE=${dateFrom}&SALDOC.TRNDATE_TO=${dateTo}`;
            if (customer) {
                filters += `&SALDOC.TRDR=${customer}`;
            }

            // Get browser info with filter
            const browserInfo = await callSoftOneApi("getBrowserInfo", {
                object: "SALDOC",
                list: "",
                filters
            });

            if (!browserInfo.success) {
                throw new Error(`Failed to get sales browser: ${browserInfo.error || "Unknown error"}`);
            }

            // Get the sales data
            const browserData = await callSoftOneApi("getBrowserData", {
                reqID: browserInfo.reqID,
                start: 0,
                limit: 50
            });

            if (!browserData.success) {
                throw new Error(`Failed to get sales data: ${browserData.error || "Unknown error"}`);
            }

            return {
                content: [{
                    type: "text",
                    text: `Sales for period ${dateFrom} to ${dateTo}:\n\nTotal documents: ${browserData.totalcount}\n\n${JSON.stringify(browserData.rows, null, 2)}`
                }]
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: error.message }],
                isError: true
            };
        }
    }
);

// BUSINESS ANALYSIS PROMPTS

// Customer Analysis prompt
server.prompt(
    "analyze-customers",
    {},
    () => ({
        messages: [{
            role: "user",
            content: {
                type: "text",
                text: `Please perform a comprehensive analysis of our customer data:

1. First, use the getObjects tool to verify that the CUSTOMER object is available
2. Then use getObjectTables to understand the structure of the CUSTOMER object
3. Use getBrowserInfo and getBrowserData to retrieve customer records
4. Analyze the following aspects:
   - Customer distribution by region
   - Top customers by revenue
   - Customer segmentation by industry or type
   - Acquisition trends
   - Credit limits and payment terms distribution

Provide insights and recommendations based on your findings.`
            }
        }]
    })
);

// Sales Analysis prompt
server.prompt(
    "analyze-sales",
    {
        startDate: z.string().describe("Start date in YYYY-MM-DD format"),
        endDate: z.string().describe("End date in YYYY-MM-DD format"),
        filters: z.string().optional().describe("Additional filters")
    },
    ({ startDate, endDate, filters = "" }) => ({
        messages: [{
            role: "user",
            content: {
                type: "text",
                text: `Please analyze our sales data from ${startDate} to ${endDate} with the following filters: ${filters}

1. Use the getBrowserInfo tool with the SALDOC object to get sales document information
2. Apply date range filters (SALDOC.TRNDATE=${startDate}&SALDOC.TRNDATE_TO=${endDate})
3. Use getBrowserData to retrieve the actual sales records
4. Analyze the following aspects:
   - Overall sales trends during the period
   - Top-selling products/services
   - Sales by customer segment
   - Sales by document type (invoices, credit notes, etc.)
   - Profitability analysis
   - Identify any unusual patterns or anomalies

Provide insights and actionable recommendations based on your findings.`
            }
        }]
    })
);

// Inventory Analysis prompt
server.prompt(
    "analyze-inventory",
    {},
    () => ({
        messages: [{
            role: "user",
            content: {
                type: "text",
                text: `Please perform a comprehensive analysis of our inventory data:

1. Use the getObjects tool to verify that the ITEM object is available
2. Then use getObjectTables to understand the structure of the ITEM object
3. Use getBrowserInfo and getBrowserData to retrieve inventory items
4. Analyze the following aspects:
   - Inventory levels and distribution
   - Slow-moving or obsolete items
   - Stock turnover rates
   - Items with high value/low turnover
   - Stockout frequency and impact
   - Reorder point and safety stock adequacy

Provide insights on inventory optimization strategies and recommendations for improvement.`
            }
        }]
    })
);

// Financial Analysis prompt
server.prompt(
    "analyze-financials",
    {
        year: z.string().describe("Financial year"),
        period: z.string().optional().describe("Period (quarter, month, etc.)")
    },
    ({ year, period = "" }) => ({
        messages: [{
            role: "user",
            content: {
                type: "text",
                text: `Please analyze the financial data for ${year} ${period ? `(${period})` : ''}:

1. Use the appropriate reports to retrieve financial data
   - Use getReportInfo to access financial reports
   - Consider balance sheet, income statement, cash flow statement
2. Analyze the following aspects:
   - Key financial ratios (liquidity, solvency, profitability)
   - Revenue trends and composition
   - Cost structure and margin analysis
   - Working capital management
   - Cash flow analysis
   - Comparison to previous periods
   - Variance analysis (actual vs. budget if available)

Provide a comprehensive financial analysis with key insights and recommendations.`
            }
        }]
    })
);

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);