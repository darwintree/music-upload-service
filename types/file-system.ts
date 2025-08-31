export interface FileItem {
  id: string
  name: string
  type: "file" | "folder"
  size?: number
  createdAt: string
  modifiedAt: string
  path: string
}

export interface FolderStructure {
  id: string
  name: string
  path: string
  children: FolderStructure[]
  files: FileItem[]
}
