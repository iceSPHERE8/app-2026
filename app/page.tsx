"use client";

import { useState } from "react";

import Header from "./components/layout/header";
import WaterfallGallery from "./components/WaterfallGallery";
import HeroComponent from "./components/layout/HeroComponent";
import FeatureSection from "./components/layout/FeatureSection";
import LandingComponent from "./components/LandingComponent";

import CustomIcon from "./components/icons/CustomIcon";

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
            
            
            
        </div>
    );
}
