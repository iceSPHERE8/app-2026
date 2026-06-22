// app/api/admin/get-detail-media/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get("projectId");

        if (!projectId) {
            return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
        }

        // 安全清理：防止路径遍历攻击
        const safeProjectId = projectId.replace(/[^a-zA-Z0-9_-]/g, "");
        const filePath = path.join(process.cwd(), "data", `detail_media_${safeProjectId}.json`);

        // 如果文件存在，读取并返回；如果不存在，返回空数组
        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath, "utf8");
            return NextResponse.json(JSON.parse(fileData));
        } else {
            return NextResponse.json([]);
        }

    } catch (error) {
        console.error("Get detail media error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" }, 
            { status: 500 }
        );
    }
}