"use client";

import React, { useState } from "react";
// 引入你本地的 SVG 图标组件
import RedbookIcon from "./icons/RedbookIcon";
import InstagramIcon from "./icons/InstagramIcon";
import GithubIcon from "./icons/GithubIcon";

import { ContactIcon1, ContactIcon2 } from "./icons/ContactIcon";

// 定义支持的状态类型
type ButtonStatus = "idle" | "loading" | "success" | "error";

const FlatGradientButton = ({
    children,
    onClick,
    className = "",
    status = "idle",
}: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    status?: ButtonStatus;
}) => {
    // 基础共有样式
    const baseClasses =
        "relative flex items-center justify-center px-4 py-1.5 rounded-full border text-[11px] leading-none font-normal uppercase cursor-pointer tracking-widest transition-all ease-in-out duration-300 outline-none select-none";

    const statusClasses = {
        idle: "border-[#a1a1a1] bg-gradient-to-b from-[#eaeaea] via-[#e6e6e6] to-[#ababab] text-[#4a4a4a] [text-shadow:0_1px_0_rgba(255,255,255,0.8)] shadow-[inset_0_1px_0_rgba(255,255,255,1),0_1.5px_3px_rgba(0,0,0,0.5)] hover:-translate-y-px hover:border-blue-900/60 hover:from-blue-100 hover:via-blue-500 hover:to-blue-700 hover:stops-[0%,50%,50%,100%] hover:text-white hover:[text-shadow:0_-1px_0_rgba(0,0,0,0.5)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_8px_4px_-3px_white,inset_0_-3px_6px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.2)] active:translate-y-px active:scale-[0.98] active:from-blue-800 active:to-blue-600 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_1px_1px_rgba(0,0,0,0.1)]",
        loading:
            "border-yellow-600 bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-500 text-yellow-900 [text-shadow:0_1px_0_rgba(255,255,255,0.5)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_1.5px_3px_rgba(0,0,0,0.5)] pointer-events-none",
        success:
            "border-green-700 bg-gradient-to-b from-green-400 via-green-500 to-green-600 text-white [text-shadow:0_-1px_0_rgba(0,0,0,0.4)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_1.5px_3px_rgba(0,0,0,0.3)] pointer-events-none",
        error: "border-red-700 bg-gradient-to-b from-red-400 via-red-500 to-red-600 text-white [text-shadow:0_-1px_0_rgba(0,0,0,0.4)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_1.5px_3px_rgba(0,0,0,0.3)] pointer-events-none",
    };

    return (
        <button
            onClick={onClick}
            disabled={status !== "idle"}
            className={`${baseClasses} ${statusClasses[status]} ${className}`}
        >
            {children}
        </button>
    );
};

export const ContactArea = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<ButtonStatus>("idle");

    const handleSendMessage = async () => {
        if (!email || !message) return alert("PLEASE FILL IN ALL FIELDS.");

        setStatus("loading");
        try {
            const res = await fetch("/api/send-message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, message }),
            });

            if (res.ok) {
                setStatus("success");
                setEmail("");
                setMessage("");
                setTimeout(() => setStatus("idle"), 3000);
            } else {
                setStatus("error");
                setTimeout(() => setStatus("idle"), 3000);
            }
        } catch (error) {
            console.error("发送失败", error);
            setStatus("error");
            setTimeout(() => setStatus("idle"), 3000);
        }
    };

    const skeuomorphicInputClasses =
        "w-full px-3 bg-gradient-to-b from-[#dcdcdc] to-[#eeeeee] border border-[#a1a1a1] rounded-[4px] shadow-[inset_0_2px_5px_rgba(0,0,0,0.15),0_1px_0_rgba(255,255,255,1)] text-xs font-normal text-[#333] placeholder:text-[#8b8b8b] outline-none focus:border-[#7a7a7a] focus:shadow-[inset_0_2px_5px_rgba(0,0,0,0.25),0_1px_0_rgba(255,255,255,1)] transition-all";

    return (
        <section
            id="contact-section"
            className="w-full px-4 pt-36 pb-12 md:px-8 flex flex-col items-center bg-[#c4c4c4]"
        >
            <div className="w-full max-w-7xl mx-auto flex flex-col">
                {/* 顶部行：左侧图标，右侧标题 */}
                <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
                    <div className="flex items-center gap-12 md:ap-8">
                        <ContactIcon1 className="h-[72px] md:h-[96px] w-auto" />
                        <ContactIcon2 className="h-[72px] md:h-[96px] w-auto" />
                    </div>
                    {/* 匹配 96px 完美居中高度 */}
                    <h2 className="text-5xl md:text-[53px] font-black text-black uppercase text-left md:text-right leading-none md:leading-[0.9] tracking-tighter">
                        Initiate
                        <br />
                        Contact
                    </h2>
                </div>

                {/* 底部两栏：左侧表单，右侧底部社交图标和SYS状态 */}
                <div className="w-full flex flex-col md:flex-row justify-between items-stretch gap-16">
                    {/* 左侧：邮件联系区域 */}
                    <div className="w-full md:w-5/9 flex flex-col items-start pb-20 md:pb-32">
                        <p className="font-light text-sm leading-none tracking-wide mb-12 uppercase">
                            CURRENTLY AVAILABLE FOR FREELANCE & FULL-TIME
                            OPPORTUNITIES.
                        </p>

                        <div className="w-full flex flex-col gap-5">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ENTER YOUR EMAIL..."
                                className={`${skeuomorphicInputClasses} py-2.5`}
                            />

                            <div className="relative w-full">
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="YOUR MESSAGE..."
                                    maxLength={140}
                                    rows={4}
                                    className={`${skeuomorphicInputClasses} py-2.5 resize-none leading-relaxed`}
                                />
                                <div className="absolute bottom-2.5 right-2.5 text-[9px] font-normal text-[#8b8b8b] pointer-events-none bg-[#eeeeee]/80 px-1 rounded">
                                    {message.length}/140
                                </div>
                            </div>

                            <div className="w-full flex justify-end mt-2">
                                <FlatGradientButton
                                    onClick={handleSendMessage}
                                    status={status}
                                    className="w-28"
                                >
                                    {status === "idle" && "SEND"}
                                    {status === "loading" && "SENDING..."}
                                    {status === "success" && "SENT ✓"}
                                    {status === "error" && "FAILED ✕"}
                                </FlatGradientButton>
                            </div>
                        </div>
                    </div>

                    {/* 右侧：图标 */}
                    <div className="flex flex-col items-center w-full md:w-auto">
                        {/* 图标：直接放置，圆角矩形质感 */}
                        <div className="flex gap-4 items-center">
                            {/* 小红书 */}
                            <a
                                href="https://www.xiaohongshu.com/user/profile/62e78c72000000001f0062f3"
                                title="Redbook"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-[10px] bg-gradient-to-b from-[#f0f0f0] to-[#e0e0e0] border border-[#a1a1a1] shadow-[inset_0_1px_0_rgba(255,255,255,1),0_2px_3px_rgba(0,0,0,0.15)] text-[#FF2442] hover:brightness-110 hover:-translate-y-px active:translate-y-px active:shadow-none transition-all duration-200 flex items-center justify-center"
                            >
                                <RedbookIcon className="w-[22px] h-[22px]" />
                            </a>

                            {/* Instagram */}
                            <a
                                href="https://www.instagram.com/icesphere_727"
                                title="Instagram"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-[10px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] border border-[#a1a1a1] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_3px_rgba(0,0,0,0.15)] text-white hover:brightness-110 hover:-translate-y-px active:translate-y-px active:shadow-none transition-all duration-200 flex items-center justify-center"
                            >
                                <InstagramIcon className="w-[22px] h-[22px]" />
                            </a>

                            {/* GitHub */}
                            <a
                                href="https://github.com/iceSPHERE8"
                                title="GitHub"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-[10px] bg-gradient-to-b from-[#333333] to-[#1a1a1a] border border-[#000000] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_3px_rgba(0,0,0,0.25)] text-white hover:brightness-125 hover:-translate-y-px active:translate-y-px active:shadow-none transition-all duration-200 flex items-center justify-center"
                            >
                                <GithubIcon className="w-[22px] h-[22px]" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="w-full flex flex-col items-center justify-center text-sm pt-8 md:pt-24 text-[#000000] tracking-wide uppercase">
                    <div className="flex flex-col items-center">
                        <a
                            href="https://beian.miit.gov.cn/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold leading-none hover:text-black transition-colors"
                        >
                            蜀ICP备2026023230号
                        </a>
                        <span className="font-light leading-none">
                            © 2026 Badbug.studio Design.
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
};
