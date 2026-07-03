const metalPanelClass = `relative flex items-center justify-between px-4 md:px-12 w-full z-50 bg-[#C4C4C4]`;
const metalTagClass = `flex items-center justify-center px-3 py-0.5 bg-transparent text-gray-950`;
const engravedTextClass = `text-gray-950`;
const buttonClass = `relative flex items-center justify-center px-2 py-1 rounded-full border border-[#a1a1a1] text-[10px] md:text-[11px] leading-none font-normal uppercase cursor-pointer tracking-widest border-[#a1a1a1] bg-gradient-to-b from-[#eaeaea] via-[#e6e6e6] to-[#ababab] text-[#4a4a4a] [text-shadow:0_1px_0_rgba(255,255,255,0.8)] shadow-[inset_0_1px_0_rgba(255,255,255,1),0_1.5px_3px_rgba(0,0,0,0.5)] hover:-translate-y-px hover:border-blue-900/60 hover:from-blue-100 hover:via-blue-500 hover:to-blue-700 hover:stops-[0%,50%,50%,100%] hover:text-white hover:[text-shadow:0_-1px_0_rgba(0,0,0,0.5)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_8px_4px_-3px_white,inset_0_-3px_6px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.2)] active:translate-y-px active:scale-[0.98] active:from-blue-800 active:to-blue-600 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_1px_1px_rgba(0,0,0,0.1)]`;



export default function Header() {
    const handleScrollToContact = () => {
        const contactSection = document.getElementById("contact-section");
        if (contactSection) {
            contactSection.scrollIntoView({ 
                behavior: "smooth", // 开启平滑滚动
                block: "start"      // 滚动后让目标区域贴住视口顶部
            });
        }
    };

    return (
        <>
            <header className={`${metalPanelClass} h-10 flex-shrink-0`}>
                <div className="flex items-center">
                    <span
                        className={`font-bold text-base md:text-lg tracking-wide ${engravedTextClass}`}
                    >
                        BADBUG.STUDIO
                    </span>
                </div>

                <div className="hidden md:flex items-center text-center">
                    <span
                        className={`text-sm font-normal tracking-widest ${metalTagClass}`}
                    >
                        SINCE 2022
                    </span>
                </div>
                <div className="hidden md:flex items-center text-center">
                    <span
                        className={`font-normal text-xs tracking-widest uppercase ${engravedTextClass}`}
                    >
                        Interactive Coding \ CG Art \ Motion
                    </span>
                </div>

                <div className="flex items-center text-right">
                    <button className={buttonClass} onClick={handleScrollToContact}>Contact me</button>
                </div>
            </header>
        </>
    );
}
