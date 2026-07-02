import SectionIcon1 from "../components/icons/SectionIcon_1";
import SectionIcon2 from "../components/icons/SectionIcon_2";
import SectionIcon3 from "../components/icons/SectionIcon_3";

export interface FeatureSectionProps {
    className?: string;
}

export default function FeatureSection({
    className = "",
}: FeatureSectionProps) {
    return (
        <section
            className={`w-full py-16 md:py-64 flex justify-center bg-[#eaeaea] text-black ${className}`}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-32 max-w-7xl w-full">
                {/* Block 1 */}

                <div className="flex flex-col items-start w-full mx-auto max-w-[320px]">
                    <div className="h-20 mb-6 flex items-end">
                        <SectionIcon1 className="w-auto h-16 object-contain" />
                    </div>

                    <p className="font-light text-sm leading-none tracking-wide">
                        Autonomous Motion. Engineering GLSL shaders and GPGPU
                        simulations via Houdini. We craft procedural systems
                        where algorithmic logic creates relentless, evolving
                        digital patterns.
                    </p>
                </div>

                {/* Block 2 */}

                <div className="flex flex-col items-start w-full mx-auto max-w-[320px]">
                    <div className="h-20 mb-6 flex items-end">
                        <SectionIcon2 className="w-auto h-16 object-contain" />
                    </div>

                    <p className="font-light text-sm leading-none tracking-wide">
                        Cinematic Impact. High-fidelity 3D motion rendered in
                        Redshift. Focused on physics-based animation and sharp
                        digital aesthetics that command the visual landscape.
                    </p>
                </div>

                {/* Block 3 */}

                <div className="flex flex-col items-start w-full mx-auto max-w-[320px]">
                    <div className="h-20 mb-6 flex items-end">
                        <SectionIcon3 className="w-auto h-16 object-contain" />
                    </div>

                    <p className="font-light text-sm leading-none tracking-wide">
                        Creative Coding. Building immersive Three.js experiences
                        with React and TypeScript. We bridge technical art and
                        full-stack performance to infect the web.
                    </p>
                </div>
            </div>
        </section>
    );
}
