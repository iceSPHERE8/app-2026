// app/api/admin/save-data/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const { type, data } = await request.json();
        
        // 确定存储路径：项目根目录/data/xxx.json
        const dirPath = path.join(process.cwd(), 'data');
        const filePath = path.join(dirPath, `${type}.json`);

        // 确保目录存在
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }

        // 读取现有数据
        let existingData = [];
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            existingData = JSON.parse(fileContent);
        }

        // 插入新数据（带上 ID 和时间戳）
        const newData = {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            ...data
        };
        existingData.unshift(newData);

        // 写回文件
        fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

        return NextResponse.json({ success: true, item: newData });
    } catch (error) {
        console.error("Save error:", error);
        return NextResponse.json({ success: false, error: "写入失败" }, { status: 500 });
    }
}