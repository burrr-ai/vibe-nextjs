import { AppLayout } from "@/services/app/page/layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}