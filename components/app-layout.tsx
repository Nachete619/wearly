"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { UploadOutfitModal } from "@/components/upload-outfit-modal"
import { Toaster } from "@/components/ui/toaster"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [showUploadModal, setShowUploadModal] = useState(false)

  const handleUploadClick = () => {
    setShowUploadModal(true)
  }

  const handleUploadSuccess = () => {
    // Refresh the page to show the new outfit
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar onUploadClick={handleUploadClick} />

      {/* Main Content */}
      <div className="pl-16">
        {/* Header */}
        <Header onUploadClick={handleUploadClick} />

        {/* Page Content */}
        <main className="min-h-screen">{children}</main>
      </div>

      {/* Upload Modal */}
      <UploadOutfitModal open={showUploadModal} onOpenChange={setShowUploadModal} onSuccess={handleUploadSuccess} />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  )
}
