"use client";

import { LoginForm } from "./login-form";
import { useRouter } from "next/navigation";

export function LoginFormWrapper() {
    const router = useRouter();

    const handleLoginSuccess = () => {
        // 关键：通知服务器重新检查 Cookie 并渲染 Dashboard
        router.refresh();
    };

    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
}