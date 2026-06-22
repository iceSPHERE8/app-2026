// app/api/admin/save-detail-media/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
    try {
        // 1. 鉴权逻辑 (与基础数据保存保持一致)
        const cookieStore = await cookies();
        const token = cookieStore.get("admin_token")?.value;
        if (token !== "authorized_session_secret") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // 2. 解析请求体
        const { projectId, media } = await request.json();

        // 3. 基础参数校验
        if (!projectId || !Array.isArray(media)) {
            return NextResponse.json(
                { error: "Missing required fields or invalid data format" },
                { status: 400 }
            );
        }

        // 4. 安全防护：清理 projectId，防止目录遍历攻击 (Path Traversal)
        // 仅允许字母、数字、下划线和连字符
        const safeProjectId = String(projectId).replace(/[^a-zA-Z0-9_-]/g, "");
        
        if (!safeProjectId) {
            return NextResponse.json(
                { error: "Invalid Project ID" },
                { status: 400 }
            );
        }

        // 5. 确定文件路径：存入 data 文件夹，命名格式为 detail_media_[id].json
        const dataDir = path.join(process.cwd(), "data");
        const filePath = path.join(dataDir, `detail_media_${safeProjectId}.json`);

        // 可选保护机制：确保 data 目录存在
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // 6. 覆盖写入媒体数据
        // 因为前端维护了完整的列表排序和删减状态，后端直接覆盖保存即可
        fs.writeFileSync(filePath, JSON.stringify(media, null, 2));

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Save detail media error:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" }, 
            { status: 500 }
        );
    }
}