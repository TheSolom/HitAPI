export interface FrameworkDto {
    id: number;
    name: string;
}

export interface CreateFrameworkPayload {
    name: string;
}

export interface UpdateFrameworkPayload {
    name?: string;
}

export interface AppResponseDto {
    id: string;
    name: string;
    slug: string;
    clientId: string;
    targetResponseTimeMs: number;
    active: boolean;
    framework: FrameworkDto;
    createdAt: Date | string;
}

export interface CreateAppPayload {
    name: string;
    frameworkId: number;
    teamId: string;
    targetResponseTimeMs?: number;
}

export interface UpdateAppPayload {
    name?: string;
    frameworkId?: number;
    targetResponseTimeMs?: number;
}

export interface AppMetricsDto {
    requestCount: number;
    errorRate: number;
    apdexScore: number;
    consumerCount: number;
}
