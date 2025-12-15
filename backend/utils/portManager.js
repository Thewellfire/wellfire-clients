import net from 'net';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Check if a port is available
 */
export const isPortAvailable = (port) => {
    return new Promise((resolve) => {
        const server = net.createServer();

        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(false);
            } else {
                resolve(false);
            }
        });

        server.once('listening', () => {
            server.close();
            resolve(true);
        });

        server.listen(port);
    });
};

/**
 * Find an available port starting from the preferred port
 */
export const findAvailablePort = async(preferredPort, maxAttempts = 10) => {
    let port = preferredPort;

    for (let i = 0; i < maxAttempts; i++) {
        const available = await isPortAvailable(port);
        if (available) {
            return port;
        }
        console.log(`⚠️  Port ${port} is in use, trying ${port + 1}...`);
        port++;
    }

    throw new Error(`Could not find an available port after ${maxAttempts} attempts`);
};

/**
 * Kill process on a specific port (macOS/Linux)
 */
export const killProcessOnPort = async(port) => {
    try {
        // For macOS/Linux
        const command = process.platform === 'win32' ?
            `netstat -ano | findstr :${port} | findstr LISTENING` :
            `lsof -ti:${port}`;

        const { stdout } = await execAsync(command);

        if (stdout.trim()) {
            const killCommand = process.platform === 'win32' ?
                `taskkill /PID ${stdout.trim().split(/\s+/).pop()} /F` :
                `kill -9 ${stdout.trim()}`;

            await execAsync(killCommand);
            console.log(`✅ Killed process on port ${port}`);
            return true;
        }
    } catch (error) {
        // No process found on port, which is fine
        return false;
    }
};

/**
 * Get port with automatic conflict resolution
 */
export const getPort = async(preferredPort, options = {}) => {
    const {
        autoKill = false,
            autoFind = true,
            maxAttempts = 10
    } = options;

    const available = await isPortAvailable(preferredPort);

    if (available) {
        return preferredPort;
    }

    console.log(`⚠️  Port ${preferredPort} is already in use`);

    // Try to kill the process if autoKill is enabled
    if (autoKill) {
        console.log(`🔄 Attempting to kill process on port ${preferredPort}...`);
        const killed = await killProcessOnPort(preferredPort);

        if (killed) {
            // Wait a bit for the port to be released
            await new Promise(resolve => setTimeout(resolve, 1000));

            const nowAvailable = await isPortAvailable(preferredPort);
            if (nowAvailable) {
                return preferredPort;
            }
        }
    }

    // Find an alternative port if autoFind is enabled
    if (autoFind) {
        console.log(`🔍 Looking for an available port...`);
        return await findAvailablePort(preferredPort + 1, maxAttempts);
    }

    throw new Error(`Port ${preferredPort} is in use and no alternatives were found`);
};