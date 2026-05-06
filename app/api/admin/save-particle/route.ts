import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
    try {
        const { data } = await req.json();
        const jsonPath = path.join(process.cwd(), 'data', 'particle-config.json');

        // 确保目录存在
        await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });

        // 直接覆盖写入当前的配置对象
        await fs.writeFile(jsonPath, JSON.stringify(data, null, 2));
        
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}