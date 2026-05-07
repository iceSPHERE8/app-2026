import { cookies } from "next/headers";
import Dashboard from "./components/layout/dashboard";
import { LoginFormWrapper } from "./components/layout/login-form-wrapper";

export default async function AdminPage() {
    // 1. 服务端直接读取 Cookie（这是 httpOnly 的唯一读取方式）
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    // 2. 这里的验证逻辑在服务器运行，刷新时会立即判定
    if (token === "authorized_session_secret") {
        return <Dashboard />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                {/* 使用一个客户端包装组件来处理登录成功后的刷新 */}
                <LoginFormWrapper />
            </div>
        </div>
    );
}