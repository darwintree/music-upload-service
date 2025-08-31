export interface QueueTask {
  id: string
  fileName: string
  fileSize: number
  targetFolder: string
  status: "waiting" | "processing" | "success" | "failed" | "cancelled"
  progress: number
  error?: string
  createdAt: string
  startedAt?: string
  completedAt?: string
  estimatedTime?: number
}

export interface QueueStats {
  total: number
  waiting: number
  processing: number
  success: number
  failed: number
  cancelled: number
}
