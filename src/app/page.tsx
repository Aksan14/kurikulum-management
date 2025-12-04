"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { GraduationCap } from "lucide-react"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to login page
    router.push("/login")
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4">
          <GraduationCap className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Kurikulum Management System</h1>
        <p className="text-gray-500 mt-2">Mengalihkan ke halaman login...</p>
        <div className="mt-4">
          <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  )
}
