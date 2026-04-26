import { useState, useCallback, useRef } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

interface TranscodeOptions {
  onProgress?: (progress: number, time?: number) => void
  onError?: (error: string) => void
}

interface TranscodeResult {
  success: boolean
  outputFile?: File
  error?: string
}

// Supported lossless audio formats
const LOSSLESS_FORMATS = ['.flac', '.wav', '.aiff', '.aif', '.wv', '.ape', '.tta', '.dsf', '.dff']

export function useFFmpegTranscode() {
  const ffmpegRef = useRef<FFmpeg | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isTranscoding, setIsTranscoding] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const loadFFmpeg = useCallback(async (): Promise<FFmpeg | null> => {
    if (ffmpegRef.current) return ffmpegRef.current

    setIsLoading(true)
    try {
      const ffmpeg = new FFmpeg()
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd"
      
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      })
      
      ffmpegRef.current = ffmpeg
      setIsLoaded(true)
      return ffmpeg
    } catch (error) {
      console.error("Failed to load FFmpeg:", error)
      setIsLoaded(false)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const transcodeToAac = useCallback(async (
    audioFile: File,
    options: TranscodeOptions = {}
  ): Promise<TranscodeResult> => {
    const { onProgress, onError } = options
    
    try {
      setIsTranscoding(true)
      
      const ffmpeg = await loadFFmpeg()
      if (!ffmpeg) {
        const error = "无法加载音频转码器"
        onError?.(error)
        return { success: false, error }
      }

      const inputExtension = '.' + audioFile.name.split('.').pop()?.toLowerCase()
      const inputFileName = `input_${Date.now()}${inputExtension}`
      const outputFileName = `output_${Date.now()}.m4a`

      // Write input file to FFmpeg's virtual file system
      await ffmpeg.writeFile(inputFileName, await fetchFile(audioFile))

      // Set up progress listener
      ffmpeg.on('progress', ({ progress, time }) => {
        const progressPercent = Math.round(progress * 100)
        onProgress?.(progressPercent, time)
      })

      // Transcode audio to AAC
      await ffmpeg.exec([
        '-i', inputFileName,
        '-c:a', 'aac',
        '-b:a', '256k',
        '-map', '0',
        '-c:v', 'copy',
        outputFileName
      ])

      onProgress?.(100, 0)

      // Read the transcoded file
      const outputData = await ffmpeg.readFile(outputFileName)
      
      // Convert to File object
      const outputBlobPart = typeof outputData === 'string' ? outputData : new Uint8Array(outputData)
      const outputBlob = new Blob([outputBlobPart], { type: 'audio/mp4' })
      const outputFile = new File([outputBlob], audioFile.name.replace(/\.[^/.]+$/, '.m4a'), {
        type: 'audio/mp4'
      })

      // Clean up
      await ffmpeg.deleteFile(inputFileName)
      await ffmpeg.deleteFile(outputFileName)

      return { success: true, outputFile }
    } catch (error) {
      console.error("Transcoding error:", error)
      const errorMessage = "音频转码失败"
      onError?.(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsTranscoding(false)
    }
  }, [loadFFmpeg])

  const isLosslessFile = useCallback((file: File): boolean => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    return LOSSLESS_FORMATS.includes(extension)
  }, [])

  const getTranscodeFileName = useCallback((originalFile: File): string => {
    const baseName = originalFile.name.replace(/\.[^/.]+$/, '') // Remove extension
    return `${baseName}.m4a`
  }, [])

  return {
    loadFFmpeg,
    transcodeToAac,
    isLosslessFile,
    getTranscodeFileName,
    isLoading,
    isTranscoding,
    isLoaded
  }
}
