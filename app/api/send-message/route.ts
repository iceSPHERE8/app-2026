// app/api/send-message/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { email, message } = await req.json();

        // 使用 Resend 发送邮件
        const data = await resend.emails.send({
            from: 'Badbug Contact <message@badbug.studio>', // 这里用 resend 默认的测试域名发件
            to: ['icesphere8@outlook.com'], // 接收者的邮箱（填你自己的）
            subject: '你网站上的新留言',
            html: `
                <p><strong>来访者邮箱:</strong> ${email}</p>
                <p><strong>留言内容:</strong> ${message}</p>
            `,
        });

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: '发送失败' }, { status: 500 });
    }
}