"use client";

import dynamic from "next/dynamic";

const HeroBackground3D = dynamic(
    () => import("@/components/HeroBackground3D").then(m => ({ default: m.HeroBackground3D })),
    { ssr: false }
);

export function HeroBackground3DWrapper() {
    return <HeroBackground3D />;
}
