"use client"

import { useState, useCallback } from "react"
import type { QueueTask, QueueStats } from "@/types/upload-queue"
import { useAuth } from "@/hooks/use-auth"
import { usePolling } from "@/hooks/use-polling"

export function useUploadQueue() {
  const [tasks, setTasks] = useState<QueueTask[]>([])
  const [stats, setStats] = useState<QueueStats>({
    total: 0,
    waiting: 0,
    processing: 0,
    success: 0,
    failed: 0,
    cancelled: 0,
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [maxConcurrent, setMaxConcurrent] = useState(3)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { getAuthHeaders, isAuthenticated, token } = useAuth()

  const fetchQueueStatus = useCallback(async () => {
    if (!isAuthenticated || !token) {
      console.log("[v0] Skipping queue status fetch - not authenticated")
      return
    }

    try {
      setError(null)
      const headers = getAuthHeaders()
      console.log("[v0] Fetching queue status with headers:", headers)

      const response = await fetch("/api/queue/status", {
        headers,
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      } else {
        const errorText = await response.text()
        console.log("[v0] Queue status response error:", response.status, errorText)
        throw new Error(`Failed to fetch queue status: ${response.status}`)
      }
    } catch (err) {
      setError("获取队列状态失败")
      console.error("Error fetching queue status:", err)
    }
  }, [getAuthHeaders, isAuthenticated, token])

  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated || !token) {
      console.log("[v0] Skipping tasks fetch - not authenticated")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const headers = getAuthHeaders()
      console.log("[v0] Fetching tasks with headers:", headers)

      const response = await fetch("/api/queue/tasks", {
        headers,
      })

      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks)
      } else {
        const errorText = await response.text()
        console.log("[v0] Tasks response error:", response.status, errorText)
        throw new Error(`Failed to fetch tasks: ${response.status}`)
      }
    } catch (err) {
      setError("获取任务列表失败")
      console.error("Error fetching tasks:", err)
    } finally {
      setIsLoading(false)
    }
  }, [getAuthHeaders, isAuthenticated, token])

  const refreshData = useCallback(async () => {
    await Promise.all([fetchQueueStatus(), fetchTasks()])
  }, [fetchQueueStatus, fetchTasks])

  usePolling(refreshData, {
    interval: 3000,
    enabled: isAuthenticated && !!token,
    immediate: true,
  })

  // 添加任务到队列
  const addTask = useCallback(
    (file: File, targetFolder: string): string => {
      const taskId = Math.random().toString(36).substr(2, 9)
      const newTask: QueueTask = {
        id: taskId,
        fileName: file.name,
        fileSize: file.size,
        targetFolder,
        status: "waiting",
        progress: 0,
        createdAt: new Date().toISOString(),
      }

      setTasks((prev) => [...prev, newTask])

      setTimeout(refreshData, 100)

      return taskId
    },
    [refreshData],
  )

  // 更新任务状态
  const updateTask = useCallback((taskId: string, updates: Partial<QueueTask>) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task)))
  }, [])

  const cancelTask = useCallback(
    async (taskId: string) => {
      try {
        const response = await fetch("/api/queue/cancel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ taskId }),
        })

        if (response.ok) {
          await refreshData()
        } else {
          throw new Error("Failed to cancel task")
        }
      } catch (err) {
        setError("取消任务失败")
        console.error("Error cancelling task:", err)
      }
    },
    [getAuthHeaders, refreshData],
  )

  // 重试失败的任务
  const retryTask = useCallback(
    (taskId: string) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId && task.status === "failed"
            ? {
                ...task,
                status: "waiting",
                progress: 0,
                error: undefined,
                startedAt: undefined,
                completedAt: undefined,
              }
            : task,
        ),
      )

      setTimeout(refreshData, 100)
    },
    [refreshData],
  )

  // 清除已完成的任务
  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((task) => !["success", "failed", "cancelled"].includes(task.status)))
  }, [])

  // 清除所有任务
  const clearAll = useCallback(() => {
    setTasks([])
  }, [])

  // 暂停/恢复队列处理
  const toggleProcessing = useCallback(() => {
    setIsProcessing((prev) => !prev)
  }, [])

  return {
    tasks,
    stats,
    isProcessing,
    maxConcurrent,
    isLoading,
    error,
    setMaxConcurrent,
    addTask,
    updateTask,
    cancelTask,
    retryTask,
    clearCompleted,
    clearAll,
    toggleProcessing,
    refreshData,
  }
}
