import { promises as fs } from "fs"
import path from "path"
import type { FileItem, FolderStructure } from "@/types/file-system"

// 工作目录配置
const WORK_DIR = process.env.UPLOAD_DIR || "./uploads"

export async function ensureWorkDir() {
  try {
    console.log("[v0] Checking work directory:", WORK_DIR)
    await fs.access(WORK_DIR)
    console.log("[v0] Work directory exists")
  } catch {
    console.log("[v0] Creating work directory:", WORK_DIR)
    await fs.mkdir(WORK_DIR, { recursive: true })
    console.log("[v0] Work directory created")
  }
}

export async function listFiles(folderPath: string): Promise<FileItem[]> {
  console.log("[v0] Listing files in folder:", folderPath)
  await ensureWorkDir()
  const fullPath = path.join(WORK_DIR, folderPath)
  console.log("[v0] Full path:", fullPath)

  try {
    const entries = await fs.readdir(fullPath, { withFileTypes: true })
    console.log("[v0] Directory entries found:", entries.length)
    const files: FileItem[] = []

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith(".m4a")) {
        const filePath = path.join(fullPath, entry.name)
        const stats = await fs.stat(filePath)

        files.push({
          id: Buffer.from(filePath).toString("base64"),
          name: entry.name,
          type: "file",
          size: stats.size,
          createdAt: stats.birthtime.toISOString(),
          modifiedAt: stats.mtime.toISOString(),
          path: folderPath,
        })
      }
    }

    console.log("[v0] M4A files found:", files.length)
    return files
  } catch (error) {
    console.error("[v0] Error listing files:", error)
    return []
  }
}

export async function getFolderStructure(): Promise<FolderStructure[]> {
  await ensureWorkDir()

  async function buildStructure(dirPath: string, relativePath: string): Promise<FolderStructure> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    const children: FolderStructure[] = []
    const files: FileItem[] = []

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      const entryRelativePath = path.join(relativePath, entry.name).replace(/\\/g, "/")

      if (entry.isDirectory()) {
        const childStructure = await buildStructure(fullPath, entryRelativePath)
        children.push(childStructure)
      } else if (entry.isFile() && entry.name.endsWith(".m4a")) {
        const stats = await fs.stat(fullPath)
        files.push({
          id: Buffer.from(fullPath).toString("base64"),
          name: entry.name,
          type: "file",
          size: stats.size,
          createdAt: stats.birthtime.toISOString(),
          modifiedAt: stats.mtime.toISOString(),
          path: relativePath,
        })
      }
    }

    return {
      id: Buffer.from(dirPath).toString("base64"),
      name: path.basename(dirPath) || "我的音乐",
      path: relativePath || "/",
      children,
      files,
    }
  }

  try {
    const rootStructure = await buildStructure(WORK_DIR, "/")
    return [rootStructure]
  } catch (error) {
    console.error("Error getting folder structure:", error)
    return []
  }
}

export async function createFolder(parentPath: string, folderName: string): Promise<boolean> {
  await ensureWorkDir()

  // 验证文件夹名称
  if (!folderName || folderName.includes("..") || folderName.includes("/") || folderName.includes("\\")) {
    return false
  }

  const fullPath = path.join(WORK_DIR, parentPath, folderName)

  try {
    await fs.mkdir(fullPath, { recursive: true })
    return true
  } catch (error) {
    console.error("Error creating folder:", error)
    return false
  }
}

export async function deleteFolder(folderPath: string): Promise<boolean> {
  await ensureWorkDir()

  // 防止删除根目录
  if (folderPath === "/" || folderPath === "") {
    return false
  }

  const fullPath = path.join(WORK_DIR, folderPath)

  try {
    await fs.rmdir(fullPath, { recursive: true })
    return true
  } catch (error) {
    console.error("Error deleting folder:", error)
    return false
  }
}

export async function saveUploadedFile(file: File, targetPath: string): Promise<boolean> {
  await ensureWorkDir()

  const fullPath = path.join(WORK_DIR, targetPath)

  try {
    // 确保目标目录存在
    await fs.mkdir(path.dirname(fullPath), { recursive: true })

    // 将文件保存到磁盘
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(fullPath, buffer)

    return true
  } catch (error) {
    console.error("Error saving file:", error)
    return false
  }
}
