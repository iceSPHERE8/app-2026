import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto"; // 使用内置加密模块

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        const envUsername = process.env.ADMIN_USERNAME;
        const envPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        // 调试打印：检查读取到的变量是否完整
        console.log("Input:", username);
        console.log("Env variable from server:", envPasswordHash);

        // 1. 验证用户名
        if (!envUsername || username !== envUsername) {
            return NextResponse.json(
                { success: false, message: "用户名或密码错误" },
                { status: 401 }
            );
        }

        // 2. 生成输入密码的 SHA-256 哈希值
        const inputHash = crypto
            .createHash("sha256")
            .update(password)
            .digest("hex");

        // 3. 比对两个十六进制字符串
        // 使用 .toLowerCase() 确保大小写不敏感，防止手动输入错误
        if (inputHash === envPasswordHash?.toLowerCase()) {
            const cookieStore = await cookies();
            cookieStore.set("admin_token", "authorized_session_secret", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
                maxAge: 60 * 60 * 24,
            });

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { success: false, message: "用户名或密码错误" },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json(
            { success: false, message: "服务器内部错误" },
            { status: 500 }
        );
    }
}