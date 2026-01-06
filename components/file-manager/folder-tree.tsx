"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Folder, FolderOpen, Trash2, ChevronRight, ChevronDown } from "lucide-react"
import type { FolderStructure } from "@/types/file-system"

interface FolderTreeProps {
  folders: FolderStructure[]
  selectedFolder?: string
  createTargetPath?: string | null
  createRequestId?: number
  onFolderSelect: (path: string) => void
  onFolderCreate: (parentPath: string, name: string) => void
  onFolderDelete: (path: string) => void
}

interface FolderNodeProps {
  folder: FolderStructure
  level: number
  selectedFolder?: string
  createTargetPath?: string | null
  createRequestId?: number
  onFolderSelect: (path: string) => void
  onFolderCreate: (parentPath: string, name: string) => void
  onFolderDelete: (path: string) => void
}

function FolderNode({
  folder,
  level,
  selectedFolder,
  createTargetPath,
  createRequestId,
  onFolderSelect,
  onFolderCreate,
  onFolderDelete,
}: FolderNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level === 0)
  const [isCreating, setIsCreating] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const createRowRef = useRef<HTMLDivElement | null>(null)

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onFolderCreate(folder.path, newFolderName.trim())
      setNewFolderName("")
      setIsCreating(false)
      setIsExpanded(true)
    }
  }

  const handleDeleteFolder = () => {
    if (confirm(`确定要删除文件夹 "${folder.name}" 吗？此操作不可撤销。`)) {
      onFolderDelete(folder.path)
    }
  }

  const isSelected = selectedFolder === folder.path
  const hasChildren = folder.children.length > 0

  useEffect(() => {
    if (!createRequestId) return
    if (createTargetPath === folder.path) {
      setIsCreating(true)
      setIsExpanded(true)
    }
  }, [createRequestId, createTargetPath, folder.path])

  useEffect(() => {
    if (isCreating) {
      createRowRef.current?.scrollIntoView({ block: "nearest" })
    }
  }, [isCreating])

  return (
    <div>
      <div
        className={`flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer group ${
          isSelected ? "bg-accent" : ""
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {hasChildren ? (
          <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
        ) : (
          <div className="w-4" />
        )}

        <div className="flex items-center gap-2 flex-1" onClick={() => onFolderSelect(folder.path)}>
          {isExpanded ? <FolderOpen className="h-4 w-4 text-primary" /> : <Folder className="h-4 w-4 text-primary" />}
          <span className="text-sm font-medium">{folder.name}</span>
        </div>

        {folder.path !== "/" && (
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 w-6 p-0 text-destructive ${
              isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
            onClick={handleDeleteFolder}
            aria-label="删除文件夹"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isCreating && (
        <div
          ref={createRowRef}
          className="flex items-center gap-2 p-2"
          style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}
        >
          <Folder className="h-4 w-4 text-muted-foreground" />
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="文件夹名称"
            className="h-6 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreateFolder()
              } else if (e.key === "Escape") {
                setIsCreating(false)
                setNewFolderName("")
              }
            }}
            onFocus={(e) => e.currentTarget.select()}
            autoFocus
          />
          <Button size="sm" onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
            创建
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsCreating(false)
              setNewFolderName("")
            }}
          >
            取消
          </Button>
        </div>
      )}

      {isExpanded && hasChildren && (
        <div>
          {folder.children.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              level={level + 1}
              selectedFolder={selectedFolder}
              createTargetPath={createTargetPath}
              createRequestId={createRequestId}
              onFolderSelect={onFolderSelect}
              onFolderCreate={onFolderCreate}
              onFolderDelete={onFolderDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function FolderTree({
  folders,
  selectedFolder,
  createTargetPath,
  createRequestId,
  onFolderSelect,
  onFolderCreate,
  onFolderDelete,
}: FolderTreeProps) {
  return (
    <div className="space-y-1">
      {folders.map((folder) => (
        <FolderNode
          key={folder.id}
          folder={folder}
          level={0}
          selectedFolder={selectedFolder}
          createTargetPath={createTargetPath}
          createRequestId={createRequestId}
          onFolderSelect={onFolderSelect}
          onFolderCreate={onFolderCreate}
          onFolderDelete={onFolderDelete}
        />
      ))}
    </div>
  )
}
