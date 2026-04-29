// app/p5/page.tsx
"use client";

import Image from "next/image";
import { useEffect, useRef, useCallback } from "react";

interface WordItem {
    text: string;
    lastReplaceTime: number;
    highlightColor: string;
}

const highlightColors = [
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#f43f5e", // rose
    "#14b8a6", // teal
    "#eab308", // yellow
    "#f97316", // orange
] as const;

const wordPool = [
    { en: "Pixel", zh: "像素" },
    { en: "Algorithm", zh: "算法" },
    { en: "Render", zh: "渲染" },
    { en: "Shader", zh: "着色器" },
    { en: "Typography", zh: "排版" },
    { en: "Animation", zh: "动画" },
    { en: "Interaction", zh: "交互" },
    { en: "Visualization", zh: "可视化" },
    { en: "Neural", zh: "神经网络" },
    { en: "Dataflow", zh: "数据流" },
    { en: "Canvas", zh: "画布" },
    { en: "WebGL", zh: "WebGL" },
    { en: "SVG", zh: "SVG" },
    { en: "CSS", zh: "CSS" },
    { en: "JavaScript", zh: "JavaScript" },
    { en: "React", zh: "React" },
    { en: "Next.js", zh: "Next.js" },
    { en: "Tailwind", zh: "Tailwind" },
    { en: "Figma", zh: "Figma" },
    { en: "Blender", zh: "Blender" },
    { en: "Unity", zh: "Unity" },
    { en: "AR", zh: "AR" },
    { en: "VR", zh: "VR" },
    { en: "AI", zh: "AI" },
    { en: "Generative", zh: "生成式" },
    { en: "Procedural", zh: "程序化" },
    { en: "Fractal", zh: "分形" },
    { en: "Glitch", zh: "故障艺术" },
    { en: "UI", zh: "用户界面" },
    { en: "UX", zh: "用户体验" },
    { en: "Machine Learning", zh: "机器学习" },
] as const;

const baseText = `The waning moon cast just enough light through the leafless branches to make the forest glow with eerie silver. Frost traced the outline of the dying ferns as Squirrelpaw padded through the trees beside Brambleclaw. It’ll be cold at Fourtrees she fretted hoping that her sister was warm wherever she was. But at least it’s clear Brambleclaw answered in a low voice Silverpelt will be shining. They were following Firestar and Cinderpelt through the forest. The pace was slower than usual but Cinderpelt was struggling to keep up. If there is a sign Squirrelpaw wondered how long do you think it’ll be before we go. We can’t leave the forest we’ll all die but we’ll die if we stay this is our home. What if Dustpelt is right Squirrelpaw hissed to Brambleclaw as they leaped over an abandoned foxhole a yawning black mouth amid the shadows.
The waning moon cast just enough light through the leafless branches to make the forest glow with eerie silver. Frost traced the outline of the dying ferns as Squirrelpaw padded through the trees beside Brambleclaw. It’ll be cold at Fourtrees she fretted hoping that her sister was warm wherever she was. But at least it’s clear Brambleclaw answered in a low voice Silverpelt will be shining. They were following Firestar and Cinderpelt through the forest. The pace was slower than usual but Cinderpelt was struggling to keep up. If there is a sign Squirrelpaw wondered how long do you think it’ll be before we go. We can’t leave the forest we’ll all die but we’ll die if we stay this is our home. What if Dustpelt is right Squirrelpaw hissed to Brambleclaw as they leaped over an abandoned foxhole a yawning black mouth amid the shadows.`
    .trim()
    .split(/\s+/);

export default function TextFlow() {
    const containerRef = useRef<HTMLDivElement>(null);
    const wordsRef = useRef<WordItem[]>([]);
    const lastUpdateRef = useRef<number>(Date.now());

    const initializeWords = useCallback(() => {
        wordsRef.current = baseText.map((text) => ({
            text,
            lastReplaceTime: 0,
            highlightColor: highlightColors[0], // 默认颜色
        }));
    }, []);

    const renderWords = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        container.innerHTML = "";

        wordsRef.current.forEach((word, index) => {
            const span = document.createElement("span");
            span.className = `
                word-item inline-block
                transition-all duration-300 hover:scale-105
            `;
            span.textContent = word.text + " ";
            span.dataset.index = index.toString();
            container.appendChild(span);
        });
    }, []);

    const updateWords = useCallback(() => {
        const now = Date.now();
        
        if (now - lastUpdateRef.current < 420) return;   // 控制速度（可继续微调）
        lastUpdateRef.current = now;

        wordsRef.current.forEach((word, index) => {
            if (Math.random() > 0.93) {
                const pair = wordPool[Math.floor(Math.random() * wordPool.length)];
                word.text = Math.random() > 0.5 ? pair.en : pair.zh;
                word.lastReplaceTime = now;
                
                // 随机挑选高亮颜色
                word.highlightColor = highlightColors[
                    Math.floor(Math.random() * highlightColors.length)
                ];
            }

            const span = containerRef.current?.querySelector(`span[data-index="${index}"]`) as HTMLSpanElement;
            if (span) {
                span.textContent = word.text + " ";

                const timeSince = now - word.lastReplaceTime;
                if (timeSince < 1400) {
                    span.style.backgroundColor = `rgba(from ${word.highlightColor} r g b / 1)`;
                    span.style.color = timeSince < 500 ? "#0f172a" : "";
                } else {
                    span.style.backgroundColor = "";
                    span.style.color = "";
                }
            }
        });
    }, []);

    useEffect(() => {
        initializeWords();
        renderWords();

        const loop = () => {
            updateWords();
            requestAnimationFrame(loop);
        };

        const rafId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafId);
    }, [initializeWords, renderWords, updateWords]);

    return (
        <div className="pt-36 pb-2 flex items-center justify-center w-full">
            {/* 固定高度容器，防止影响下方布局 */}
            <div className="h-[120px] w-[1280px] mx-auto overflow-hidden">
                <div
                    ref={containerRef}
                    className="max-w-full text-[8.5px] leading-3 tracking-[0.4px] font-light text-neutral-800 h-full"
                    style={{ fontFamily: '"Cascadia Mono", ui-monospace, monospace' }}
                />
            </div>
        </div>
    );
}