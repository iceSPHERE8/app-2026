"use client"; // 记得添加 client 指示器

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/app/admin/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/app/admin/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/app/admin/components/ui/field";
import { Input } from "@/app/admin/components/ui/input";

import Cookies from "js-cookie";

// 1. 定义 Props 接口，扩展自 React.ComponentProps<"div">
interface LoginFormProps extends React.ComponentProps<"div"> {
    onLoginSuccess: () => void;
}

export function LoginForm({
    className,
    onLoginSuccess, // 2. 解构出这个 prop
    ...props
}: LoginFormProps) {
    // 3. 添加 loading 和错误处理状态
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email");
        const password = formData.get("password");

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: email, password }), // 后端接收的是 username
            });

            if (res.ok) {
                // 设置一个名为 'admin_token' 的 cookie
                // expires: 1 表示有效期 1 天
                // path: '/' 表示全站有效
                Cookies.set("admin_token", "true", { expires: 1, path: "/" });
                
                onLoginSuccess(); // 登录成功，触发父组件回调
            } else {
                const data = await res.json();
                alert(data.message || "登录失败，请检查账号密码");
            }
        } catch (error) {
            alert("网络错误，请稍后再试");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* 4. 绑定 onSubmit 事件 */}
                    <form onSubmit={handleSubmit}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    name="email" // 必须有 name 属性，formData 才能获取
                                    type="email"
                                    placeholder="admin"
                                    required
                                />
                            </Field>
                            <Field>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">
                                        Password
                                    </FieldLabel>
                                </div>
                                <Input
                                    id="password"
                                    name="password" // 必须有 name 属性
                                    type="password"
                                    required
                                />
                            </Field>
                            <Field>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Logging in..." : "Login"}
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
