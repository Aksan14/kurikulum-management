"use client"

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function DokumenPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to generate page
    router.replace('/kaprodi/dokumen/generate')
  }, [router])

  return (
    <DashboardLayout>
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    </DashboardLayout>
  )
}
