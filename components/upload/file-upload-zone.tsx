"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, FileAudio, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useFFmpegTranscode } from "@/hooks/use-ffmpeg-transcode"

interface UploadFile {
  id: string
  file: File
  progress: number
  status: "pending" | "transcoding" | "uploading" | "success" | "error"
  error?: string
  transcodingProgress?: number
}

interface FileUploadZoneProps {
  onUploadComplete?: (files: UploadFile[]) => void
  selectedFolder?: string
}

export function FileUploadZone({ onUploadComplete, selectedFolder }: FileUploadZoneProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { getAuthHeaders } = useAuth()
  const { transcodeLosslessToAac, isLosslessFile } = useFFmpegTranscode()

  const validateFile = (file: File): string | null => {
    // 检查文件格式
    const isM4a = file.name.toLowerCase().endsWith(".m4a")
    const isLossless = isLosslessFile(file)
    
    if (!isM4a && !isLossless) {
      return "只支持 .m4a 和无损音频格式文件 (FLAC, WAV, AIFF, etc.)"
    }

    // 检查文件大小 (100MB)
    if (file.size > 100 * 1024 * 1024) {
      return "文件大小不能超过 100MB"
    }

    return null
  }

  const handleFiles = useCallback(
    (files: FileList) => {
      const newFiles: UploadFile[] = []
      const errors: string[] = []

      Array.from(files).forEach((file) => {
        const validationError = validateFile(file)
        if (validationError) {
          errors.push(`${file.name}: ${validationError}`)
        } else {
          const fileId = Math.random().toString(36).substr(2, 9)
          newFiles.push({
            id: fileId,
            file,
            progress: 0,
            status: "pending",
          })
        }
      })

      if (errors.length > 0) {
        setError(errors.join("; "))
      } else {
        setError("")
      }

      if (newFiles.length > 0) {
        setUploadFiles((prev) => [...prev, ...newFiles])
      }
    },
    [selectedFolder],
  )

  const uploadFile = async (uploadFile: UploadFile) => {
    let fileToUpload = uploadFile.file

    // Transcode lossless files to AAC
    if (isLosslessFile(uploadFile.file)) {
      try {
        setUploadFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "transcoding", transcodingProgress: 0 } : f)))

        const result = await transcodeLosslessToAac(uploadFile.file, {
          onProgress: (progress, _time) => {
            setUploadFiles((prev) => prev.map((f) => 
              f.id === uploadFile.id ? { ...f, transcodingProgress: progress } : f
            ))
          },
          onError: (error) => {
            setError(error)
          }
        })

        if (result.success && result.outputFile) {
          fileToUpload = result.outputFile
          setUploadFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, transcodingProgress: 100 } : f)))
        } else {
          setUploadFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? {
                    ...f,
                    status: "error",
                    error: result.error || "转码失败",
                  }
                : f,
            ),
          )
          return
        }
      } catch (error) {
        setUploadFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? {
                  ...f,
                  status: "error",
                  error: "转码失败",
                }
              : f,
          ),
        )
        return
      }
    }

    const formData = new FormData()
    formData.append("file", fileToUpload)
    if (selectedFolder) {
      formData.append("folder", selectedFolder)
    }

    try {
      setUploadFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "uploading" } : f)))

      const xhr = new XMLHttpRequest()

      return new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100)
            setUploadFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, progress } : f)))
          }
        })

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            setUploadFiles((prev) =>
              prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "success", progress: 100 } : f)),
            )
            resolve()
          } else {
            setUploadFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id
                  ? {
                      ...f,
                      status: "error",
                      error: "上传失败",
                    }
                  : f,
              ),
            )
            reject(new Error("Upload failed"))
          }
        })

        xhr.addEventListener("error", () => {
          setUploadFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? {
                    ...f,
                    status: "error",
                    error: "网络错误",
                  }
                : f,
            ),
          )
          reject(new Error("Network error"))
        })

        xhr.open("POST", "/api/files/upload")
        const headers = getAuthHeaders()
        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value)
        })
        xhr.send(formData)
      })
    } catch (err) {
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? {
                ...f,
                status: "error",
                error: "上传失败",
              }
            : f,
        ),
      )
    }
  }

  const startUpload = async () => {
    const pendingFiles = uploadFiles.filter((f) => f.status === "pending")

    for (const file of pendingFiles) {
      await uploadFile(file)
    }

    if (onUploadComplete) {
      onUploadComplete(uploadFiles)
    }
  }

  const removeFile = (id: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const clearCompleted = () => {
    setUploadFiles((prev) => prev.filter((f) => f.status === "pending" || f.status === "uploading"))
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFiles(files)
      }
    },
    [handleFiles],
  )

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      handleFiles(files)
    }
  }

  const getStatusIcon = (status: UploadFile["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      case "uploading":
        return <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      case "transcoding":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <FileAudio className="h-4 w-4 text-muted-foreground" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* 拖拽上传区域 */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-medium text-foreground mb-2">拖拽音频文件到此处上传</p>
        <p className="text-sm text-muted-foreground mb-4">支持 .m4a 和无损音频格式 (FLAC, WAV, AIFF等)，单个文件最大 100MB，无损文件将自动转码为 AAC(256k)</p>
        <Button onClick={handleFileSelect} className="gap-2">
          <Upload className="h-4 w-4" />
          选择文件
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".m4a,.flac,.wav,.aiff,.aif,.wv,.ape,.tta,.dsf,.dff"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
        />
      </div>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 文件列表 */}
      {uploadFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">上传文件 ({uploadFiles.length})</h3>
            <div className="flex gap-2">
              {uploadFiles.some((f) => f.status === "pending") && (
                <Button onClick={startUpload} size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />
                  开始上传
                </Button>
              )}
              {uploadFiles.some((f) => f.status === "success" || f.status === "error") && (
                <Button onClick={clearCompleted} variant="outline" size="sm">
                  清除已完成
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {uploadFiles.map((uploadFile) => (
              <div key={uploadFile.id} className="flex items-center gap-3 p-3 border rounded-lg">
                {getStatusIcon(uploadFile.status)}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {uploadFile.status === "transcoding" && isLosslessFile(uploadFile.file) 
                      ? `${uploadFile.file.name} (转码中...)` 
                      : uploadFile.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(uploadFile.file.size)}</p>

                  {uploadFile.status === "uploading" && <Progress value={uploadFile.progress} className="mt-2 h-1" />}
                  {uploadFile.status === "transcoding" && (
                    <div className="mt-2">
                      <Progress value={uploadFile.transcodingProgress || 0} className="h-1" />
                      <p className="text-xs text-blue-600 mt-1">转码进度: {uploadFile.transcodingProgress || 0}%</p>
                    </div>
                  )}

                  {uploadFile.error && <p className="text-xs text-destructive mt-1">{uploadFile.error}</p>}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(uploadFile.id)}
                  disabled={uploadFile.status === "uploading" || uploadFile.status === "transcoding"}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
