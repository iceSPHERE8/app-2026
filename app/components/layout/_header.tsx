"use client";

import { useMemo, useState, useEffect } from "react";

// 定义组件接收的属性接口
interface HeaderProps {
    activeType: "all-works" | "tool-lab";
    onTypeChange: (type: "all-works" | "tool-lab") => void;
}

export default function Header({ activeType, onTypeChange }: HeaderProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // 将 href 改为逻辑标识 type
    const navItems: { name: string; type: "all-works" | "tool-lab" }[] = [
        { name: "All Works", type: "all-works" },
        { name: "Tool Lab", type: "tool-lab" },
    ];

    const offsets = useMemo(() => {
        if (typeof window === "undefined" || !mounted) {
            return navItems.map(() => ({
                height: "40px",
                backgroundColor: "rgb(200, 200, 200)"
            }));
        }

        return navItems.map(() => {
            const grayValue = Math.floor(Math.random() * 30 + 170);
            return {
                height: `${Math.floor(Math.random() * 4 + 38)}px`,
                backgroundColor: `rgb(${grayValue}, ${grayValue}, ${grayValue})`
            };
        });
    }, [mounted]);

    return (
        <header className="px-12 mt-32 relative z-50">
            <nav className="flex list-none items-end">
                {navItems.map((item, index) => {
                    // 使用传入的 activeType 判断当前是否激活
                    const active = activeType === item.type;

                    return (
                        <li
                            key={item.type}
                            style={{
                                marginLeft: index === 0 ? "0px" : "-15px",
                                zIndex: active ? 30 : 20 - index,
                            }}
                        >
                            {/* 将 Link 替换为 button，点击触发状态切换 */}
                            <button
                                onClick={() => onTypeChange(item.type)}
                                className={`
                                    relative pl-8 pr-8 pt-2 pb-1 text-md uppercase font-bold
                                    flex items-center transition-all duration-300
                                    rounded-tl-xl rounded-tr-xl
                                    [clip-path:polygon(0%_0%,80%_0%,100%_100%,0%_100%)]
                                    ${
                                        active
                                            ? "text-black translate-y-[1px]"
                                            : "text-neutral-600 hover:bg-neutral-300 hover:text-black"
                                    }
                                `}
                                style={{
                                    height: active
                                        ? "40px"
                                        : mounted ? offsets[index].height : "40px",
                                    minWidth: "180px",
                                    backgroundColor: active 
                                        ? "#EAEAEA" 
                                        : (mounted ? offsets[index].backgroundColor : "#BCBCBC"),
                                }}
                            >
                                <span className="relative left-[-4px]">
                                    {item.name}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </nav>
        </header>
    );
}