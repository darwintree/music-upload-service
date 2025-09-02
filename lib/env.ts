export interface EnvironmentConfig {
  UPLOAD_DIR: string
  AUTH_TOKEN: string
  NODE_ENV: 'development' | 'production' | 'test'
}

class EnvironmentManager {
  private config: EnvironmentConfig | null = null

  constructor() {
    // 不在构造函数中立即加载，延迟到首次使用时加载
  }

  private loadEnvironment(): EnvironmentConfig {
    const uploadDir = process.env.UPLOAD_DIR
    if (!uploadDir) {
      throw new Error('UPLOAD_DIR environment variable is required')
    }

    const authToken = process.env.AUTH_TOKEN
    if (!authToken) {
      throw new Error('AUTH_TOKEN environment variable is required')
    }

    const nodeEnv = process.env.NODE_ENV || 'development'
    if (!['development', 'production', 'test'].includes(nodeEnv)) {
      throw new Error('NODE_ENV must be one of: development, production, test')
    }

    return {
      UPLOAD_DIR: uploadDir,
      AUTH_TOKEN: authToken,
      NODE_ENV: nodeEnv as 'development' | 'production' | 'test'
    }
  }

  public get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    if (!this.config) {
      this.config = this.loadEnvironment()
    }
    return this.config[key]
  }

  public getAll(): EnvironmentConfig {
    if (!this.config) {
      this.config = this.loadEnvironment()
    }
    return { ...this.config }
  }

  public validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    try {
      this.loadEnvironment()
    } catch (error) {
      if (error instanceof Error) {
        errors.push(error.message)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

export const env = new EnvironmentManager()
export { EnvironmentManager }