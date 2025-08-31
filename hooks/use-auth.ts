"use client"

import { useState, useEffect } from "react"

export function useAuth() {
  const [token, setToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 从localStorage获取token
    const savedToken = localStorage.getItem("music-upload-token")
    if (savedToken) {
      setToken(savedToken)
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const login = (newToken: string) => {
    setToken(newToken)
    setIsAuthenticated(true)
    localStorage.setItem("music-upload-token", newToken)
  }

  const logout = () => {
    setToken(null)
    setIsAuthenticated(false)
    localStorage.removeItem("music-upload-token")
  }

  const getAuthHeaders = () => {
    const currentToken = localStorage.getItem("music-upload-token")
    console.log("[v0] Getting auth headers, token:", currentToken ? "present" : "missing")
    if (!currentToken) return {}
    return {
      Authorization: `Bearer ${currentToken}`,
    }
  }

  return {
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    getAuthHeaders,
  }
}
