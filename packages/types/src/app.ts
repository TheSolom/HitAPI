export interface FrameworkDto {
    id: number;
    name: string;
}

export interface AppEnvironmentDto {
    id: string;
    name: string;
    slug: string;
    lastSeenAt?: string | null;
    sdkVersion?: string | null;
}

export interface AppResponseDto {
    id: string;
    name: string;
    slug: string;
    clientId: string;
    targetResponseTimeMs: number;
    active: boolean;
    framework: FrameworkDto;
    environments?: AppEnvironmentDto[];
    createdAt: Date | string;
}

export interface CreateAppPayload {
    name: string;
    teamId?: string;
}

export interface UpdateAppPayload {
    name?: string;
    targetResponseTimeMs?: number;
    active?: boolean;
}
