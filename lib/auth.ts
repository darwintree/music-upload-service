// 认证工具函数
export const DEFAULT_TEST_TOKEN = "music-upload-test-token-2024"

export function validateToken(token: string): boolean {
  // 在实际应用中，这里应该验证JWT token或查询数据库
  // 现在使用简单的长度验证作为示例，同时接受默认测试token
  return !!token && (token.length >= 10 || token === DEFAULT_TEST_TOKEN)
}

export function extractTokenFromHeader(authHeader: string | null): string {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No auth header found")
  }
  return authHeader.substring(7)
}
