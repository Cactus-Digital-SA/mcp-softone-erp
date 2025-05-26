#!/usr/bin/env node

/**
 * Character Encoding Test for SoftOne ERP MCP Server
 * 
 * This script demonstrates the Windows-1253 to UTF-8 conversion
 * similar to PHP's iconv('Windows-1253', "UTF-8//TRANSLIT//IGNORE", $text)
 */

import iconv from 'iconv-lite';

// Test Greek text samples that might come from SoftOne ERP
const testSamples = [
    "Πελάτης", // Customer
    "Τιμολόγιο", // Invoice  
    "Προϊόν", // Product
    "Παραγγελία", // Order
    "Αποθήκη", // Warehouse
    "Αθήνα", // Athens
    "Θεσσαλονίκη", // Thessaloniki
    "€ 1.250,50", // Euro amount
    "ΑΦΜ: 123456789", // Tax ID
];

function convertFromWindows1253(text) {
    if (typeof text !== 'string') return text;
    
    try {
        // The text comes from SoftOne as Windows-1253 encoded bytes
        // We need to interpret it as Windows-1253 and convert to UTF-8
        
        // Method 1: Direct conversion from Windows-1253 to UTF-8
        return iconv.decode(Buffer.from(text, 'latin1'), 'win1253');
    } catch (error) {
        console.warn('Character encoding conversion failed:', error.message);
        return text;
    }
}

function isValidUtf8(str) {
    try {
        return str === Buffer.from(str, 'utf8').toString('utf8');
    } catch {
        return false;
    }
}

function simulateWindows1253Response(text) {
    // Simulate what comes from SoftOne ERP API
    // Convert UTF-8 text to Windows-1253 bytes, then represent as latin1 string
    try {
        const win1253Buffer = iconv.encode(text, 'win1253');
        return win1253Buffer.toString('latin1'); // This simulates what we receive
    } catch (error) {
        return text;
    }
}

console.log("🔤 SoftOne ERP Character Encoding Test (FIXED)");
console.log("==============================================");
console.log("Testing Windows-1253 → UTF-8 conversion");
console.log();

testSamples.forEach((originalText, index) => {
    console.log(`Test ${index + 1}: ${originalText}`);
    
    // Simulate receiving Windows-1253 encoded data (as SoftOne would send)
    const simulatedResponse = simulateWindows1253Response(originalText);
    
    // Convert back to UTF-8 (like our MCP server should do)
    const convertedText = convertFromWindows1253(simulatedResponse);
    
    console.log(`  Original (UTF-8):     "${originalText}"`);
    console.log(`  Simulated (Win-1253): "${simulatedResponse}"`);
    console.log(`  Converted back:       "${convertedText}"`);
    console.log(`  Conversion success:   ${originalText === convertedText ? '✅' : '❌'}`);
    
    if (originalText !== convertedText) {
        console.log(`  Expected bytes: [${Array.from(Buffer.from(originalText, 'utf8')).join(', ')}]`);
        console.log(`  Got bytes:      [${Array.from(Buffer.from(convertedText, 'utf8')).join(', ')}]`);
    }
    console.log();
});

// Test with actual Windows-1253 byte sequences
console.log("🧪 Testing with actual Windows-1253 byte sequences:");
const realWindows1253Examples = [
    // These are actual Windows-1253 byte sequences for Greek text
    { name: "Πελάτης", bytes: [208, 229, 235, 220, 244, 231, 242] },
    { name: "Αθήνα", bytes: [193, 232, 222, 237, 225] },
    { name: "€ 100", bytes: [128, 32, 49, 48, 48] }, // Euro symbol in Windows-1253
];

realWindows1253Examples.forEach((example, index) => {
    const win1253Buffer = Buffer.from(example.bytes);
    const latin1String = win1253Buffer.toString('latin1');
    const convertedText = convertFromWindows1253(latin1String);
    
    console.log(`Real Test ${index + 1}: ${example.name}`);
    console.log(`  Windows-1253 bytes:   [${example.bytes.join(', ')}]`);
    console.log(`  As latin1 string:     "${latin1String}"`);
    console.log(`  Converted to UTF-8:   "${convertedText}"`);
    console.log(`  Expected:             "${example.name}"`);
    console.log(`  Success:              ${example.name === convertedText ? '✅' : '❌'}`);
    console.log();
});

console.log("🔄 Testing complex object conversion:");
const testObject = {
    πελάτης: "Δημήτρης Αγγελούδης",
    διεύθυνση: "Αθήνα, Ελλάδα",
    τηλέφωνο: "+30 210 1234567",
    email: "test@example.gr",
    προϊόντα: [
        { όνομα: "Προϊόν Α", τιμή: "€ 100,00" },
        { όνομα: "Προϊόν Β", τιμή: "€ 250,50" }
    ]
};

console.log("Original object:");
console.log(JSON.stringify(testObject, null, 2));

// Simulate encoding the entire object
function convertObjectEncoding(obj) {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
        const simulated = simulateWindows1253Response(obj);
        return convertFromWindows1253(simulated);
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => convertObjectEncoding(item));
    }
    
    if (typeof obj === 'object') {
        const converted = {};
        for (const [key, value] of Object.entries(obj)) {
            const simulatedKey = simulateWindows1253Response(key);
            const convertedKey = convertFromWindows1253(simulatedKey);
            converted[convertedKey] = convertObjectEncoding(value);
        }
        return converted;
    }
    
    return obj;
}

const convertedObject = convertObjectEncoding(testObject);
console.log("\nConverted object:");
console.log(JSON.stringify(convertedObject, null, 2));

const conversionSuccess = JSON.stringify(testObject) === JSON.stringify(convertedObject);
console.log(`\nObject conversion success: ${conversionSuccess ? '✅' : '❌'}`);

if (conversionSuccess) {
    console.log("\n✨ Encoding conversion is working correctly!");
    console.log("Your MCP server will automatically convert SoftOne ERP responses from Windows-1253 to UTF-8.");
} else {
    console.log("\n⚠️  Encoding conversion needs adjustment.");
    console.log("The conversion logic may need fine-tuning for your specific SoftOne ERP setup.");
}
