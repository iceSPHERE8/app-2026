import Image from "next/image";

import ImageStack from "./components/ImageStack";
import P5Page from "./components/canvas/page";

import Header from "./components/layout/header";
import ShowcaseList from "./components/ShowcaseList";
import GPGPUFlowParticles from "./components/canvas/GPGPUFlowParticles";

export default function Home() {
    const particleImages = [
        "/images/display/2b70f6c9c5767d65ac14f9529ca56e7f.jpg",
        "/images/display/34e8d07c5b57c0eb3d79de2e50f73467.jpg",
        "/images/display/ae6c3bb5ef0e46d9313b2cce91f7916f.jpg",
        "/images/display/2b70f6c9c5767d65ac14f9529ca56e7f.jpg",
        "/images/display/2b70f6c9c5767d65ac14f9529ca56e7f.jpg",
    ];

    return (
        <>
            <GPGPUFlowParticles count={5000} imageFolder="/images/display/" />
            {/* p5 背景层 - 全屏覆盖 */}
            {/* <div className="mb-0 inset-0 z-10">
                <P5Page />
            </div> */}

            {/* 视频层 - 在 p5 上面，但文字/图片下面 */}
            {/* <div className="inset-0 z-0 flex justify-center">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-7xl h-96 object-cover"
                    src="/video.mp4" // public/video.mp4 对应路径
                />
            </div> */}

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
                <ShowcaseList />
                <div>
                    <p>
                        The waning1 moon cast just enoughlight through the
                        leafless branches to make the forest glow with eerie2
                        silver. Frost traced the outline of the dying ferns as
                        Squirrelpaw padded through the trees beside Brambleclaw.
                        “It’ll be cold at Fourtrees,” she fretted3, hoping that
                        her sister was warm, wherever she was. “But at least
                        it’s clear,” Brambleclaw answered in a low voice.
                        “Silverpelt will be shining.” They were following
                        Firestar and Cinderpelt through the forest. The pace was
                        slower than the two younger cats had been used to on
                        their long journey, but Cinderpelt was still struggling
                        to keep up. Cold and hunger had made her limp worse than
                        usual. “If there is a sign,” Squirrelpaw wondered out
                        loud, “how long do you think it’ll be before we go?” She
                        wanted a chance to find her sister before the Clans6
                        left the forest. “I don’t know,” Brambleclaw replied.
                        “You saw what happened last night. Firestar can’t force
                        the Clan5 to leave. He’s bound by the warrior7 code as
                        much as any cat, and even though he’s our leader, he has
                        to obey the will of the Clan.” Squirrelpaw’s belly8
                        tightened9 as she remembered the Clan’s reaction.
                        Beneath the stars, huddled10 against the icy wind that
                        whipped the rock, Firestar had told them the message she
                        and Brambleclaw had brought back from StarClan.
                    </p>
                </div>
            </div>

            {/* <ImageStack /> */}
        </>
    );
}
