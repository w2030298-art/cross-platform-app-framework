import { getRuntimeEnv } from './env'

const isProd = getRuntimeEnv() === 'release'

export const logger = {
  info(...args: unknown[]) {
    if (!isProd) {
      console.log('[INFO]', ...args)
    }
  },
  error(...args: unknown[]) {
    console.error('[ERROR]', ...args)
  }
}
