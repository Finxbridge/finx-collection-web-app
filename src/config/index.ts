/**
 * Application configuration
 * Centralized location for all environment variables and app settings
 */

export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'FinxCollection',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  },
  storage: {
    tokenKey: 'app_access_token',
    refreshTokenKey: 'app_refresh_token',
    sessionIdKey: 'app_session_id',
    userKey: 'app_user',
  },
} as const

export default config
