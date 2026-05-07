"use client";

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

interface LoginFormProps extends React.ComponentProps<"div"> {
    onLoginSuccess: () => void;
}

export function LoginForm({
    className,
    onLoginSuccess,
    ...props
}: LoginFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email");
        const password = formData.get("password");

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: email, password }),
            });

            if (res.ok) {
                // 此时浏览器已自动保存 httpOnly Cookie，无需前端操作
                onLoginSuccess();
            } else {
                const data = await res.json();
                setError(data.message || "登录失败");
            }
        } catch (err) {
            setError("网络连接错误，请检查服务器状态");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">管理员登录</CardTitle>
                    <CardDescription>
                        请输入后台管理账号和密码
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <FieldGroup className="gap-4">
                            <Field>
                                <FieldLabel htmlFor="email">账号</FieldLabel>
                                <Input
                                    id="email"
                                    name="email"
                                    type="text"
                                    placeholder="Username"
                                    required
                                    disabled={isLoading}
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="password">密码</FieldLabel>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    disabled={isLoading}
                                />
                            </Field>
                            {error && (
                                <p className="text-sm text-red-500 font-medium">
                                    {error}
                                </p>
                            )}
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? "登录中..." : "进入后台"}
                            </Button>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}