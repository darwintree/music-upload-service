import type { QueueTask } from "@/types/upload-queue"

// 内存存储的队列（在实际应用中应该使用Redis或数据库）
let taskQueue: QueueTask[] = []
const processingTasks: Set<string> = new Set()

export function addTaskToQueue(task: QueueTask): void {
  taskQueue.push(task)
}

export function getQueueTasks(): QueueTask[] {
  return [...taskQueue]
}

export function updateTaskStatus(taskId: string, updates: Partial<QueueTask>): boolean {
  const taskIndex = taskQueue.findIndex((task) => task.id === taskId)
  if (taskIndex === -1) return false

  taskQueue[taskIndex] = { ...taskQueue[taskIndex], ...updates }
  return true
}

export function cancelTask(taskId: string): boolean {
  const task = taskQueue.find((t) => t.id === taskId)
  if (!task) return false

  if (task.status === "waiting" || task.status === "processing") {
    updateTaskStatus(taskId, {
      status: "cancelled",
      completedAt: new Date().toISOString(),
    })
    processingTasks.delete(taskId)
    return true
  }

  return false
}

export function getQueueStats() {
  const stats = {
    total: taskQueue.length,
    waiting: 0,
    processing: 0,
    success: 0,
    failed: 0,
    cancelled: 0,
  }

  taskQueue.forEach((task) => {
    switch (task.status) {
      case "waiting":
        stats.waiting++
        break
      case "processing":
        stats.processing++
        break
      case "success":
        stats.success++
        break
      case "failed":
        stats.failed++
        break
      case "cancelled":
        stats.cancelled++
        break
    }
  })

  return stats
}

export function clearCompletedTasks(): void {
  taskQueue = taskQueue.filter((task) => !["success", "failed", "cancelled"].includes(task.status))
}
