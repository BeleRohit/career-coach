"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

export function HeroBackground3D() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const targetRef = useRef({ x: 0, y: 0 });
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const frameRef = useRef<number>(0);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        targetRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
        targetRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Respect reduced motion
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        // ─── Scene setup ───
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // ─── Layers of depth ───

        // Layer 1: Far grid plane
        const gridGeo = new THREE.PlaneGeometry(30, 30, 30, 30);
        const gridMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, wireframe: true, transparent: true, opacity: 0.12 });
        const grid = new THREE.Mesh(gridGeo, gridMat);
        grid.rotation.x = -Math.PI / 2.5;
        grid.position.y = -2.5;
        grid.position.z = -8;
        scene.add(grid);

        // Layer 2: Floating orbs (various depths)
        const orbs: THREE.Mesh[] = [];
        const orbConfigs = [
            { pos: [-3, 1.5, -4], size: 0.3, color: 0x818cf8, opacity: 0.25 },
            { pos: [3.5, -0.5, -5], size: 0.45, color: 0xa78bfa, opacity: 0.18 },
            { pos: [-1.5, -1.8, -3], size: 0.2, color: 0xc084fc, opacity: 0.35 },
            { pos: [2, 2, -6], size: 0.6, color: 0x6366f1, opacity: 0.15 },
            { pos: [-4, 0, -7], size: 0.5, color: 0x818cf8, opacity: 0.12 },
            { pos: [1, -2.5, -3.5], size: 0.15, color: 0xe879f9, opacity: 0.3 },
        ];

        orbConfigs.forEach(({ pos, size, color, opacity }) => {
            const geo = new THREE.SphereGeometry(size, 16, 16);
            const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
            const orb = new THREE.Mesh(geo, mat);
            orb.position.set(pos[0], pos[1], pos[2]);
            scene.add(orb);
            orbs.push(orb);
        });

        // Layer 3: Geometric shapes at various depths
        const shapes: THREE.Mesh[] = [];
        const shapeConfigs = [
            { type: "oct", pos: [4, 1, -5], size: 0.25, color: 0x818cf8, opacity: 0.2 },
            { type: "oct", pos: [-3, -1.5, -4], size: 0.18, color: 0xa78bfa, opacity: 0.25 },
            { type: "torus", pos: [2, -2, -6], size: 0.3, color: 0x6366f1, opacity: 0.15 },
            { type: "oct", pos: [-2, 2.5, -7], size: 0.35, color: 0xc084fc, opacity: 0.12 },
            { type: "torus", pos: [-4.5, 1, -5.5], size: 0.2, color: 0x818cf8, opacity: 0.18 },
        ];

        shapeConfigs.forEach(({ type, pos, size, color, opacity }) => {
            const geo = type === "oct"
                ? new THREE.OctahedronGeometry(size)
                : new THREE.TorusGeometry(size, size * 0.3, 8, 24);
            const mat = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity });
            const shape = new THREE.Mesh(geo, mat);
            shape.position.set(pos[0], pos[1], pos[2]);
            scene.add(shape);
            shapes.push(shape);
        });

        // Layer 4: Particle field (distant)
        const particleCount = 120;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
            positions[i * 3 + 2] = -Math.random() * 15 - 2;
        }
        particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        const particleMat = new THREE.PointsMaterial({ color: 0x818cf8, size: 0.03, transparent: true, opacity: 0.5 });
        const particles = new THREE.Points(particleGeo, particleMat);
        scene.add(particles);

        // ─── Gyroscope for mobile ───
        let hasGyro = false;
        const gyroHandler = (e: DeviceOrientationEvent) => {
            if (e.gamma !== null && e.beta !== null) {
                hasGyro = true;
                targetRef.current.x = (e.gamma / 45);
                targetRef.current.y = (e.beta / 45 - 1);
            }
        };
        window.addEventListener("deviceorientation", gyroHandler);

        // ─── Mouse ───
        window.addEventListener("mousemove", handleMouseMove);

        // ─── Ambient drift for no-input ───
        let ambientTime = 0;

        // ─── Animate ───
        const animate = () => {
            frameRef.current = requestAnimationFrame(animate);
            ambientTime += 0.003;

            // Lerp mouse
            const lerpFactor = 0.05;
            mouseRef.current.x += (targetRef.current.x - mouseRef.current.x) * lerpFactor;
            mouseRef.current.y += (targetRef.current.y - mouseRef.current.y) * lerpFactor;

            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;

            if (prefersReducedMotion) {
                renderer.render(scene, camera);
                return;
            }

            // Ambient fallback when no mouse/gyro
            const ambientX = hasGyro || Math.abs(targetRef.current.x) > 0.01 ? 0 : Math.sin(ambientTime) * 0.15;
            const ambientY = hasGyro || Math.abs(targetRef.current.y) > 0.01 ? 0 : Math.cos(ambientTime * 0.7) * 0.1;
            const fx = mx + ambientX;
            const fy = my + ambientY;

            // Camera slight shift (parallax base)
            camera.position.x = fx * 0.3;
            camera.position.y = -fy * 0.2;
            camera.lookAt(0, 0, -2);

            // Grid parallax (slow, far)
            grid.position.x = -fx * 0.15;
            grid.position.y = -2.5 + fy * 0.1;

            // Orbs parallax (medium speed)
            orbs.forEach((orb, i) => {
                const depth = 0.1 + (i * 0.06);
                orb.position.x = orbConfigs[i].pos[0] - fx * depth;
                orb.position.y = orbConfigs[i].pos[1] + fy * depth;
                orb.scale.setScalar(1 + Math.sin(ambientTime * (0.8 + i * 0.2)) * 0.08);
            });

            // Shapes parallax + rotation (fast, close)
            shapes.forEach((shape, i) => {
                const depth = 0.15 + (i * 0.05);
                shape.position.x = shapeConfigs[i].pos[0] - fx * depth;
                shape.position.y = shapeConfigs[i].pos[1] + fy * depth;
                shape.rotation.x += 0.003 + i * 0.001;
                shape.rotation.y += 0.004 + i * 0.001;
            });

            // Particles (very slow)
            particles.position.x = -fx * 0.08;
            particles.position.y = fy * 0.06;
            particles.rotation.y = ambientTime * 0.05;

            renderer.render(scene, camera);
        };

        animate();

        // ─── Resize ───
        const handleResize = () => {
            if (!container) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        };
        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(frameRef.current);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("deviceorientation", gyroHandler);
            window.removeEventListener("resize", handleResize);
            renderer.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, [handleMouseMove]);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-0 overflow-hidden"
            style={{ maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)" }}
            aria-hidden="true"
        />
    );
}
