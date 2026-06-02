import LogoTextIcon from "../icons/LogoTextIcon";

export default function Footer() {
    return (
        <>
            <div className="w-full font-sans h-90 bg-[url('/footer-bg.jpg')] bg-black/15 bg-blend-multiply bg-cover bg-center bg-no-repeat flex items-center justify-center text-[#182018] select-none overflow-hidden">
                <div className="flex flex-col items-center scale-75 md:scale-100">
                    
                    <h2 className="text-[34px] font-black leading-7 font-head element-glow">
                        COPYRIGHT&copy;2026
                    </h2>

                    <div className="relative flex flex-col w-[272px]">
                        <LogoTextIcon className="w-[204px] element-glow" />
                        
                        <div className="text-[22px] font-black ml-[82px] leading-none element-glow">
                            CHENGDU/CN
                        </div>

                        <div className="absolute left-[85%] top-[20px] text-[8.5px] font-bold whitespace-nowrap element-glow">
                            CN/REG
                            <a
                                href="https://beian.miit.gov.cn/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-[#697569] transition-all ease-in-out hover:element-glow"
                            >
                                [蜀ICP备2026023230号]{" "}
                            </a>
                        </div>
                    </div>

                    <div className="flex">
                        <div className="text-[27px] leading-none font-black ml-[54px] mr-[54px] font-heading element-glow">
                            EST.
                        </div>

                        <div className="border-[3px] border-[#182018] rounded-full mt-[10px] mr-[122px] px-[7px] leading-4 font-bold text-[12px] element-glow">
                            ALL RIGHTS RES.
                        </div>
                    </div>

                    <div className="flex flex-col mt-2 items-center text-center text-[8.5px] leading-[1.6] font-bold w-full element-glow">
                        <p>
                            DESIGNED AND CODED BY BADBUG - DIGITAL MEDIA
                            DESIGNER.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}