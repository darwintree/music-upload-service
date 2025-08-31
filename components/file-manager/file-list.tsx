"use client"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileAudio, MoreHorizontal, Download, Trash2 } from "lucide-react"
import type { FileItem } from "@/types/file-system"
import { useAuth } from "@/hooks/use-auth"

interface FileListProps {
  files: FileItem[]
  onFileDelete: (fileId: string) => void
  onFileDownload: (fileId: string) => void
}

export function FileList({ files, onFileDelete, onFileDownload }: FileListProps) {
  const { getAuthHeaders } = useAuth()

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleDelete = (fileId: string, fileName: string) => {
    if (confirm(`确定要删除文件 "${fileName}" 吗？此操作不可撤销。`)) {
      onFileDelete(fileId)
    }
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <FileAudio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">此文件夹为空</p>
        <p className="text-sm text-muted-foreground mt-2">上传一些音乐文件开始使用</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>文件名</TableHead>
            <TableHead className="w-24">大小</TableHead>
            <TableHead className="w-40">修改时间</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id} className="hover:bg-muted/50">
              <TableCell>
                <FileAudio className="h-4 w-4 text-primary" />
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground">{file.path}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{formatFileSize(file.size)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{formatDate(file.modifiedAt)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onFileDownload(file.id)}>
                      <Download className="h-4 w-4 mr-2" />
                      下载
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(file.id, file.name)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
