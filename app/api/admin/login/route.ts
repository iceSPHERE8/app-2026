import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs"; // 引入加密库

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        // 1. 读取存储的账号信息
        const filePath = path.join(process.cwd(), "data", "private", "account.json");
        const fileContent = await fs.readFile(filePath, "utf8");
        const accounts = JSON.parse(fileContent);
        
        // 2. 查找匹配的用户
        const account = accounts.find((acc: any) => acc.username === username);

        // 3. 安全校验逻辑
        if (!account) {
            // 即使用户名不存在，也返回通用错误，防止攻击者枚举用户名
            return NextResponse.json({ success: false, message: "用户名或密码错误" }, { status: 401 });
        }

        // 4. 使用 bcrypt 比对明文密码与数据库中的 Hash 值
        const isPasswordMatch = await bcrypt.compare(password, account.password);

        if (isPasswordMatch) {
            // 登录成功
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, message: "用户名或密码错误" }, { status: 401 });
        }
    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ success: false, message: "服务器错误" }, { status: 500 });
    }
}