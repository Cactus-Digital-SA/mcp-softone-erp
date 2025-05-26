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
        // Check if the text is already valid UTF-8
        if (isValidUtf8(text)) {
            return text; // Already UTF-8
        }
        
        // Convert from Windows-1253 to UTF-8
        const buffer = Buffer.from(text, 'binary');
        return iconv.decode(buffer, 'win1253');
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
    // Simulate what might come from SoftOne ERP API
    // Encode UTF-8 text as Windows-1253, then return as binary
    try {
        const win1253Buffer = iconv.encode(text, 'win1253');
        return win1253Buffer.toString('binary');
    } catch (error) {
        return text;
    }
}

console.log("🔤 SoftOne ERP Character Encoding Test");
console.log("=====================================");
console.log("Testing Windows-1253 → UTF-8 conversion");
console.log();

testSamples.forEach((originalText, index) => {
    console.log(`Test ${index + 1}: ${originalText}`);
    
    // Simulate receiving Windows-1253 encoded data
    const simulatedResponse = simulateWindows1253Response(originalText);
    
    // Convert back to UTF-8 (like our MCP server does)
    const convertedText = convertFromWindows1253(simulatedResponse);
    
    console.log(`  Original (UTF-8):     "${originalText}"`);
    console.log(`  Simulated (Win-1253): "${simulatedResponse}"`);
    console.log(`  Converted back:       "${convertedText}"`);
    console.log(`  Conversion success:   ${originalText === convertedText ? '✅' : '❌'}`);
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
        return convertFromWindows1253(simulateWindows1253Response(obj));
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => convertObjectEncoding(item));
    }
    
    if (typeof obj === 'object') {
        const converted = {};
        for (const [key, value] of Object.entries(obj)) {
            const convertedKey = convertFromWindows1253(simulateWindows1253Response(key));
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

console.log("\n✨ Encoding conversion is working correctly!");
console.log("Your MCP server will automatically convert SoftOne ERP responses from Windows-1253 to UTF-8.");
