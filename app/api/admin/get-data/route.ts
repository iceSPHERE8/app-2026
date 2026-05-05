// app/api/admin/get-data/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
        return NextResponse.json({ error: "Missing type" }, { status: 400 });
    }

    try {
        const filePath = path.join(process.cwd(), 'data', `${type}.json`);
        
        if (!fs.existsSync(filePath)) {
            return NextResponse.json([]); // 如果文件不存在，返回空数组
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Failed to read data" }, { status: 500 });
    }
}