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

export function useFFmpegTranscode() {
  const ffmpegRef = useRef<FFmpeg | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isTranscoding, setIsTranscoding] = useState(false)

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
      return ffmpeg
    } catch (error) {
      console.error("Failed to load FFmpeg:", error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const transcodeFlacToAac = useCallback(async (
    flacFile: File, 
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

      const inputFileName = `input_${Date.now()}.flac`
      const outputFileName = `output_${Date.now()}.m4a`

      // Write input file to FFmpeg's virtual file system
      await ffmpeg.writeFile(inputFileName, await fetchFile(flacFile))

      // Set up progress listener
      ffmpeg.on('progress', ({ progress, time }) => {
        const progressPercent = Math.round(progress * 100)
        onProgress?.(progressPercent, time)
      })

      // Transcode FLAC to AAC
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
      const outputBlob = new Blob([outputData], { type: 'audio/mp4' })
      const outputFile = new File([outputBlob], flacFile.name.replace('.flac', '.m4a'), {
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

  const isFlacFile = useCallback((file: File): boolean => {
    return file.name.toLowerCase().endsWith('.flac')
  }, [])

  return {
    loadFFmpeg,
    transcodeFlacToAac,
    isFlacFile,
    isLoading,
    isTranscoding
  }
}