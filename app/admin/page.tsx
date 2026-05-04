"use client";

import { useState, useEffect } from "react";
import { LoginForm } from "./components/layout/login-form";

import Cookies from "js-cookie";
import Dashboard from "./components/layout/dashboard";

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // 读取 Cookie
        const token = Cookies.get("admin_token");
        if (token === "true") {
            setIsAuthenticated(true);
        }
        setIsChecking(false);
    }, []);

    const handleLogout = () => {
        Cookies.remove("admin_token", { path: "/" }); // 移除 Cookie
        setIsAuthenticated(false);
    };

    if (isChecking) return null; // 避免闪烁

    // --- 省略 handleImageUpload, saveItem, deleteItem 等逻辑 ---

    // 如果未认证，只显示登录表单
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm">
                    {/* 传入成功后的回调 */}
                    <LoginForm
                        onLoginSuccess={() => setIsAuthenticated(true)}
                    />
                </div>
            </div>
        );
    }

    // 认证后的管理界面
    return (
        <Dashboard />
    );
}
