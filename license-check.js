#!/usr/bin/env node

/**
 * License Compliance Checker for MCP SoftOne ERP Server
 *
 * This tool helps users determine if they need a commercial license
 * and provides guidance on compliance.
 */

import { createInterface } from 'readline';

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.toLowerCase().trim());
        });
    });
}

async function checkLicenseCompliance() {
    console.log("🔍 MCP SoftOne ERP Server - License Compliance Checker");
    console.log("=" .repeat(60));
    console.log();

    const questions = [
        {
            question: "Are you using this software for a for-profit company? (y/n): ",
            weight: 5,
            description: "For-profit usage"
        },
        {
            question: "Does your organization have more than 5 employees? (y/n): ",
            weight: 3,
            description: "Organization size"
        },
        {
            question: "Are you using this in a production environment? (y/n): ",
            weight: 4,
            description: "Production usage"
        },
        {
            question: "Will this software help generate revenue for your business? (y/n): ",
            weight: 5,
            description: "Revenue generation"
        },
        {
            question: "Are you integrating this into a commercial product/service? (y/n): ",
            weight: 4,
            description: "Commercial integration"
        }
    ];

    let commercialScore = 0;
    let maxScore = 0;
    const positiveAnswers = [];

    for (const q of questions) {
        const answer = await askQuestion(q.question);
        maxScore += q.weight;

        if (answer === 'y' || answer === 'yes') {
            commercialScore += q.weight;
            positiveAnswers.push(q.description);
        }
    }

    console.log();
    console.log("📊 RESULTS");
    console.log("=" .repeat(30));

    const percentage = (commercialScore / maxScore) * 100;

    if (commercialScore === 0) {
        console.log("✅ NON-COMMERCIAL USE DETECTED");
        console.log("You can use this software under the free non-commercial license.");
        console.log("Continue with your project! 🎉");
    } else if (percentage <= 40) {
        console.log("⚠️  POTENTIAL COMMERCIAL USE");
        console.log("Some aspects of your usage may require a commercial license.");
        console.log("We recommend contacting us for clarification.");
    } else {
        console.log("❌ COMMERCIAL LICENSE REQUIRED");
        console.log("Your usage clearly requires a commercial license.");
        console.log();
        console.log("Commercial factors detected:");
        positiveAnswers.forEach(factor => console.log(`  • ${factor}`));
    }

    if (commercialScore > 0) {
        console.log();
        console.log("💼 COMMERCIAL LICENSE INFORMATION");
        console.log("Email: dimitris@cactusweb.gr");
        console.log("Website: https://cactusweb.gr");
        console.log("Phone: +30 694 9281396");
        console.log();
        console.log("Benefits of commercial license:");
        console.log("  • Full commercial usage rights");
        console.log("  • Priority support and SLA");
        console.log("  • Enterprise features");
        console.log("  • Custom development services");
        console.log("  • Legal compliance and indemnification");
    }

    console.log();
    console.log("📄 For full license terms, see LICENSE file");
    console.log("📋 For commercial options, see COMMERCIAL-LICENSE.md");

    rl.close();
}

// Run the checker
checkLicenseCompliance().catch(console.error);