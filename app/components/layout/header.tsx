"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
    const pathname = usePathname();

    // 判断是否为当前页面
    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <>
            <header>
                <div className="h-18 flex items-end justify-between px-8">
                    <div className="space-y-0">
                        <nav className="text-[1.25rem] flex list-none gap-x-8">
                            <li>
                                <Link 
                                    href="/"
                                    className={`relative pb-3 pt-2 transition-all duration-300
                                        after:absolute after:left-0 after:-top-1 after:h-1 
                                        after:bg-black after:transition-transform after:origin-left
                                        ${isActive("/") 
                                            ? "after:w-full" 
                                            : "after:w-0 hover:after:w-full"}`}
                                >
                                    Individual
                                </Link>
                            </li>

                            <li>
                                <Link 
                                    href="/motion-graphics"
                                    className={`relative pb-3 pt-2 transition-all duration-300
                                        after:absolute after:left-0 after:-top-1 after:h-1 
                                        after:bg-black after:transition-transform after:origin-left
                                        ${isActive("/motion-graphics") 
                                            ? "after:w-full" 
                                            : "after:w-0 hover:after:w-full"}`}
                                >
                                    From Work
                                </Link>
                            </li>

                            <li>
                                <Link 
                                    href="/contact"
                                    className={`relative pb-3 pt-2 transition-all duration-300
                                        after:absolute after:left-0 after:-top-1 after:h-1 
                                        after:bg-black after:transition-transform after:origin-left
                                        ${isActive("/contact") 
                                            ? "after:w-full" 
                                            : "after:w-0 hover:after:w-full"}`}
                                >
                                    Others
                                </Link>
                            </li>
                        </nav>
                    </div>
                    <div className="text-4xl">iceSphere8@outlook.com</div>
                </div>
            </header>
        </>
    );
}