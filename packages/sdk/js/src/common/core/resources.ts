import { cpuUsage, memoryUsage } from 'node:process';
import { performance } from 'node:perf_hooks';

let lastCpuUsage: NodeJS.CpuUsage | null = null;
let lastCpuTime: number | null = null;

export function getCpuUsage(): number | null {
    const currentCpuUsage: NodeJS.CpuUsage = cpuUsage();
    const currentTime: number = performance.now();

    let cpuPercent: number | null = null;

    if (lastCpuUsage && lastCpuTime) {
        // Calculate elapsed time in microseconds
        const elapsedTime = (currentTime - lastCpuTime) * 1000;

        // Calculate CPU time used (user + system) in microseconds
        const cpuTime =
            currentCpuUsage.user -
            lastCpuUsage.user +
            (currentCpuUsage.system - lastCpuUsage.system);

        // Calculate percentage
        cpuPercent = (cpuTime / elapsedTime) * 100;
    }

    // Update last values for next call
    lastCpuUsage = currentCpuUsage;
    lastCpuTime = currentTime;

    return cpuPercent;
}

export function getMemoryUsage(): number {
    return memoryUsage().rss;
}
