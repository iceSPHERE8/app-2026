// app/admin/layout.tsx
import "./admin-globals.css"; // 只在这里引入
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    // 使用 admin-theme 类来包裹所有内容
    // 这样 shadcn 组件使用的变量（如 bg-background）只会在这个容器内生效
    <div className={cn("admin-theme min-h-screen bg-background font-sans antialiased")}>
      {children}
    </div>
  );
}