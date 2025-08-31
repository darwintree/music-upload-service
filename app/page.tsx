"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { LoginForm } from "@/components/auth/login-form"
import { Header } from "@/components/layout/header"
import { FileUploadZone } from "@/components/upload/file-upload-zone"
import { FileManager } from "@/components/file-manager/file-manager"
import { UploadQueueManager } from "@/components/queue/upload-queue-manager"
import { FolderTree } from "@/components/file-manager/folder-tree"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FolderOpen, Clock, AlertCircle } from "lucide-react"

function Dashboard() {
  const [selectedFolder, setSelectedFolder] = useState<string>("")
  const [folders, setFolders] = useState([])
  const [isLoadingFolders, setIsLoadingFolders] = useState(false)
  const { getAuthHeaders, isAuthenticated } = useAuth()

  const loadFolders = async () => {
    if (!isAuthenticated) {
      console.log("[v0] Skipping folder load - user not authenticated")
      return
    }

    setIsLoadingFolders(true)
    try {
      const response = await fetch("/api/files/folders", {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        setFolders(data.folders)
      } else {
        throw new Error("Failed to load folders")
      }
    } catch (err) {
      console.error("Failed to load folders:", err)
    } finally {
      setIsLoadingFolders(false)
    }
  }

  const handleFolderCreate = async (parentPath: string, name: string) => {
    if (!isAuthenticated) return

    try {
      const response = await fetch("/api/files/create-folder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ parentPath, name }),
      })

      if (response.ok) {
        await loadFolders()
      } else {
        throw new Error("Failed to create folder")
      }
    } catch (err) {
      console.error("Failed to create folder:", err)
    }
  }

  const handleFolderDelete = async (path: string) => {
    if (!isAuthenticated) return

    try {
      const response = await fetch("/api/files/delete-folder", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ path }),
      })

      if (response.ok) {
        await loadFolders()
      } else {
        throw new Error("Failed to delete folder")
      }
    } catch (err) {
      console.error("Failed to delete folder:", err)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadFolders()
    }
  }, [isAuthenticated])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              文件上传
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              文件管理
            </TabsTrigger>
            {/* <TabsTrigger value="queue" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              上传队列
            </TabsTrigger> */}
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
                  {!selectedFolder ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>请先在右侧选择目标文件夹，然后才能上传文件。</AlertDescription>
                    </Alert>
                  ) : (
                    <FileUploadZone selectedFolder={selectedFolder} />
                  )}
                </CardContent>
              </Card>

              {/* 选择目标文件夹 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">选择目标文件夹</CardTitle>
                  <CardDescription>选择文件上传的目标位置</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedFolder && (
                    <div>
                      <label className="text-sm font-medium">当前选择</label>
                      <p className="text-sm text-primary font-medium mt-1">
                        {selectedFolder === "/" ? "根目录" : selectedFolder}
                      </p>
                    </div>
                  )}

                  {/* 文件夹树组件 */}
                  <div className="border rounded-md p-2 max-h-64 overflow-y-auto">
                    {isLoadingFolders ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-xs text-muted-foreground">加载文件夹...</p>
                      </div>
                    ) : (
                      <FolderTree
                        folders={folders}
                        selectedFolder={selectedFolder}
                        onFolderSelect={setSelectedFolder}
                        onFolderCreate={handleFolderCreate}
                        onFolderDelete={handleFolderDelete}
                      />
                    )}
                  </div>

                  <div className="pt-2 border-t">
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium">支持格式:</span> .m4a
                      </div>
                      <div>
                        <span className="font-medium">最大文件大小:</span> 100 MB
                      </div>
                    </div>
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
