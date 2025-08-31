"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { LoginForm } from "@/components/auth/login-form"
import { Header } from "@/components/layout/header"
import { FileUploadZone } from "@/components/upload/file-upload-zone"
import { FileManager } from "@/components/file-manager/file-manager"
import { UploadQueueManager } from "@/components/queue/upload-queue-manager"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FolderOpen, Clock } from "lucide-react"

function Dashboard() {
  const [selectedFolder, setSelectedFolder] = useState("/")

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              文件上传
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              文件管理
            </TabsTrigger>
            <TabsTrigger value="queue" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              上传队列
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* 文件上传区域 */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    文件上传
                  </CardTitle>
                  <CardDescription>拖拽 .m4a 格式的音乐文件到此区域，或点击选择文件</CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUploadZone selectedFolder={selectedFolder} />
                </CardContent>
              </Card>

              {/* 上传设置 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">上传设置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">目标文件夹</label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedFolder === "/" ? "根目录" : selectedFolder}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">支持格式</label>
                    <p className="text-sm text-muted-foreground mt-1">.m4a</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">最大文件大小</label>
                    <p className="text-sm text-muted-foreground mt-1">100 MB</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            <FileManager selectedFolder={selectedFolder} onFolderSelect={setSelectedFolder} />
          </TabsContent>

          <TabsContent value="queue" className="space-y-6">
            <UploadQueueManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default function Page() {
  const { isAuthenticated, isLoading, login } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />
  }

  return <Dashboard />
}
