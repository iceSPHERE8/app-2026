"use client";

import { useState } from "react";

import WaterfallGallery from "./components/waterfall-gallery/WaterfallGallery";
import HeroComponent from "./layout/HeroComponent";
import FeatureSection from "./layout/FeatureSection";
import LandingComponent from "./components/LandingComponent";
import FooterLayout from "./layout/FooterSections";

export default function Home() {
    const [viewType, setViewType] = useState<"all-works" | "tool-lab">(
        "all-works",
    );

    return (
        <div className="">
            <LandingComponent />
            <HeroComponent />
            <FeatureSection />
            <WaterfallGallery />
            <FooterLayout />
            
            
        </div>
    );
}
