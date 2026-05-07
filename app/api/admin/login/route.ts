import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        const envUsername = process.env.ADMIN_USERNAME;
        const envPasswordHash = process.env.ADMIN_PASSWORD_HASH;      

        // 1. 验证用户名
        if (!envUsername || username !== envUsername) {
            return NextResponse.json(
                { success: false, message: "用户名或密码错误" },
                { status: 401 }
            );
        }

        // 2. 使用 bcrypt 比对明文密码与环境变量中的 Hash 值
        const isPasswordMatch = await bcrypt.compare(password, envPasswordHash || "");

        if (isPasswordMatch) {
            // 3. 登录成功，设置 httpOnly Cookie
            const cookieStore = await cookies();
            cookieStore.set("admin_token", "authorized_session_secret", {
                httpOnly: true, // 防止前端 JS 读取，防御 XSS
                secure: process.env.NODE_ENV === "production", // 生产环境仅限 HTTPS
                sameSite: "strict", // 防御 CSRF
                path: "/",
                maxAge: 60 * 60 * 24, // 有效期 1 天
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