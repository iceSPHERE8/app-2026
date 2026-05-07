// app/api/admin/save-data/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("admin_token")?.value;
        if (token !== "authorized_session_secret") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { type, data, id } = await request.json();
        const filePath = path.join(process.cwd(), "data", `${type}.json`);

        let list = [];
        if (fs.existsSync(filePath)) {
            list = JSON.parse(fs.readFileSync(filePath, "utf8"));
        }

        if (id) {
            // 编辑逻辑：找到对应的 ID 并替换数据
            list = list.map((item: any) =>
                item.id === id
                    ? { ...item, ...data, updatedAt: new Date().toISOString() }
                    : item,
            );
        } else {
            // 新建逻辑
            const newItem = {
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                ...data,
            };
            list.unshift(newItem);
        }

        fs.writeFileSync(filePath, JSON.stringify(list, null, 2));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
