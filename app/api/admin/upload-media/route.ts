// app/api/admin/upload-media/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ success: false, error: "无文件" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 保存到 public/uploads 目录，这样前端可以直接访问
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadDir, fileName);

        fs.writeFileSync(filePath, buffer);

        return NextResponse.json({ 
            success: true, 
            url: `/uploads/${fileName}` 
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ success: false, error: "上传失败" }, { status: 500 });
    }
}