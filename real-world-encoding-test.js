#!/usr/bin/env node

/**
 * Real-world Character Encoding Test for SoftOne ERP
 * 
 * This demonstrates how Windows-1253 encoded data from SoftOne ERP
 * gets converted to proper UTF-8 for display.
 */

import iconv from 'iconv-lite';

// This is how SoftOne ERP might return Greek text
// These are actual Windows-1253 byte sequences for common Greek business terms
const realSoftOneResponses = [
    {
        description: "Customer (Πελάτης)",
        windows1253Bytes: [208, 229, 235, 220, 244, 231, 242],
        expectedUtf8: "Πελάτης"
    },
    {
        description: "Invoice (Τιμολόγιο)", 
        windows1253Bytes: [212, 233, 236, 239, 235, 252, 227, 233, 239],
        expectedUtf8: "Τιμολόγιο"
    },
    {
        description: "Athens (Αθήνα)",
        windows1253Bytes: [193, 232, 222, 237, 225],
        expectedUtf8: "Αθήνα"
    },
    {
        description: "Thessaloniki (Θεσσαλονίκη)",
        windows1253Bytes: [200, 229, 243, 243, 225, 235, 239, 237, 223, 234, 231],
        expectedUtf8: "Θεσσαλονίκη"
    },
    {
        description: "Euro amount (€ 1.250,50)",
        windows1253Bytes: [128, 32, 49, 46, 50, 53, 48, 44, 53, 48],
        expectedUtf8: "€ 1.250,50"
    }
];

console.log("🏢 Real-world SoftOne ERP Encoding Test");
console.log("=====================================");
console.log("Testing actual Windows-1253 byte sequences from SoftOne ERP");
console.log();

function convertFromWindows1253(text) {
    if (typeof text !== 'string') return text;
    
    try {
        // Convert from Windows-1253 to UTF-8 (equivalent to PHP iconv)
        return iconv.decode(Buffer.from(text, 'latin1'), 'win1253');
    } catch (error) {
        console.warn('Conversion failed:', error.message);
        return text;
    }
}

realSoftOneResponses.forEach((test, index) => {
    console.log(`Test ${index + 1}: ${test.description}`);
    
    // Create Windows-1253 encoded string as SoftOne would send it
    const win1253Buffer = Buffer.from(test.windows1253Bytes);
    const receivedString = win1253Buffer.toString('latin1'); // How we receive it in Node.js
    
    // Convert to UTF-8 using our function
    const convertedUtf8 = convertFromWindows1253(receivedString);
    
    console.log(`  Win-1253 bytes:      [${test.windows1253Bytes.join(', ')}]`);
    console.log(`  Received as latin1:  "${receivedString}"`);  
    console.log(`  Converted to UTF-8:  "${convertedUtf8}"`);
    console.log(`  Expected UTF-8:      "${test.expectedUtf8}"`);
    console.log(`  Success:             ${convertedUtf8 === test.expectedUtf8 ? '✅' : '❌'}`);
    
    if (convertedUtf8 !== test.expectedUtf8) {
        console.log(`  Converted bytes:     [${Array.from(Buffer.from(convertedUtf8, 'utf8')).join(', ')}]`);
        console.log(`  Expected bytes:      [${Array.from(Buffer.from(test.expectedUtf8, 'utf8')).join(', ')}]`);
    }
    console.log();
});

// Test with a complete SoftOne API response simulation
console.log("📋 Testing complete SoftOne API response:");

const simulatedSoftOneResponse = {
    success: true,
    objs: [
        {
            // These would be Windows-1253 encoded in the real response
            COMPANYNAME: convertToWindows1253("ΑΒΓΔ Εταιρεία Α.Ε."),
            CUSTOMERNAME: convertToWindows1253("Δημήτρης Αγγελούδης"),
            ADDRESS: convertToWindows1253("Αθήνα, Ελλάδα"),
            PHONE: "+30 210 1234567",
            EMAIL: "test@example.gr"
        }
    ]
};

function convertToWindows1253(text) {
    // Simulate encoding UTF-8 to Windows-1253 (as SoftOne would do)
    try {
        const win1253Buffer = iconv.encode(text, 'win1253');
        return win1253Buffer.toString('latin1');
    } catch (error) {
        return text;
    }
}

function convertResponseEncoding(obj) {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
        return convertFromWindows1253(obj);
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => convertResponseEncoding(item));
    }
    
    if (typeof obj === 'object') {
        const converted = {};
        for (const [key, value] of Object.entries(obj)) {
            const convertedKey = convertFromWindows1253(key);
            converted[convertedKey] = convertResponseEncoding(value);
        }
        return converted;
    }
    
    return obj;
}

console.log("Simulated SoftOne Response (Windows-1253 encoded):");
console.log(JSON.stringify(simulatedSoftOneResponse, null, 2));

const convertedResponse = convertResponseEncoding(simulatedSoftOneResponse);

console.log("\nConverted Response (UTF-8):");
console.log(JSON.stringify(convertedResponse, null, 2));

// Verify the conversion worked
const originalCompanyName = "ΑΒΓΔ Εταιρεία Α.Ε.";
const convertedCompanyName = convertedResponse.objs[0].COMPANYNAME;
const conversionSuccess = originalCompanyName === convertedCompanyName;

console.log(`\n🎯 End-to-end conversion test: ${conversionSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);

if (conversionSuccess) {
    console.log("\n✨ Perfect! Your MCP server will correctly convert SoftOne ERP responses!");
    console.log("Greek characters will display properly in all tools and responses.");
} else {
    console.log("\n⚠️  The conversion needs fine-tuning for your specific setup.");
    console.log("Expected:", originalCompanyName);
    console.log("Got:     ", convertedCompanyName);
}

console.log("\n📝 Note: This test simulates the exact byte-level encoding that");
console.log("SoftOne ERP uses when sending Greek text data over HTTP.");
