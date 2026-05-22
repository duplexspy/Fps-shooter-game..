/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Weapon, Operator, GameMap, GameMode, GameSettings } from '../types';
import { createProceduralWeapon, createMapEnvironment } from '../utils/threeHelpers';
import { audio } from './AudioController';
import { Play, Pause, RotateCcw, Volume2, Shield, Crosshair, Sparkles, Navigation, Flame, RefreshCw, Zap } from 'lucide-react';

interface Gameplay3DViewProps {
  operator: Operator;
  weapon: Weapon;
  selectedMap: GameMap;
  selectedMode: GameMode;
  settings: GameSettings;
  onExitGame: (matchKills: number, matchXP: number, earnedGold: number) => void;
}

export const Gameplay3DView: React.FC<Gameplay3DViewProps> = ({
  operator,
  weapon,
  selectedMap,
  selectedMode,
  settings,
  onExitGame
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // HUD Elements State
  const [ammo, setAmmo] = useState(weapon.magazineSize);
  const [maxReserve, setMaxReserve] = useState(120);
  const [isReloading, setIsReloading] = useState(false);
  const [isAds, setIsAds] = useState(false);
  const [kills, setKills] = useState(0);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes
  const [showHitmarker, setShowHitmarker] = useState(false);
  const [damageIndicators, setDamageIndicators] = useState<string[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  // References to communicate with ThreeJS animate loop safely
  const playerPos = useRef(new THREE.Vector3(0, 1.35, 0)); // Tactical camera height
  const cameraRotation = useRef({ yaw: 0, pitch: 0 });
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  
  // Joystick states
  const leftJoystickActive = useRef(false);
  const leftJoystickStart = useRef({ x: 0, y: 0 });
  const leftJoystickCurrent = useRef({ x: 0, y: 0 });
  
  const rightDragActive = useRef(false);
  const rightDragPrevious = useRef({ x: 0, y: 0 });

  // WebGL nodes references
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const weaponMeshRef = useRef<THREE.Group | null>(null);
  const targetRigsRef = useRef<THREE.Group[]>([]);
  
  // Recoil/Vibe refs
  const recoilOffset = useRef({ y: 0, scale: 0 });
  const headBob = useRef(0);
  const velocity = useRef(new THREE.Vector3());

  // Trigger weapon shoot
  const fireWeapon = () => {
    if (isPaused || isReloading) return;
    if (ammo <= 0) {
      audio.playReload(); // Dry fire click simulation
      handleReload();
      return;
    }

    // Deduct bullet
    setAmmo(prev => prev - 1);

    // Play synthesized weapon discharge sound
    const isSilenced = weapon.attachments.muzzle === 'att_muzzle_suppressor';
    const isSniper = weapon.category === 'Sniper';
    audio.playWeaponShoot(isSilenced, isSniper);

    // Apply recoil impulse to CAMERA pitch / sway (rise up)
    recoilOffset.current.scale = 1.0;
    cameraRotation.current.pitch += (0.01 + Math.random() * 0.015) * (weapon.recoilY / 8.0);
    cameraRotation.current.yaw += (Math.random() - 0.5) * 0.01 * (weapon.recoilX / 5.0);

    // Project bullet raycast to hit targets!
    if (cameraRef.current && sceneRef.current) {
      const raycaster = new THREE.Raycaster();
      // Center of screen vector
      const centerVec = new THREE.Vector2(0, 0); 
      raycaster.setFromCamera(centerVec, cameraRef.current);

      // Create a visual glowing projectile tracer line
      const tracerGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0.12, -0.15, -0.4).applyMatrix4(cameraRef.current.matrixWorld),
        raycaster.ray.direction.clone().multiplyScalar(40).add(playerPos.current)
      ]);
      const tracerMat = new THREE.LineBasicMaterial({
        color: weapon.attachments.laser === 'att_laser_green' ? '#00ff44' : '#ff7700',
        linewidth: 2
      });
      const tracerLine = new THREE.Line(tracerGeo, tracerMat);
      sceneRef.current.add(tracerLine);

      // Fade out tracer quickly from buffer
      setTimeout(() => {
        if (sceneRef.current) sceneRef.current.remove(tracerLine);
      }, 75);

      // Intersect practice targets
      const interactableTargets: THREE.Object3D[] = [];
      targetRigsRef.current.forEach(rig => {
        const plate = rig.getObjectByName('target_plate');
        if (plate) interactableTargets.push(plate);
      });

      const intersects = raycaster.intersectObjects(interactableTargets, true);
      if (intersects.length > 0) {
        // Target is register successfully!
        setShowHitmarker(true);
        audio.playTargetHit();
        setScore(prev => prev + 100);
        setKills(prev => prev + 1);

        // Add fun floating target notification text
        const messages = ["Target Eliminated +100", "Critical Bullseye +10], Double hit!", "Target Slapped +100"];
        setDamageIndicators(prev => [...prev.slice(-3), messages[Math.floor(Math.random() * messages.length)]]);

        // Find which rig was hit and spin it backward physically
        const hitPlate = intersects[0].object;
        let parentRig = hitPlate.parent;
        while (parentRig && !parentRig.name.startsWith('target_rig_')) {
          parentRig = parentRig.parent;
        }

        if (parentRig) {
          const rigGroup = parentRig as THREE.Group;
          // Animate knockdown physically
          const initialZ = rigGroup.rotation.x;
          rigGroup.rotation.x = -Math.PI / 2.5; // push backward

          // Pop back up after a delay in a random horizontal displacement
          setTimeout(() => {
            rigGroup.rotation.x = initialZ;
            rigGroup.position.set(
              (Math.random() - 0.5) * 16,
              0,
              10 + Math.random() * 15
            );
          }, 1500);
        }

        setTimeout(() => setShowHitmarker(false), 120);
      }
    }
  };

  // Perform Reload
  const handleReload = () => {
    if (isReloading || ammo === weapon.magazineSize || maxReserve <= 0) return;
    setIsReloading(true);
    setIsAds(false);
    audio.playReload();

    setTimeout(() => {
      const needed = weapon.magazineSize - ammo;
      const transfer = Math.min(needed, maxReserve);
      setAmmo(prev => prev + transfer);
      setMaxReserve(prev => prev - transfer);
      setIsReloading(false);
    }, weapon.reloadTime * 1000);
  };

  // Setup Keyboard hooks and Game loops
  useEffect(() => {
    // Keyboard inputs
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressed.current[k] = true;

      if (e.key === ' ') { // Jump
        if (playerPos.current.y <= 1.36) {
          velocity.current.y = 4.2; // jump upward speed
        }
      }
      if (k === 'r') handleReload();
      if (k === 'c') {
        // Crouch toggle height simulation
        playerPos.current.y = playerPos.current.y > 0.8 ? 0.75 : 1.35;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [ammo, maxReserve, isReloading]);

  // Round game timer tick
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishMatch();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleFinishMatch = () => {
    const earnedGold = kills * 15 + score / 10;
    const earnedXP = score * 0.4 + kills * 5;
    onExitGame(kills, earnedXP, Math.round(earnedGold));
  };

  // Core WebGL Renderer and Game Physics updates
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // SCENE & CAMERA
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Apply color theme dynamically on fog/background based on selected map colorTheme
    let bgColor = '#1B1C1D';
    if (selectedMap.colorTheme === 'desert') bgColor = '#DFBBA0';
    else if (selectedMap.colorTheme === 'urban') bgColor = '#24252A';
    else if (selectedMap.colorTheme === 'industrial') bgColor = '#1A1C1D';
    else if (selectedMap.colorTheme === 'forest') bgColor = '#101512';

    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.FogExp2(bgColor, 0.04);

    const camera = new THREE.PerspectiveCamera(settings.gyroEnabled ? 65 : 60, width / height, 0.1, 500);
    cameraRef.current = camera;
    scene.add(camera);

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }
    mountRef.current.appendChild(renderer.domElement);

    // STUCTURE MAP ENVIRONMENT
    const mapEnv = createMapEnvironment(selectedMap.colorTheme);
    scene.add(mapEnv);

    // Extract target rigs to animate hits
    targetRigsRef.current = [];
    mapEnv.children.forEach(child => {
      if (child.name.startsWith('target_rig_')) {
        targetRigsRef.current.push(child as THREE.Group);
      }
    });

    // SOLID FPS WEAPON VIEW MODEL (Attached to Camera)
    const viewGroup = new THREE.Group();
    // Re-procedurally render current selected player weapon
    const weaponModel = createProceduralWeapon(weapon);
    weaponModel.scale.set(0.6, 0.6, 0.6);
    // Align forward facing
    weaponModel.rotation.set(0, Math.PI, 0);
    // Standard Hip-fire offset position relative to screen camera
    weaponModel.position.set(0.18, -0.16, -0.42);

    viewGroup.add(weaponModel);
    camera.add(viewGroup);
    weaponMeshRef.current = weaponModel;

    // LIGHTING
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.0);
    scene.add(ambientLight);

    const sun = new THREE.DirectionalLight('#ffffff', 2.0);
    sun.position.set(20, 45, 10);
    sun.castShadow = true;
    scene.add(sun);

    // Touch dragging logic
    const handleTouchStart = (clientX: number, clientY: number, target: EventTarget | null) => {
      // Check if clicked LEFT half (JOYSTICK) or RIGHT half (AIM LOOK)
      const elBound = mountRef.current?.getBoundingClientRect();
      if (!elBound) return;

      const px = clientX - elBound.left;
      const py = clientY - elBound.top;
      const isLeft = px < elBound.width / 2;

      if (isLeft) {
        leftJoystickActive.current = true;
        leftJoystickStart.current = { x: px, y: py };
        leftJoystickCurrent.current = { x: px, y: py };
      } else {
        rightDragActive.current = true;
        rightDragPrevious.current = { x: clientX, y: clientY };
      }
    };

    const handleTouchMove = (clientX: number, clientY: number) => {
      const elBound = mountRef.current?.getBoundingClientRect();
      if (!elBound) return;

      const px = clientX - elBound.left;
      const py = clientY - elBound.top;

      if (leftJoystickActive.current) {
        leftJoystickCurrent.current = { x: px, y: py };
      } else if (rightDragActive.current) {
        // Multiplier proportional to player ADS screen sensitivity configuration
        const sensMod = isAds ? settings.adsSensitivity : settings.sensitivity;
        const speedMultiplier = 0.0007 * sensMod;

        const dx = clientX - rightDragPrevious.current.x;
        const dy = clientY - rightDragPrevious.current.y;

        cameraRotation.current.yaw -= dx * speedMultiplier;
        cameraRotation.current.pitch -= dy * speedMultiplier;

        // Constraint pitch look boundaries (No full backward flips)
        cameraRotation.current.pitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, cameraRotation.current.pitch));

        rightDragPrevious.current = { x: clientX, y: clientY };
      }
    };

    const handleTouchEnd = () => {
      leftJoystickActive.current = false;
      rightDragActive.current = false;
    };

    // DOM events hooks
    const onMouseDown = (e: MouseEvent) => {
      // Trigger shooting if left clicking inside viewport canvas
      const isRightClick = e.button === 2;
      if (isRightClick) {
        setIsAds(prev => !prev);
        e.preventDefault();
      } else {
        fireWeapon();
        handleTouchStart(e.clientX, e.clientY, e.target);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      handleTouchMove(e.clientX, e.clientY);
    };

    const onMouseUp = () => {
      handleTouchEnd();
    };

    const onTouchStartLocal = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        // Handle multi-touch controls
        for (let i = 0; i < e.touches.length; i++) {
          const touch = e.touches[i];
          handleTouchStart(touch.clientX, touch.clientY, touch.target);
        }
      }
    };

    const onTouchMoveLocal = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        for (let i = 0; i < e.touches.length; i++) {
          const touch = e.touches[i];
          handleTouchMove(touch.clientX, touch.clientY);
        }
      }
    };

    const onTouchEndLocal = () => {
      handleTouchEnd();
    };

    const domEl = mountRef.current;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    domEl.addEventListener('touchstart', onTouchStartLocal, { passive: true });
    domEl.addEventListener('touchmove', onTouchMoveLocal, { passive: true });
    domEl.addEventListener('touchend', onTouchEndLocal);

    // Disable system default context menu inside battlefield canvas
    const ignoreCtx = (e: Event) => e.preventDefault();
    domEl.addEventListener('contextmenu', ignoreCtx);

    let animationId: number;
    const clock = new THREE.Clock();

    // 60FPS Render Physics Game ticks
    const tick = () => {
      animationId = requestAnimationFrame(tick);
      if (isPaused) return;

      const delta = Math.min(0.03, clock.getDelta());
      const elapsed = clock.getElapsedTime();

      // DUAL-JOYSTICK MOVEMENT MATH
      let moveForward = 0;
      let moveSideways = 0;

      // Keyboard Inputs (Check standard key arrays)
      if (keysPressed.current['w'] || keysPressed.current['arrowup']) moveForward = 1;
      if (keysPressed.current['s'] || keysPressed.current['arrowdown']) moveForward = -1;
      if (keysPressed.current['a'] || keysPressed.current['arrowleft']) moveSideways = -1;
      if (keysPressed.current['d'] || keysPressed.current['arrowright']) moveSideways = 1;

      // Apply screen boundary Joysticks
      if (leftJoystickActive.current) {
        const dx = leftJoystickCurrent.current.x - leftJoystickStart.current.x;
        const dy = leftJoystickCurrent.current.y - leftJoystickStart.current.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist > 5) {
          const angle = Math.atan2(dy, dx);
          const intensity = Math.min(1.0, dist / 40);
          
          moveForward = -Math.sin(angle) * intensity;
          moveSideways = Math.cos(angle) * intensity;
        }
      }

      // Smooth Movement Speed vectors (reacting to stats like Mobility, Sprint limits, ADS slow down)
      const isSprinting = keysPressed.current['shift'] && moveForward > 0;
      const baseSpeed = isAds ? 1.5 : isSprinting ? 5.5 : 3.2;
      const mobilityFactor = weapon.mobility / 70.0; // Weapons with higher weight reduce velocity
      const moveSpeed = baseSpeed * mobilityFactor;

      // Project direction forward relative to dynamic yaw camera look-direction
      const forwardDir = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0,1,0), cameraRotation.current.yaw);
      const sideDir = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0,1,0), cameraRotation.current.yaw);

      const targetX = (forwardDir.x * moveForward + sideDir.x * moveSideways) * moveSpeed;
      const targetZ = (forwardDir.z * moveForward + sideDir.z * moveSideways) * moveSpeed;

      // Interpolate horizontal physics velocities
      velocity.current.x += (targetX - velocity.current.x) * 0.15;
      velocity.current.z += (targetZ - velocity.current.z) * 0.15;

      // VERTICAL GRAVITY AND JUMPS
      if (playerPos.current.y > 1.35) {
        velocity.current.y -= 9.8 * delta; // standard fall decay
      } else {
        velocity.current.y = Math.max(0, velocity.current.y);
        // snap neatly to ground baseline
        if (playerPos.current.y < 1.35 && !keysPressed.current['c']) {
          playerPos.current.y = 1.35;
        }
      }

      // Update position coordinates
      playerPos.current.addScaledVector(velocity.current, delta);
      // Bound level walls
      playerPos.current.x = Math.max(-48, Math.min(48, playerPos.current.x));
      playerPos.current.z = Math.max(-48, Math.min(48, playerPos.current.z));

      // SET CAMERA POSITION & STAGGER HEAD-BOBBING
      const isWalking = (Math.abs(velocity.current.x) > 0.1 || Math.abs(velocity.current.z) > 0.1) && playerPos.current.y <= 1.36;
      if (isWalking) {
        const bobFreq = isSprinting ? 12 : 6;
        const bobAmp = isSprinting ? 0.035 : 0.015;
        headBob.current += bobFreq * delta;
        camera.position.y = playerPos.current.y + Math.sin(headBob.current) * bobAmp;
      } else {
        camera.position.y += (playerPos.current.y - camera.position.y) * 0.15;
      }
      camera.position.x = playerPos.current.x;
      camera.position.z = playerPos.current.z;

      // APPLY LOOK ROTATION MATRICES
      const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), cameraRotation.current.yaw);
      const qPitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), cameraRotation.current.pitch);
      camera.quaternion.copy(qYaw).multiply(qPitch);

      // ADS TRANSITIONS - SMOOTH SIGHT ALIGNMENT
      const targetWeaponPos = isAds ? new THREE.Vector3(0, -0.1, -0.32) : new THREE.Vector3(0.18, -0.16, -0.42);
      const targetWeaponRot = isAds ? new THREE.Vector3(0, Math.PI, 0) : new THREE.Vector3(0.1, Math.PI, -0.1);
      
      weaponModel.position.lerp(targetWeaponPos, 0.16);
      weaponModel.rotation.x += (targetWeaponRot.x - weaponModel.rotation.x) * 0.16;
      weaponModel.rotation.z += (targetWeaponRot.z - weaponModel.rotation.z) * 0.16;

      // Adjust camera zoom FOV mapping to ADS status
      const targetFov = isAds ? 38 : 60;
      if (Math.abs(camera.fov - targetFov) > 0.1) {
        camera.fov += (targetFov - camera.fov) * 0.22;
        camera.updateProjectionMatrix();
      }

      // Gun recoil return spring decay
      recoilOffset.current.scale += (0 - recoilOffset.current.scale) * 0.08;
      const recRise = Math.sin(elapsed * 40) * 0.02 * recoilOffset.current.scale;
      weaponModel.position.y += recRise;
      weaponModel.position.z += recoilOffset.current.scale * 0.04;

      renderer.render(scene, camera);
    };

    tick();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (domEl) {
        domEl.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        domEl.removeEventListener('touchstart', onTouchStartLocal);
        domEl.removeEventListener('touchmove', onTouchMoveLocal);
        domEl.removeEventListener('touchend', onTouchEndLocal);
        domEl.removeEventListener('contextmenu', ignoreCtx);
      }
    };
  }, [selectedMap, selectedMode, settings, isPaused]);

  // Render match duration
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-black text-white">
      {/* 3D WebGL FPS Battleground Mount */}
      <div ref={mountRef} className="w-full h-full cursor-crosshair" id="gameplay-viewport" />

      {/* TACTICAL ADS OVERLAY (Sniper Sight/Crosshair Reticle Retainer block) */}
      {isAds && (
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
          {weapon.category === 'Sniper' ? (
            // Full screen sniper black framing overlay with neon green center thread
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              {/* Outer black scope tube boundaries */}
              <div className="w-[100vw] h-[100vh] border-[16vw] border-black/90 rounded-full flex items-center justify-center">
                <div className="w-full h-full border-black border-[12vh] rounded-full flex items-center justify-center relative">
                  
                  {/* Fine Crosshairs Lines */}
                  <div className="absolute w-[60%] h-0.5 bg-[#52ff7d]/60" />
                  <div className="absolute h-[60%] w-0.5 bg-[#52ff7d]/60" />
                  
                  {/* Neon Red/Green glowing tactical microdot center */}
                  <div className="w-1.5 h-1.5 rounded-full bg-[#f93131] z-20 shadow-lg shadow-red-500" />
                  <div className="absolute text-[8px] font-mono text-[#52ff7d]/80 bottom-6 tracking-wide select-none">
                    ECHO-ADS RANGE x8
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Holographic red dot overlay
            <div className="relative pointer-events-none">
              <div className="w-4 h-4 rounded-full border border-red-500/25 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow shadow-red-400" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dynamic Hitmarker flash state indicator */}
      {showHitmarker && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          <div className="relative w-8 h-8 flex items-center justify-center">
            {/* Hit diagonal lines */}
            <div className="absolute w-4 h-[1.5px] bg-[#00ffc4] rotate-45 transform translate-x-3 -translate-y-3" />
            <div className="absolute w-4 h-[1.5px] bg-[#00ffc4] -rotate-45 transform -translate-x-3 -translate-y-3" />
            <div className="absolute w-4 h-[1.5px] bg-[#00ffc4] -rotate-45 transform translate-x-3 translate-y-3" />
            <div className="absolute w-4 h-[1.5px] bg-[#00ffc4] rotate-45 transform -translate-x-3 translate-y-3" />
          </div>
        </div>
      )}

      {/* Floating Damage Floating notifications stack */}
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex flex-col items-center gap-1 font-mono text-xs">
        {damageIndicators.map((msg, idx) => (
          <div key={idx} className="bg-teal-500/80 text-black px-2 py-0.5 rounded animate-bounce text-[10px] uppercase font-extrabold tracking-wider">
            {msg}
          </div>
        ))}
      </div>

      {/* BOTTOM CENTER: MOBILE GAMEPLAY TOUCH VIRTUAL CONTROLS */}
      {/* Dynamic HUD Layout (Adjusted from customized parameters in settings state) */}
      <div className="absolute inset-0 pointer-events-none z-10">
        
        {/* Play/Pause settings button */}
        <div className="absolute top-4 right-4 pointer-events-auto flex items-center gap-2">
          <div className="font-mono text-[9px] text-white/50 bg-black/60 px-2.5 py-1 rounded flex items-center gap-1.5 border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
            SERVER LATENCY: {18 + Math.floor(Math.random() * 8)}ms
          </div>
          <button
            id="pause-game-btn"
            onClick={() => setIsPaused(prev => !prev)}
            className="p-1 px-2 pb-1.5 bg-black/70 border border-white/10 text-white rounded hover:bg-slate-900 flex items-center gap-1.5 text-xs font-mono"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-green-400" /> : <Pause className="w-3.5 h-3.5" />} 
            {isPaused ? 'RESUME' : 'PAUSE'}
          </button>
        </div>

        {/* TOP LEFT SCORE PANEL */}
        <div className="absolute top-4 left-4 bg-black/60 border border-teal-500/20 rounded p-2.5 font-mono">
          <div className="text-[9px] text-[#52e3ff]/80 tracking-widest">{selectedMode.name}</div>
          <div className="text-sm font-semibold mt-0.5">{selectedMap.name}</div>
          <div className="grid grid-cols-2 gap-4 mt-2 border-t border-white/10 pt-1.5 text-center">
            <div>
              <div className="text-[8px] text-gray-400">TARGETS SHOT</div>
              <div className="text-teal-400 text-lg font-bold">{kills}</div>
            </div>
            <div>
              <div className="text-[8px] text-gray-400">SCORE</div>
              <div className="text-lg font-bold">{score}</div>
            </div>
          </div>
          <div className="mt-1 text-center text-[10px] text-yellow-500/90 font-bold bg-yellow-950/20 rounded py-0.5">
            MATCH TIMER: {formatTime(timeRemaining)}
          </div>
        </div>

        {/* BOTTOM LEFT: MOVEMENT STICK MOCK INDICATOR ACCORDING TO SPECS */}
        <div className="absolute bottom-6 left-6 w-32 h-32 rounded-full border-2 border-white/10 flex items-center justify-center bg-black/30 backdrop-blur-sm pointer-events-auto">
          <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-teal-400/40 shadow-inner flex items-center justify-center text-[10px] font-mono text-teal-300">
            {leftJoystickActive.current ? 'WALKING' : 'MOVE'}
          </div>
        </div>

        {/* BOTTOM RIGHT: PRIMARY FIRE TRIGGER SLAP BUTTON */}
        <button
          id="hud-shoot-primary"
          onMouseDown={(e) => { e.stopPropagation(); fireWeapon(); }}
          className="absolute bottom-6 right-8 w-24 h-24 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 text-white flex flex-col items-center justify-center shadow-lg shadow-red-950/50 pointer-events-auto"
        >
          <Flame className="w-7 h-7 animate-pulse text-white mb-0.5" />
          <span className="text-[10px] font-mono font-bold tracking-widest leading-none">FIRE</span>
        </button>

        {/* ADS SCOPE TOGGLE BUTTON */}
        <button
          id="hud-aim-ads"
          onClick={() => setIsAds(prev => !prev)}
          className={`absolute bottom-32 right-12 w-16 h-16 rounded-full flex flex-col items-center justify-center border transition-all select-none pointer-events-auto ${
            isAds
              ? 'bg-[#52e3ff] border-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20'
              : 'bg-black/60 border-slate-700 hover:border-slate-500 text-slate-200'
          }`}
        >
          <Crosshair className="w-5 h-5 mb-0.5" />
          <span className="text-[8px] font-mono font-semibold">ADS</span>
        </button>

        {/* RELOAD AND CROUCH QUICK SLOTS */}
        <div className="absolute bottom-6 right-36 flex flex-col gap-2 pointer-events-auto">
          {/* Tactical Reload */}
          <button
            id="hud-reload-action"
            onClick={handleReload}
            className="w-14 h-14 rounded-full bg-slate-900/80 border border-slate-700/80 hover:bg-slate-800 text-white flex flex-col items-center justify-center select-none"
          >
            <RefreshCw className={`w-4 h-4 text-slate-300 ${isReloading ? 'animate-spin' : ''}`} />
            <span className="text-[8px] font-mono font-bold leading-none mt-1">RELOAD</span>
          </button>

          {/* Jump */}
          <button
            id="hud-jump-action"
            onClick={() => {
              if (playerPos.current.y <= 1.36) {
                velocity.current.y = 4.2;
              }
            }}
            className="w-14 h-14 rounded-full bg-slate-900/80 border border-slate-700/80 hover:bg-slate-800 text-white flex flex-col items-center justify-center select-none"
          >
            <Zap className="w-4 h-4 text-slate-300" />
            <span className="text-[8px] font-mono font-bold leading-none mt-1">JUMP</span>
          </button>
        </div>

        {/* AMMUNITION COUNTER BAR */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/75 border border-white/5 p-2 rounded-lg font-mono flex items-center gap-4 text-xs select-none">
          <div>
            <span className="text-[8px] text-slate-400 uppercase block leading-none">weapon loaded</span>
            <span className="text-[#52e3ff] font-bold text-lg leading-tight mt-0.5">{ammo}</span>
            <span className="text-slate-500 font-bold"> / {weapon.magazineSize}</span>
          </div>
          <div className="border-l border-white/10 pl-4">
            <span className="text-[8px] text-slate-400 uppercase block leading-none">tactical reserve</span>
            <span className="text-[#ffffff] font-bold text-lg leading-tight mt-0.5">{maxReserve}</span>
          </div>
        </div>

        {/* TIPS DESKTOP OVERLAY */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-[10px] text-slate-400 font-mono bg-black/40 px-3 py-1 pb-1.5 rounded border border-white/5 pointer-events-none text-center">
          💻 DESKTOP CONTROLS: <span className="text-teal-400 font-bold">WASD</span> = MOVE | <span className="text-teal-400 font-bold">L-CLICK</span> = SHOOT | <span className="text-teal-400 font-bold">R-CLICK</span> = ADS RETICLE | <span className="text-teal-400 font-bold">SPACE</span> = JUMP | <span className="text-teal-400 font-bold">R</span> = RELOAD
        </div>

      </div>

      {/* PAUSE POPUP MODAL IF ACTIVATED */}
      {isPaused && (
        <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-sm flex items-center justify-center select-none">
          <div className="w-[320px] bg-[#12161E] border border-teal-500/20 rounded-xl p-6 text-center shadow-2xl">
            <Volume2 className="w-8 h-8 mx-auto text-teal-400 mb-2" />
            <h3 className="text-lg font-serif font-bold tracking-tight text-white mb-1">TACTICAL PAUSE UNIT</h3>
            <p className="text-xs text-slate-400 font-mono mb-4">Practice map environment is suspended safely.</p>
            
            <div className="flex flex-col gap-2">
              <button
                id="pause-resume-btn"
                onClick={() => setIsPaused(false)}
                className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-2 rounded text-xs tracking-wider font-mono font-bold"
              >
                RESUME SQUAD PRACTICE
              </button>
              
              <button
                id="pause-quit-btn"
                onClick={handleFinishMatch}
                className="w-full bg-red-600/30 border border-red-500/40 hover:bg-red-600/50 text-red-200 font-semibold py-2 rounded text-xs tracking-wider font-mono"
              >
                COMPETE MATCH & HARVEST REWARDS
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
