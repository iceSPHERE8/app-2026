export default function Footer() {
    return (
        <>
            <div className="w-full font-sans h-[360px] bg-[url('/footer-bg.jpg')] bg-cover bg-center bg-no-repeat flex items-center justify-center text-[#182018] font-mono select-none overflow-hidden">
                {/* 内部主容器：使用 scale 控制整体缩小，保持排版紧凑 */}
                <div className="flex flex-col items-center scale-[0.8] md:scale-90">
                    {/* 顶部版权文字 */}
                    <h2 className="text-[40px] font-black tracking-widest mb-6">
                        COPYRIGHT&copy;2026
                    </h2>

                    {/* 居中核心排版区 */}
                    <div className="relative flex flex-col mt-2 mb-10 w-[320px]">
                        {/* 左侧文字：EST. (使用绝对定位贴在左边) */}
                        <div className="absolute right-[102%] bottom-[32px] text-[64px] leading-none font-black tracking-widest pr-4">
                            EST.
                        </div>

                        {/* SVG 占位纯色块 (包含 Logo 和 BADBUG STUDIO) */}
                        <div className="w-full h-[72px] bg-[#182018] flex items-center justify-center text-white/40 text-sm tracking-widest rounded-sm">
                            SVG COMPONENT
                        </div>

                        {/* 底部城市文字：CHENGDU/CN (利用 margin-left 产生缩进对其效果) */}
                        <div className="text-[26px] font-black tracking-widest mt-2 ml-[96px]">
                            CHENGDU/CN
                        </div>

                        {/* 右侧备案号：ICP (使用绝对定位贴在右边) */}
                        <div className="absolute left-[105%] top-4 text-xl font-bold tracking-widest pl-2 whitespace-nowrap">
                            ICP-2026023230
                        </div>
                    </div>

                    {/* 胶囊形状保留权利块 */}
                    <div className="border-[3px] border-[#182018] rounded-full px-8 py-1.5 text-base font-bold tracking-widest mb-8">
                        ALL RIGHTS RES.
                    </div>

                    {/* 最底部的细小说明文字 */}
                    <div className="flex flex-col items-center text-center text-[13px] leading-[1.6] font-bold tracking-widest w-full">
                        <p>
                            DESIGNED AND CODED BY BADBUG - DIGITAL MEDIA
                            DESIGNER.
                        </p>
                        <p>
                            ALL VISUALS ARCHITECTED FOR INTERACTIVE SWARM
                            SYSTEM.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
