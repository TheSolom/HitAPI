interface PackageJson {
    version?: string;
    default?: {
        version?: string;
    };
}

export async function getPackageVersion(name: string): Promise<string | null> {
    try {
        const packageJson = (await import(`${name}/package.json`, {
            with: { type: 'json' },
        })) as PackageJson;

        const version = packageJson.default?.version || packageJson.version;

        return typeof version === 'string' ? version : null;
    } catch {
        return null;
    }
}
