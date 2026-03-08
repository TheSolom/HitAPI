export const EXCLUDE_PATH_PATTERNS = [
    /\/_?healthz?$/i,
    /\/_?health[_-]?checks?$/i,
    /\/_?heart[_-]?beats?$/i,
    /\/ping$/i,
    /\/ready$/i,
    /\/live$/i,
    /\/favicon(?:-[\w-]+)?\.(ico|png|svg)$/,
    /\/apple-touch-icon(?:-[\w-]+)?\.png$/,
    /\/robots\.txt$/,
    /\/sitemap\.xml$/,
    /\/manifest\.json$/,
    /\/site\.webmanifest$/,
    /\/service-worker\.js$/,
    /\/sw\.js$/,
    /\/\.well-known\//,
] as const;
export const EXCLUDE_USER_AGENT_PATTERNS = [
    /health[-_ ]?check/i,
    /microsoft-azure-application-lb/i,
    /googlehc/i,
    /kube-probe/i,
] as const;
