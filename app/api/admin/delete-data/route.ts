import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
    try {
        const { type, id } = await req.json();
        const jsonPath = path.join(process.cwd(), 'data', `${type}.json`);
        
        const fileData = await fs.readFile(jsonPath, 'utf8');
        let items = JSON.parse(fileData);
        
        const itemToDelete = items.find((item: any) => item.id === id);
        
        // 定义允许删除的根目录基准
        const ALLOWED_ROOT = path.join(process.cwd(), 'public', 'uploads');

        if (itemToDelete) {
            const urlsToDelete: string[] = [];
            if (itemToDelete.mainMedia?.url) urlsToDelete.push(itemToDelete.mainMedia.url);
            if (itemToDelete.coverUrl) urlsToDelete.push(itemToDelete.coverUrl);
            if (itemToDelete.previewVideoUrl) urlsToDelete.push(itemToDelete.previewVideoUrl);

            for (const url of urlsToDelete) {
                try {
                    // 1. 生成初步路径
                    const targetPath = path.join(process.cwd(), 'public', url);
                    
                    // 2. 路径规范化 (处理 ../ 这种恶意片段)
                    const normalizedPath = path.normalize(targetPath);

                    // 3. 安全检查：判断规范化后的路径是否以 ALLOWED_ROOT 开头
                    if (normalizedPath.startsWith(ALLOWED_ROOT)) {
                        await fs.unlink(normalizedPath);
                        console.log(`[Safe Delete] Success: ${normalizedPath}`);
                    } else {
                        console.warn(`[Security Alert] Attempted to delete outside of uploads: ${normalizedPath}`);
                    }
                } catch (err: any) {
                    // 如果文件本身不存在，unlink 会抛出 ENOENT，忽略它即可
                    if (err.code !== 'ENOENT') {
                        console.error(`Failed to delete file: ${url}`, err);
                    }
                }
            }
        }

        // 更新 JSON 数据
        const newItems = items.filter((item: any) => item.id !== id);
        await fs.writeFile(jsonPath, JSON.stringify(newItems, null, 2));
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete handler error:", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}