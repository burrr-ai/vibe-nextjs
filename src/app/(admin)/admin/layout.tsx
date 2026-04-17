import { AdminLayout } from "@/services/admin/page/layout"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>
}
