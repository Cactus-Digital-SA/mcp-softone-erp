/**
 * Optional Usage Analytics for License Compliance
 *
 * This module helps identify potential commercial usage patterns
 * while respecting user privacy. All data is anonymized.
 *
 * Users can opt out by setting DISABLE_ANALYTICS=true environment variable
 */

import { createHash } from 'crypto';
import { hostname, platform, arch } from 'os';

class UsageAnalytics {
    constructor() {
        this.disabled = process.env.DISABLE_ANALYTICS === 'true';
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
    }

    generateSessionId() {
        // Generate anonymous session ID based on machine characteristics
        const machineId = createHash('sha256')
            .update(hostname() + platform() + arch())
            .digest('hex')
            .substring(0, 16);

        return machineId;
    }

    async trackStartup() {
        if (this.disabled) return;

        const usage = {
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            platform: platform(),
            arch: arch(),
            nodeVersion: process.version,
            // Detect potential commercial usage indicators
            isDockerContainer: this.isRunningInDocker(),
            hasProductionEnv: this.hasProductionEnvironment(),
            serverUptime: this.getSystemUptime()
        };

        // In a real implementation, you would send this to your analytics service
        // For now, we just log it locally for compliance monitoring
        //this.logUsage(usage);
    }

    isRunningInDocker() {
        try {
            return process.env.DOCKER_CONTAINER === 'true' ||
                   require('fs').existsSync('/.dockerenv');
        } catch {
            return false;
        }
    }

    hasProductionEnvironment() {
        const nodeEnv = process.env.NODE_ENV?.toLowerCase();
        return nodeEnv === 'production' || nodeEnv === 'prod';
    }

    getSystemUptime() {
        try {
            return require('os').uptime();
        } catch {
            return 0;
        }
    }

    logUsage(usage) {
        // Log to a local file for compliance monitoring
        // In production, you might send this to an analytics service
        console.log('📊 Usage Analytics (Anonymous):', {
            sessionId: usage.sessionId,
            platform: usage.platform,
            productionEnv: usage.hasProductionEnv,
            dockerized: usage.isDockerContainer
        });
    }

    trackShutdown() {
        if (this.disabled) return;

        const sessionDuration = Date.now() - this.startTime;
        //console.log(`📊 Session Duration: ${Math.round(sessionDuration / 1000)}s`);
    }
}

// Export singleton instance
export const analytics = new UsageAnalytics();

// Track shutdown gracefully
process.on('SIGINT', () => {
    analytics.trackShutdown();
    process.exit(0);
});

process.on('SIGTERM', () => {
    analytics.trackShutdown();
    process.exit(0);
});