import { env } from "@/lib/env"

export function validateToken(token: string): boolean {
  // 在实际应用中，这里应该验证JWT token或查询数据库
  // 现在使用简单的长度验证作为示例，同时接受默认测试token和环境变量配置的token
  const validToken = env.get('AUTH_TOKEN')
  return token === validToken
}

export function extractTokenFromHeader(authHeader: string | null): string {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No auth header found")
  }
  return authHeader.substring(7)
}
