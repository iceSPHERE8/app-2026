import Link from "next/link";
// 请根据你的实际文件路径调整引入
import TextIcon from "../icons/TextIcon";

interface NavItem {
    name: string;
    href: string;
}

const NAV_ITEMS: NavItem[] = [
    { name: "all works", href: "/works" },
    { name: "tool lab", href: "/tools" },
    { name: "projects", href: "/projects" },
];

export default function Header() {
    return (
        <header className="relative w-full flex items-center justify-center pt-8 px-8">
            <div>
                <TextIcon className="w-64 text-[#eaeaea]" />
            </div>

            <nav className="absolute right-8 flex items-center gap-4">
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        // 拟物化核心样式
                        className="
                relative group flex items-center justify-center
                px-2 pt-1 rounded-full border border-[#a1a1a1]
                text-[12px] leading-none font-table font-black uppercase transition-all ease-in-out duration-150
                
                /* 1. 银白金属质感渐变 */
                bg-gradient-to-b from-[#ffffff] via-[#e6e6e6] to-[#ababab]
                
                /* 2. 深色雕刻文字 + 纯白底边文字阴影 (模拟凹陷效果) */
                text-[#4a4a4a]
                [text-shadow:0_1px_0_rgba(255,255,255,0.8)]
                
                /* 3. 多重物理阴影: 
                   inset_0_1.5px_0_#fff (顶部的犀利反光)
                   0_2px_4px_rgba(0,0,0,0.3) (底部的物理投影) 
                */
                shadow-[inset_0_1.5px_0_rgba(255,255,255,1),0_2px_4px_rgba(0,0,0,0.3)]
                
                /* 4. 悬停状态: 稍微提亮 */
                hover:from-[#ffffff] hover:via-[#f0f0f0] hover:to-[#e0e0e0]
                hover:shadow-[inset_0_1.5px_0_rgba(255,255,255,1),0_3px_6px_rgba(0,0,0,0.4)]
                
                /* 5. 按下状态: 物理下压，渐变翻转，内阴影加深 */
                active:translate-y-[2px]
                active:from-[#c4c4c4] active:via-[#d4d4d4] active:to-[#e6e6e6]
                active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_0px_0px_rgba(0,0,0,0)]
            "
                    >
                        {item.name}
                    </Link>
                ))}
            </nav>
        </header>
    );
}
