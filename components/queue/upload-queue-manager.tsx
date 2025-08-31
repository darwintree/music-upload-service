// "use client"

// import { useState } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Progress } from "@/components/ui/progress"
// import { Badge } from "@/components/ui/badge"
// import { Separator } from "@/components/ui/separator"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import {
//   Clock,
//   Play,
//   Pause,
//   MoreHorizontal,
//   RotateCcw,
//   X,
//   Trash2,
//   CheckCircle,
//   AlertCircle,
//   FileAudio,
//   Settings,
//   RefreshCw,
// } from "lucide-react"
// import type { QueueTask } from "@/types/upload-queue"
// import { useUploadQueue } from "@/hooks/use-upload-queue"

// interface UploadQueueManagerProps {
//   className?: string
// }

// export function UploadQueueManager({ className }: UploadQueueManagerProps) {
//   const {
//     tasks,
//     stats,
//     isProcessing,
//     maxConcurrent,
//     isLoading,
//     error,
//     setMaxConcurrent,
//     cancelTask,
//     retryTask,
//     clearCompleted,
//     clearAll,
//     toggleProcessing,
//     refreshData,
//   } = useUploadQueue()

//   const [showSettings, setShowSettings] = useState(false)

//   const getStatusIcon = (status: QueueTask["status"]) => {
//     switch (status) {
//       case "success":
//         return <CheckCircle className="h-4 w-4 text-green-500" />
//       case "failed":
//         return <AlertCircle className="h-4 w-4 text-destructive" />
//       case "processing":
//         return <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
//       case "cancelled":
//         return <X className="h-4 w-4 text-muted-foreground" />
//       default:
//         return <Clock className="h-4 w-4 text-muted-foreground" />
//     }
//   }

//   const getStatusBadge = (status: QueueTask["status"]) => {
//     const variants = {
//       waiting: "secondary",
//       processing: "default",
//       success: "default",
//       failed: "destructive",
//       cancelled: "secondary",
//     } as const

//     const labels = {
//       waiting: "等待中",
//       processing: "处理中",
//       success: "成功",
//       failed: "失败",
//       cancelled: "已取消",
//     }

//     return (
//       <Badge variant={variants[status]} className="text-xs">
//         {labels[status]}
//       </Badge>
//     )
//   }

//   const formatFileSize = (bytes: number) => {
//     if (bytes === 0) return "0 Bytes"
//     const k = 1024
//     const sizes = ["Bytes", "KB", "MB", "GB"]
//     const i = Math.floor(Math.log(bytes) / Math.log(k))
//     return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
//   }

//   const formatTime = (dateString?: string) => {
//     if (!dateString) return "-"
//     return new Date(dateString).toLocaleTimeString("zh-CN", {
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//     })
//   }

//   const getOverallProgress = () => {
//     if (tasks.length === 0) return 0
//     const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0)
//     return Math.round(totalProgress / tasks.length)
//   }

//   return (
//     <div className={className}>
//       <Card>
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <CardTitle className="flex items-center gap-2">
//               <Clock className="h-5 w-5 text-primary" />
//               上传队列
//               <div className="flex items-center gap-2 ml-2">
//                 <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
//                 <span className="text-xs text-muted-foreground">实时更新</span>
//               </div>
//             </CardTitle>
//             <div className="flex items-center gap-2">
//               <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
//                 <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
//               </Button>

//               <Button variant="outline" size="sm" onClick={toggleProcessing} className="gap-2 bg-transparent">
//                 {isProcessing ? (
//                   <>
//                     <Pause className="h-4 w-4" />
//                     暂停
//                   </>
//                 ) : (
//                   <>
//                     <Play className="h-4 w-4" />
//                     开始
//                   </>
//                 )}
//               </Button>

//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="outline" size="sm">
//                     <Settings className="h-4 w-4" />
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end">
//                   <DropdownMenuItem onClick={clearCompleted}>
//                     <Trash2 className="h-4 w-4 mr-2" />
//                     清除已完成
//                   </DropdownMenuItem>
//                   <DropdownMenuItem onClick={clearAll} className="text-destructive">
//                     <Trash2 className="h-4 w-4 mr-2" />
//                     清除所有
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>
//           </div>
//         </CardHeader>

//         <CardContent className="space-y-4">
//           {error && (
//             <Alert variant="destructive">
//               <AlertCircle className="h-4 w-4" />
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}

//           {/* 队列统计 */}
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//             <div className="text-center">
//               <div className="text-2xl font-bold text-foreground">{stats.total}</div>
//               <div className="text-xs text-muted-foreground">总计</div>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold text-yellow-600">{stats.waiting}</div>
//               <div className="text-xs text-muted-foreground">等待中</div>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
//               <div className="text-xs text-muted-foreground">处理中</div>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold text-green-600">{stats.success}</div>
//               <div className="text-xs text-muted-foreground">成功</div>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
//               <div className="text-xs text-muted-foreground">失败</div>
//             </div>
//           </div>

//           {/* 整体进度 */}
//           {tasks.length > 0 && (
//             <div className="space-y-2">
//               <div className="flex justify-between text-sm">
//                 <span>整体进度</span>
//                 <span>{getOverallProgress()}%</span>
//               </div>
//               <Progress value={getOverallProgress()} className="h-2" />
//             </div>
//           )}

//           <Separator />

//           {/* 任务列表 */}
//           {tasks.length === 0 ? (
//             <div className="text-center py-8">
//               <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//               <p className="text-muted-foreground">当前没有上传任务</p>
//               <p className="text-sm text-muted-foreground mt-2">上传文件后任务将显示在这里</p>
//             </div>
//           ) : (
//             <div className="space-y-3 max-h-96 overflow-y-auto">
//               {tasks.map((task) => (
//                 <div key={task.id} className="flex items-center gap-3 p-3 border rounded-lg">
//                   {getStatusIcon(task.status)}

//                   <FileAudio className="h-4 w-4 text-primary" />

//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center gap-2 mb-1">
//                       <p className="text-sm font-medium truncate">{task.fileName}</p>
//                       {getStatusBadge(task.status)}
//                     </div>

//                     <div className="flex items-center gap-4 text-xs text-muted-foreground">
//                       <span>{formatFileSize(task.fileSize)}</span>
//                       <span>目标: {task.targetFolder === "/" ? "根目录" : task.targetFolder}</span>
//                       <span>创建: {formatTime(task.createdAt)}</span>
//                       {task.completedAt && <span>完成: {formatTime(task.completedAt)}</span>}
//                     </div>

//                     {task.status === "processing" && <Progress value={task.progress} className="mt-2 h-1" />}

//                     {task.error && <p className="text-xs text-destructive mt-1">{task.error}</p>}
//                   </div>

//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
//                         <MoreHorizontal className="h-3 w-3" />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
//                       {task.status === "failed" && (
//                         <DropdownMenuItem onClick={() => retryTask(task.id)}>
//                           <RotateCcw className="h-4 w-4 mr-2" />
//                           重试
//                         </DropdownMenuItem>
//                       )}
//                       {(task.status === "waiting" || task.status === "processing") && (
//                         <DropdownMenuItem onClick={() => cancelTask(task.id)}>
//                           <X className="h-4 w-4 mr-2" />
//                           取消
//                         </DropdownMenuItem>
//                       )}
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* 队列设置 */}
//           {showSettings && (
//             <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
//               <h4 className="font-medium">队列设置</h4>
//               <div className="flex items-center justify-between">
//                 <label className="text-sm">最大并发数</label>
//                 <select
//                   value={maxConcurrent}
//                   onChange={(e) => setMaxConcurrent(Number(e.target.value))}
//                   className="px-2 py-1 border rounded text-sm"
//                 >
//                   <option value={1}>1</option>
//                   <option value={2}>2</option>
//                   <option value={3}>3</option>
//                   <option value={5}>5</option>
//                 </select>
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
