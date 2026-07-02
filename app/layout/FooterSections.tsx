"use client";

import { ProfessionalSpecialties } from "../components/ProfessionalSpecialties";
import { ContactArea } from "../components/ContactArea";

export default function FooterLayout() {
    return (
        <footer className="w-full flex flex-col mt-auto">
            <ProfessionalSpecialties />
            <ContactArea />
        </footer>
    );
}