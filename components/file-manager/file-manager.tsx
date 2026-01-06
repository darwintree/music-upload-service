"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUploadZone } from "@/components/upload/file-upload-zone"
import { FolderTree } from "./folder-tree"
import { FileList } from "./file-list"
import { Folder, FolderPlus, RefreshCw, AlertCircle, Upload } from "lucide-react"
import type { FolderStructure, FileItem } from "@/types/file-system"
import { useAuth } from "@/hooks/use-auth"

interface FileManagerProps {
  onFolderSelect?: (path: string) => void
  selectedFolder?: string
}

export function FileManager({ onFolderSelect, selectedFolder = "/" }: FileManagerProps) {
  const [folders, setFolders] = useState<FolderStructure[]>([])
  const [files, setFiles] = useState<FileItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createRequestId, setCreateRequestId] = useState(0)
  const [createTargetPath, setCreateTargetPath] = useState<string | null>(null)
  const { getAuthHeaders, isAuthenticated, isLoading: authLoading } = useAuth()

  const loadFolders = async () => {
    if (!isAuthenticated) {
      console.log("[v0] Skipping folder load - user not authenticated")
      return
    }

    try {
      setError(null)
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
      setError("加载文件夹失败")
      console.error("Failed to load folders:", err)

      const mockFolders: FolderStructure[] = [
        {
          id: "root",
          name: "我的音乐",
          path: "/",
          children: [
            {
              id: "albums",
              name: "专辑",
              path: "/albums",
              children: [
                {
                  id: "album1",
                  name: "流行音乐",
                  path: "/albums/pop",
                  children: [],
                  files: [],
                },
                {
                  id: "album2",
                  name: "古典音乐",
                  path: "/albums/classical",
                  children: [],
                  files: [],
                },
              ],
              files: [],
            },
            {
              id: "singles",
              name: "单曲",
              path: "/singles",
              children: [],
              files: [],
            },
          ],
          files: [],
        },
      ]
      setFolders(mockFolders)
    }
  }

  const loadFiles = async (folderPath: string) => {
    if (!isAuthenticated) {
      console.log("[v0] Skipping file load - user not authenticated")
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      setError(null)
      const response = await fetch(`/api/files/list?path=${encodeURIComponent(folderPath)}`, {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        setFiles(data.files)
      } else {
        throw new Error("Failed to load files")
      }
    } catch (err) {
      setError("加载文件失败")
      console.error("Failed to load files:", err)

      const mockFiles: FileItem[] = [
        {
          id: "file1",
          name: "示例音乐1.m4a",
          type: "file",
          size: 5242880,
          createdAt: "2024-01-15T10:30:00Z",
          modifiedAt: "2024-01-15T10:30:00Z",
          path: "/",
        },
        {
          id: "file2",
          name: "示例音乐2.m4a",
          type: "file",
          size: 7340032,
          createdAt: "2024-01-16T14:20:00Z",
          modifiedAt: "2024-01-16T14:20:00Z",
          path: "/",
        },
      ]

      const filteredFiles = mockFiles.filter((file) => file.path === folderPath)
      setFiles(filteredFiles)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadFolders()
      loadFiles(selectedFolder)
    } else if (!authLoading && !isAuthenticated) {
      setIsLoading(false)
    }
  }, [selectedFolder, isAuthenticated, authLoading])

  const handleFolderSelect = (path: string) => {
    if (isAuthenticated) {
      loadFiles(path)
    }
    onFolderSelect?.(path)
  }

  const handleFolderCreate = async (parentPath: string, name: string) => {
    if (!isAuthenticated) return

    const normalizedParent = parentPath === "/" ? "" : parentPath
    const newFolderPath = `${normalizedParent}/${name}`

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
        // 重新加载文件夹结构
        await loadFolders()
        handleFolderSelect(newFolderPath)
      } else {
        throw new Error("Failed to create folder")
      }
    } catch (err) {
      setError("创建文件夹失败")
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
        // 重新加载文件夹结构
        await loadFolders()
      } else {
        throw new Error("Failed to delete folder")
      }
    } catch (err) {
      setError("删除文件夹失败")
      console.error("Failed to delete folder:", err)
    }
  }

  const handleFileDelete = async (fileId: string) => {
    if (!isAuthenticated) return

    try {
      // 在实际应用中，这里会调用删除文件的API
      console.log(`Deleting file ${fileId}`)
      // 重新加载文件列表
      await loadFiles(selectedFolder)
    } catch (error) {
      setError("删除文件失败")
      console.error("Failed to delete file:", error)
    }
  }

  const handleFileDownload = async (fileId: string) => {
    if (!isAuthenticated) return

    try {
      // 在实际应用中，这里会调用下载文件的API
      console.log(`Downloading file ${fileId}`)
    } catch (error) {
      setError("下载文件失败")
      console.error("Failed to download file:", error)
    }
  }

  const handleRefresh = () => {
    if (isAuthenticated) {
      loadFolders()
      loadFiles(selectedFolder)
    }
  }

  const handleCreateFolderRequest = () => {
    setCreateTargetPath(selectedFolder)
    setCreateRequestId((id) => id + 1)
  }

  if (authLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">初始化中...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">请先登录以查看文件</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-4">
        {/* 文件夹树 */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Folder className="h-4 w-4" />
                文件夹
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={handleCreateFolderRequest} aria-label="新建文件夹">
                  <FolderPlus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleRefresh} aria-label="刷新">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <FolderTree
              folders={folders}
              selectedFolder={selectedFolder}
              createTargetPath={createTargetPath}
              createRequestId={createRequestId}
              onFolderSelect={handleFolderSelect}
              onFolderCreate={handleFolderCreate}
              onFolderDelete={handleFolderDelete}
            />
          </CardContent>
        </Card>

        {/* 文件列表 / 上传切换 */}
        <div className="md:col-span-3 space-y-4">
          <Tabs defaultValue="upload" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">文件列表</TabsTrigger>
              <TabsTrigger value="upload">文件上传</TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">文件列表 {selectedFolder !== "/" && `- ${selectedFolder}`}</CardTitle>
                    <div className="text-sm text-muted-foreground">{files.length} 个文件</div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {isLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">加载中...</p>
                    </div>
                  ) : (
                    <FileList files={files} onFileDelete={handleFileDelete} onFileDownload={handleFileDownload} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upload" forceMount>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">文件上传</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground mb-4">拖拽音乐文件到此区域，或点击选择文件</p>
                  {!selectedFolder ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>请先在左侧选择目标文件夹，然后才能上传文件。</AlertDescription>
                    </Alert>
                  ) : (
                    <FileUploadZone selectedFolder={selectedFolder} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
