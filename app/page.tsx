"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { LoginForm } from "@/components/auth/login-form"
import { Header } from "@/components/layout/header"
import { FileManager } from "@/components/file-manager/file-manager"
// import { UploadQueueManager } from "@/components/queue/upload-queue-manager"

function Dashboard() {
  const [selectedFolder, setSelectedFolder] = useState<string>("")

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <FileManager selectedFolder={selectedFolder} onFolderSelect={setSelectedFolder} />
        {/* 
        <div className="mt-6">
          <UploadQueueManager />
        </div> */}
      </main>
    </div>
  )
}

export default function Page() {
  const { isAuthenticated, isLoading, login } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />
  }

  return <Dashboard />
}
