import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        // 获取 account.json 的绝对路径
        const filePath = path.join(process.cwd(), "data", "account.json");
        const fileContent = await fs.readFile(filePath, "utf8");
        const account = JSON.parse(fileContent)[0];

        // 比对数据
        if (username === account.username && password === account.password) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, message: "用户名或密码错误" }, { status: 401 });
        }
    } catch (error) {
        return NextResponse.json({ success: false, message: "服务器错误" }, { status: 500 });
    }
}