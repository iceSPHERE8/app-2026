import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';

// 限制配置文件的最大长度，防止恶意超大文件 (例如限制为 500KB)
const MAX_CONFIG_SIZE = 500 * 1024;

export async function POST(req: Request) {
    try {
        // 1. 身份校验：仅限管理员
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token')?.value;
        if (token !== 'authorized_session_secret') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { data } = body;

        // 2. 数据有效性校验
        if (!data || typeof data !== 'object') {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }

        // 3. 防止 DoS 攻击：检查 JSON 字符串长度
        const configString = JSON.stringify(data, null, 2);
        if (configString.length > MAX_CONFIG_SIZE) {
            return NextResponse.json({ error: "Config data too large" }, { status: 413 });
        }

        const dataDir = path.join(process.cwd(), 'data');
        const jsonPath = path.join(dataDir, 'particle-config.json');

        // 4. 确保目录存在
        await fs.mkdir(dataDir, { recursive: true });

        // 5. 原子化写入 (可选)：先写临时文件再重命名，防止写入一半断电导致原文件损坏
        const tempPath = `${jsonPath}.tmp`;
        await fs.writeFile(tempPath, configString, 'utf8');
        await fs.rename(tempPath, jsonPath);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Particle config save error:", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}