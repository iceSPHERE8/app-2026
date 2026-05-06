import { NextResponse } from 'next/server';
import fs from 'fs/promises'; // 切换到异步版本
import path from 'path';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // 1. 基础校验
    if (!type) {
        return NextResponse.json({ error: "Missing type" }, { status: 400 });
    }

    // 2. 路径安全白名单：只允许读取特定的展示数据
    const PUBLIC_ALLOWED_TYPES = ['all-works', 'tool-lab', 'particle-config'];
    
    if (!PUBLIC_ALLOWED_TYPES.includes(type)) {
        // 如果 type 不在白名单内，直接报 403，防止攻击者探测其他文件
        return NextResponse.json({ error: "Forbidden: Access Denied" }, { status: 403 });
    }

    try {
        const filePath = path.join(process.cwd(), 'data', `${type}.json`);
        
        try {
            const fileContent = await fs.readFile(filePath, 'utf8');
            const data = JSON.parse(fileContent);
            return NextResponse.json(data);
        } catch (err: any) {
            // 如果文件不存在 (ENOENT)，返回空数组，而不是报错
            if (err.code === 'ENOENT') {
                return NextResponse.json([]);
            }
            throw err;
        }
    } catch (error) {
        console.error("Read data error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}