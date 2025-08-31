import { type NextRequest, NextResponse } from "next/server"
import { validateToken, extractTokenFromHeader } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 })
    }

    const isValid = validateToken(token)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    return NextResponse.json({
      valid: true,
      message: "Token is valid",
    })
  } catch (error) {
    console.error("Auth validation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
