"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Music, LogOut, User, Wifi, WifiOff } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useUploadQueue } from "@/hooks/use-upload-queue"

export function Header() {
  const { logout, token } = useAuth()
  const { stats, error } = useUploadQueue()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Music className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">音乐上传服务</h1>
              <p className="text-sm text-muted-foreground">安全高效的音乐文件管理</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {stats.processing > 0 && (
                <Badge variant="default" className="gap-1">
                  <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
                  {stats.processing} 处理中
                </Badge>
              )}

              {stats.waiting > 0 && (
                <Badge variant="secondary" className="gap-1">
                  {stats.waiting} 等待中
                </Badge>
              )}

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {error ? (
                  <>
                    <WifiOff className="h-3 w-3 text-destructive" />
                    <span className="text-destructive">连接异常</span>
                  </>
                ) : (
                  <>
                    <Wifi className="h-3 w-3 text-green-500" />
                    <span>已连接</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>已认证</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 bg-transparent">
              <LogOut className="h-4 w-4" />
              退出登录
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
