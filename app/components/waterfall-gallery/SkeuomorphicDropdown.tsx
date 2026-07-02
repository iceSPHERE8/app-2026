// SkeuomorphicDropdown.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

export const SkeuomorphicDropdown = ({
    label,
    options,
    value,
    onChange,
}: {
    label: string;
    options: string[];
    value: string;
    onChange: (val: string) => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            )
                setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative flex flex-col items-start" ref={dropdownRef}>
            <span className="text-[#000000] font-heading text-[10px] pl-0.5 tracking-widest">
                {label}
            </span>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`relative flex items-center justify-between min-w-30 px-2 py-1 rounded-full border border-[#a1a1a1] text-[11px] leading-none font-table font-black uppercase transition-all ease-in-out duration-150 cursor-pointer ${
                        isOpen
                            ? "translate-y-px bg-linear-to-b from-[#c4c4c4] via-[#d4d4d4] to-[#e6e6e6] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.3),0_0px_0px_rgba(0,0,0,0)] text-[#333333]"
                            : "bg-linear-to-b from-[#ffffff] via-[#e6e6e6] to-[#ababab] text-[#4a4a4a] [text-shadow:0_1px_0_rgba(255,255,255,0.8)] shadow-[inset_0_1px_0_rgba(255,255,255,1),0_1.5px_3px_rgba(0,0,0,0.3)] hover:from-[#ffffff] hover:via-[#f0f0f0] hover:to-[#e0e0e0] hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_2px_4px_rgba(0,0,0,0.4)]"
                    }`}
                >
                    <span>{value}</span>
                    <ChevronDown
                        className={`w-3 h-3 ml-2 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
                    />
                </button>
                {isOpen && (
                    <div className="absolute top-full left-0 mt-1.5 w-full min-w-30 z-50 bg-linear-to-b from-[#f5f5f5] to-[#d4d4d4] border border-[#a1a1a1] rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.9)] overflow-hidden p-1 flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                        {options.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => {
                                    onChange(opt);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-2 py-1.5 rounded-[3px] text-[10px] font-table font-black uppercase transition-all duration-150 ${
                                    value === opt
                                        ? "bg-[#c4c4c4] text-[#333333] shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"
                                        : "text-[#5a5a5a] hover:bg-white/60 hover:text-[#222222]"
                                }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};