"use client"

import { useEffect, useRef, useCallback } from "react"

interface UsePollingOptions {
  interval: number
  enabled: boolean
  immediate?: boolean
}

export function usePolling(
  callback: () => void | Promise<void>,
  { interval, enabled, immediate = true }: UsePollingOptions,
) {
  const callbackRef = useRef(callback)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 更新回调引用
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    if (immediate) {
      callbackRef.current()
    }

    intervalRef.current = setInterval(() => {
      callbackRef.current()
    }, interval)
  }, [interval, immediate])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (enabled) {
      startPolling()
    } else {
      stopPolling()
    }

    return stopPolling
  }, [enabled, startPolling, stopPolling])

  return { startPolling, stopPolling }
}
