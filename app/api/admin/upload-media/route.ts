import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs/promises'; // 建议使用异步 fs
import path from 'path';

// 1. 设置限制常量
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', ".glb", '.gif', '.webp', '.mp4', '.webm'];

export async function POST(request: Request) {
    try {
        // 2. 身份校验
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token')?.value;
        if (token !== 'authorized_session_secret') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "无文件" }, { status: 400 });
        }

        // 3. 文件大小校验
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: "文件过大 (限制 10MB)" }, { status: 413 });
        }

        // 4. 后缀名白名单校验
        const ext = path.extname(file.name).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return NextResponse.json({ error: "不支持的文件类型" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        
        // 确保目录存在 (异步方式)
        await fs.mkdir(uploadDir, { recursive: true });

        // 5. 文件名安全处理：只保留随机时间戳和安全后缀，丢弃原始名称
        // 这样可以彻底防止路径遍历攻击 (../) 和非法字符问题
        const safeFileName = `${Date.now()}${ext}`; 
        const filePath = path.join(uploadDir, safeFileName);

        await fs.writeFile(filePath, buffer);

        return NextResponse.json({ 
            success: true, 
            url: `/uploads/${safeFileName}` 
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "上传失败" }, { status: 500 });
    }
}