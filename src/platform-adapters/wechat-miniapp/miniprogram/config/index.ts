import { envDev } from './env.dev'
import { envProd } from './env.prod'
import { getRuntimeEnv } from '../utils/env'

const runtimeEnv = getRuntimeEnv()

export const appConfig = runtimeEnv === 'release' ? envProd : envDev
