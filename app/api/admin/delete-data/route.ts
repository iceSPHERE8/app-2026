import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // 确保只有管理员能删
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
    try {
        // 1. 身份校验
        const cookieStore = await cookies();
        if (cookieStore.get('admin_token')?.value !== 'authorized_session_secret') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { type, id } = await req.json();

        // 2. 参数白名单校验
        const allowedTypes = ['all-works', 'tool-lab']; 
        if (!allowedTypes.includes(type)) {
             return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const jsonPath = path.join(process.cwd(), 'data', `${type}.json`);
        const fileData = await fs.readFile(jsonPath, 'utf8');
        let items = JSON.parse(fileData);
        
        const itemToDelete = items.find((item: any) => item.id === id);
        const ALLOWED_ROOT = path.join(process.cwd(), 'public', 'uploads');

        if (itemToDelete) {
            // 提取所有可能的 URL
            const urlsToDelete = [
                itemToDelete.mainMedia?.url,
                itemToDelete.coverUrl,
                itemToDelete.previewVideoUrl
            ].filter(Boolean); // 过滤掉 null/undefined

            for (const url of urlsToDelete) {
                try {
                    // 处理斜杠，确保路径从 public 开始
                    const cleanUrl = url.replace(/^\/+/, '');
                    const targetPath = path.join(process.cwd(), 'public', cleanUrl);
                    const normalizedPath = path.normalize(targetPath);

                    // 安全检查：必须在 uploads 目录内
                    if (normalizedPath.startsWith(ALLOWED_ROOT)) {
                        await fs.unlink(normalizedPath);
                    }
                } catch (err: any) {
                    if (err.code !== 'ENOENT') console.error(err);
                }
            }
        }

        const newItems = items.filter((item: any) => item.id !== id);
        await fs.writeFile(jsonPath, JSON.stringify(newItems, null, 2));
        
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}