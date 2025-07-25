import type React from "react"
import { AdminLayout } from "../admin/components/AdminLayout"
import { Toaster } from "@/components/ui/toaster"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminLayout>{children}</AdminLayout>
      <Toaster />
    </>
  )
}
