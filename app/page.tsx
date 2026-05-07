import Image from "next/image";

import ImageStack from "./components/ImageStack";

import Header from "./components/layout/header";
import ShowcaseList from "./components/ShowcaseList";
import GPGPUFlowParticles from "./components/canvas/GPGPUFlowParticles";

export default function Home() {
    return (
        <>
            <GPGPUFlowParticles count={8192} />

            <div className="w-full h-[640px] flex items-end">
                <div className="flex gap-5 mb-48 ml-8 items-center">
                    <div className="bg-black w-[64px] h-[64px]"></div>
                    <div className="bg-black w-[64px] h-[64px]"></div>
                    <div className="ml-8">
                        <Image
                            src={"/images/icon.png"}
                            width={320}
                            height={160}
                            alt="icon"
                        />
                    </div>
                </div>
            </div>

            <Header />

            <div className="w-full mx-auto p-0">
                <ShowcaseList type={"all-works"} />
                
            </div>
        </>
    );
}
