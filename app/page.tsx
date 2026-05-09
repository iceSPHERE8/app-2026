import Image from "next/image";

import ImageStack from "./components/ImageStack";

import Header from "./components/layout/header";
import ShowcaseList from "./components/ShowcaseList";
import GPGPUFlowParticles from "./components/canvas/GPGPUFlowParticles";

export default function Home() {
    return (
        <>
            <GPGPUFlowParticles count={8192} />

            <div className="w-full h-[640px] pt-120 flex items-start justify-between bg-amber-100">
                <div className="flex gap-5 mb-48 ml-8 items-center w-6/10">
                    <div className="ml-8">
                        <Image
                            src={"/images/logo-icon.png"}
                            width={240}
                            height={160}
                            alt="badbug.studio"
                        />
                    </div>
                    <div>
                        <Image
                            src={"/images/logo-text.png"}
                            width={640}
                            height={160}
                            alt="badbug.studio"
                        />
                        <section
                            aria-label="About Badbug"
                            className="w-160 mt-4"
                        >
                            <p className="text-[6px] leading-none">
                                In the modern web ecosystem, Badbug functions as
                                a precision-engineered anomaly, bridging 3D
                                motion design and procedural generative art. We
                                leverage Three.js, React Three Fiber, and GLSL
                                shaders to push the limits of interactive
                                visuals, blending organic chaos with
                                mathematical rigor through GPGPU simulations and
                                physics-based animation. From the node-based
                                complexity of Houdini and Redshift to the
                                seamless integration of TypeScript and Next.js,
                                every project is a study in technical art. We
                                don't just render images; we architect digital
                                behaviors. Whether exploring 16-bit pixel art or
                                real-time creative coding, our work thrives in
                                the microscopic details—a visual infestation
                                engineering the sting of the digital media
                                designer's new frontier.
                            </p>
                        </section>
                    </div>
                </div>

                <div className="w-3/10 flex justify-between">
                    <div>
                        <Image
                            src={"/images/homepage-icon-1.png"}
                            width={120}
                            height={160}
                            alt="badbug.studio"
                        />
                        <section
                            aria-label="About Badbug"
                            className="w-30 mt-4"
                        >
                            <p className="text-[6px] leading-none">
                                Autonomous Motion. Engineering GLSL shaders and
                                GPGPU simulations via Houdini. We craft
                                procedural systems where algorithmic logic
                                creates relentless, evolving digital patterns.
                            </p>
                        </section>
                    </div>
                    <div>
                        <Image
                            src={"/images/homepage-icon-2.png"}
                            width={120}
                            height={160}
                            alt="badbug.studio"
                        />
                        <section
                            aria-label="About Badbug"
                            className="w-30 mt-4"
                        >
                            <p className="text-[6px] leading-none">
                                Cinematic Impact. High-fidelity 3D motion
                                rendered in Redshift. Focused on physics-based
                                animation and sharp digital aesthetics that
                                command the visual landscape.
                            </p>
                        </section>
                    </div>
                    <div>
                        <Image
                            src={"/images/homepage-icon-3.png"}
                            width={120}
                            height={160}
                            alt="badbug.studio"
                        />
                        <section
                            aria-label="About Badbug"
                            className="w-30 mt-4"
                        >
                            <p className="text-[6px] leading-none">
                                Creative Coding. Building immersive Three.js
                                experiences with React and TypeScript. We bridge
                                technical art and full-stack performance to
                                infect the web.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
            <h1 className="font-heading">
                From motion that stings to visuals that linger like venom — we
                create work that doesn’t ask for attention.
            </h1>
            <Header />

            <div className="w-full mx-auto p-0">
                <ShowcaseList type={"all-works"} />
            </div>
        </>
    );
}
