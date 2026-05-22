/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Operator, Weapon } from '../types';
import { createProceduralOperator, createProceduralWeapon } from '../utils/threeHelpers';

interface Lobby3DViewProps {
  operator: Operator;
  weapon: Weapon;
}

export const Lobby3DView: React.FC<Lobby3DViewProps> = ({ operator, weapon }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const operatorRef = useRef<THREE.Group | null>(null);
  const weaponRef = useRef<THREE.Group | null>(null);

  // Drag interaction state
  const isDragging = useRef(false);
  const previousMouseX = useRef(0);
  const targetRotationY = useRef(0);
  const currentRotationY = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // SCENE & CAMERA
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0A0C0E'); // Clean military charcoal backdrop
    scene.fog = new THREE.FogExp2('#0A0C0E', 0.15);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 3.8); // Framed nicely for full character view
    camera.lookAt(0, 1.0, 0);

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(renderer.domElement);

    // PEDESTAL (Base plate for character)
    const pedestalGroup = new THREE.Group();
    const plateGeo = new THREE.CylinderGeometry(1.2, 1.3, 0.15, 32);
    const plateMat = new THREE.MeshStandardMaterial({
      color: '#12161A',
      roughness: 0.3,
      metalness: 0.8
    });
    const plateMesh = new THREE.Mesh(plateGeo, plateMat);
    plateMesh.receiveShadow = true;
    plateMesh.position.y = 0.075;
    pedestalGroup.add(plateMesh);

    // Glowing cyan base light ring
    const ringGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.04, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: '#52e3ff' });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = 0.16;
    pedestalGroup.add(ringMesh);

    scene.add(pedestalGroup);

    // OPERATOR MODEL
    const opGroup = createProceduralOperator(operator);
    operatorRef.current = opGroup;
    scene.add(opGroup);

    // WEAPON MODEL (Attached to Right Arm Hand position)
    const wpGroup = createProceduralWeapon(weapon);
    // Position weapon nicely in hands!
    wpGroup.scale.set(1.4, 1.4, 1.4);
    wpGroup.position.set(0.18, 0.05, 0.28);
    wpGroup.rotation.set(0.2, -0.15, -0.1);
    
    // Find right arm hand to attach target
    const rightArm = opGroup.getObjectByName('RightArmPivot');
    if (rightArm) {
      rightArm.add(wpGroup);
      weaponRef.current = wpGroup;
    }

    // AMBIENT PARTICLES (Hangar sparks)
    const pCount = 45;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(pCount * 3);
    const pSpeeds: number[] = [];

    for (let i = 0; i < pCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * 6;
      pPositions[i * 3 + 1] = Math.random() * 3.5;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      pSpeeds.push(0.003 + Math.random() * 0.008);
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: '#00f7ff',
      size: 0.035,
      transparent: true,
      opacity: 0.5
    });
    const pParticles = new THREE.Points(pGeo, pMat);
    scene.add(pParticles);

    // LIGHTING SYSTEM
    const ambientLight = new THREE.AmbientLight('#12151D', 1.2);
    scene.add(ambientLight);

    // Key spotlight reflecting operator
    const mainSpot = new THREE.SpotLight('#ffffff', 15);
    mainSpot.position.set(2, 4.5, 3);
    mainSpot.angle = Math.PI / 6;
    mainSpot.penumbra = 0.7;
    mainSpot.castShadow = true;
    mainSpot.shadow.bias = -0.001;
    mainSpot.shadow.mapSize.width = 1024;
    mainSpot.shadow.mapSize.height = 1024;
    scene.add(mainSpot);

    // Back rim neon light (cyan blueprint)
    const blueRimLight = new THREE.DirectionalLight('#00a6ff', 3.0);
    blueRimLight.position.set(-2.5, 1.5, -2);
    scene.add(blueRimLight);

    // Warm key fill
    const orangeRimLight = new THREE.DirectionalLight('#ff8800', 1.2);
    orangeRimLight.position.set(2.5, 0.8, -1.5);
    scene.add(orangeRimLight);

    // INTERACTION MOUSE DRAG EVENT LISTENERS
    const handleStart = (clientX: number) => {
      isDragging.current = true;
      previousMouseX.current = clientX;
    };

    const handleMove = (clientX: number) => {
      if (!isDragging.current) return;
      const deltaX = clientX - previousMouseX.current;
      targetRotationY.current += deltaX * 0.012;
      previousMouseX.current = clientX;
    };

    const handleEnd = () => {
      isDragging.current = false;
    };

    const onMouseDown = (e: MouseEvent) => handleStart(e.clientX);
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onMouseUp = () => handleEnd();

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) handleStart(e.touches[0].clientX);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) handleMove(e.touches[0].clientX);
    };
    const onTouchEnd = () => handleEnd();

    const el = containerRef.current;
    if (el) {
      el.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      el.addEventListener('touchstart', onTouchStart, { passive: true });
      el.addEventListener('touchmove', onTouchMove, { passive: true });
      el.addEventListener('touchend', onTouchEnd);
    }

    // ANIMATION LOOP
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const elapsed = clock.getElapsedTime();

      // Breathing idle motion
      const breathing = Math.sin(elapsed * 1.8) * 0.018;
      
      // Update operator neck, chest, and shoulder poses for animated idle feel
      if (opGroup) {
        // Slow float pedestal rotation
        plateMesh.rotation.y = elapsed * 0.08;

        const torso = opGroup.getObjectByName('TorsoGroup');
        if (torso) {
          torso.position.y = breathing; // micro heave
        }

        const head = opGroup.getObjectByName('HeadGroup');
        if (head) {
          head.rotation.y = Math.sin(elapsed * 0.6) * 0.06;
          head.rotation.x = Math.sin(elapsed * 0.9) * 0.03;
        }

        const leftArm = opGroup.getObjectByName('LeftArmPivot');
        if (leftArm) {
          leftArm.rotation.z = Math.sin(elapsed * 1.8) * 0.02 - 0.1;
        }
        
        const rightArm = opGroup.getObjectByName('RightArmPivot');
        if (rightArm) {
          rightArm.rotation.z = -Math.sin(elapsed * 1.8) * 0.02 + 0.1;
        }
      }

      // Drag Inertia interpolation
      currentRotationY.current += (targetRotationY.current - currentRotationY.current) * 0.1;
      if (opGroup) {
        opGroup.rotation.y = currentRotationY.current;
      }

      // Slowly rise dust particles
      const positions = pParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < pCount; i++) {
        positions[i * 3 + 1] += pSpeeds[i];
        if (positions[i * 3 + 1] > 3.5) {
          positions[i * 3 + 1] = 0;
        }
      }
      pParticles.geometry.attributes.position.needsUpdate = true;

      // Gentle cinematic camera drift
      camera.position.x = Math.sin(elapsed * 0.3) * 0.15;
      camera.position.y = 1.4 + Math.cos(elapsed * 0.45) * 0.07;
      camera.lookAt(0, 1.05, 0);

      renderer.render(scene, camera);
    };

    animate();

    // WINDOW RESIZE MONITOR
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (el) {
        el.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        el.removeEventListener('touchstart', onTouchStart);
        el.removeEventListener('touchmove', onTouchMove);
        el.removeEventListener('touchend', onTouchEnd);
      }
    };
  }, [operator, weapon]);

  return (
    <div className="absolute inset-0 z-0 select-none overflow-hidden pb-4">
      {/* Three canvas mount */}
      <div id="lobby-3d-canvas" ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      
      {/* Dark vignette border framing */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_30%,rgba(0,0,0,0.85)_100%)]" />
    </div>
  );
};
