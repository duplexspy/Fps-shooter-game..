/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Weapon, Attachment } from '../types';
import { ATTACHMENTS_DATA, WEAPON_SKINS } from '../data';
import { createProceduralWeapon } from '../utils/threeHelpers';
import { Settings, ShieldAlert, Award, Sliders, CheckSquare, PlusSquare, Trash2, Eye } from 'lucide-react';
import { audio } from './AudioController';

interface Gunsmith3DViewProps {
  weapon: Weapon;
  onModifyWeapon: (idOfWeapon: string, updatedWeapon: Weapon) => void;
  gold: number;
  credits: number;
  onDeductGold: (amount: number) => void;
  onDeductCredits: (amount: number) => void;
}

export const Gunsmith3DView: React.FC<Gunsmith3DViewProps> = ({
  weapon,
  onModifyWeapon,
  gold,
  credits,
  onDeductGold,
  onDeductCredits
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const weaponRef = useRef<THREE.Group | null>(null);

  // Attachment slots
  const slots: ('scope' | 'barrel' | 'muzzle' | 'stock' | 'laser' | 'grip' | 'magazine')[] = [
    'scope', 'barrel', 'muzzle', 'stock', 'laser', 'grip', 'magazine'
  ];

  const [selectedSlot, setSelectedSlot] = useState<'scope' | 'barrel' | 'muzzle' | 'stock' | 'laser' | 'grip' | 'magazine' | null>(null);
  
  // Drag states
  const isDragging = useRef(false);
  const previousMouseX = useRef(0);
  const targetRotationY = useRef(-0.5); // Slight angle initially
  const currentRotationY = useRef(-0.5);

  useEffect(() => {
    if (!canvasRef.current) return;

    const width = canvasRef.current.clientWidth;
    const height = canvasRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0A0C0E');
    scene.fog = new THREE.FogExp2('#0A0C0E', 0.18);

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 0.1, 1.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    while (canvasRef.current.firstChild) {
      canvasRef.current.removeChild(canvasRef.current.firstChild);
    }
    canvasRef.current.appendChild(renderer.domElement);

    // HANGAR WORKBENCH FLOOR GRID
    const gridHelper = new THREE.GridHelper(10, 40, '#00ffff', '#1e242d');
    gridHelper.position.y = -0.45;
    scene.add(gridHelper);

    // Dynamic weapon generator
    const weaponGroup = createProceduralWeapon(weapon);
    // Align weapon cleanly
    weaponGroup.scale.set(1.1, 1.1, 1.1);
    weaponGroup.position.set(0, -0.05, 0);
    scene.add(weaponGroup);
    weaponRef.current = weaponGroup;

    // LIGHTING
    const amt = new THREE.AmbientLight('#18222d', 1.8);
    scene.add(amt);

    const mainLight = new THREE.DirectionalLight('#ffffff', 2.0);
    mainLight.position.set(2, 4, 3);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const cyanRim = new THREE.DirectionalLight('#00e1ff', 1.8);
    cyanRim.position.set(-3, -1, -2);
    scene.add(cyanRim);

    const orangeRim = new THREE.DirectionalLight('#ff7700', 0.8);
    orangeRim.position.set(2, -1, -3);
    scene.add(orangeRim);

    // Drag bindings
    const handleStart = (clientX: number) => {
      isDragging.current = true;
      previousMouseX.current = clientX;
    };
    const handleMove = (clientX: number) => {
      if (!isDragging.current) return;
      const delta = clientX - previousMouseX.current;
      targetRotationY.current += delta * 0.01;
      previousMouseX.current = clientX;
    };
    const handleEnd = () => {isDragging.current = false;};

    const md = (e: MouseEvent) => handleStart(e.clientX);
    const mm = (e: MouseEvent) => handleMove(e.clientX);
    const mu = () => handleEnd();

    const ts = (e: TouchEvent) => { if (e.touches.length) handleStart(e.touches[0].clientX); };
    const tm = (e: TouchEvent) => { if (e.touches.length) handleMove(e.touches[0].clientX); };
    const te = () => handleEnd();

    const el = canvasRef.current;
    el.addEventListener('mousedown', md);
    window.addEventListener('mousemove', mm);
    window.addEventListener('mouseup', mu);
    el.addEventListener('touchstart', ts, { passive: true });
    el.addEventListener('touchmove', tm, { passive: true });
    el.addEventListener('touchend', te);

    let animId: number;
    let clock = new THREE.Clock();

    const renderTick = () => {
      animId = requestAnimationFrame(renderTick);
      const elapsed = clock.getElapsedTime();

      // Interia rotation interpolation
      currentRotationY.current += (targetRotationY.current - currentRotationY.current) * 0.15;
      if (weaponGroup) {
        weaponRef.current!.rotation.y = currentRotationY.current;
        // Minor dynamic idle sway
        weaponRef.current!.position.y = -0.05 + Math.sin(elapsed * 1.5) * 0.01;
      }

      renderer.render(scene, camera);
    };

    renderTick();

    const handleResize = () => {
      if (!canvasRef.current) return;
      const w = canvasRef.current.clientWidth;
      const h = canvasRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (el) {
        el.removeEventListener('mousedown', md);
        window.removeEventListener('mousemove', mm);
        window.removeEventListener('mouseup', mu);
        el.removeEventListener('touchstart', ts);
        el.removeEventListener('touchmove', tm);
        el.removeEventListener('touchend', te);
      }
    };
  }, [weapon]);

  // Handle equipping attachment
  const handleEquipAttachment = (att: Attachment) => {
    // Check gold/currency limits
    if (!att.unlocked && gold < att.cost) {
      alert('Insufficient military credits! Keep practice training to accumulate gold.');
      return;
    }

    if (!att.unlocked) {
      onDeductGold(att.cost);
      att.unlocked = true; // Mark as unlocked locally
    }

    audio.playReload();

    const updatedAttachments = { ...weapon.attachments, [att.category]: att.id };
    const updatedWeapon = { ...weapon, attachments: updatedAttachments };
    onModifyWeapon(weapon.id, updatedWeapon);
  };

  const handleDetach = (category: typeof slots[number]) => {
    audio.playReload();
    const updatedAttachments = { ...weapon.attachments, [category]: null };
    const updatedWeapon = { ...weapon, attachments: updatedAttachments };
    onModifyWeapon(weapon.id, updatedWeapon);
  };

  const handleApplySkin = (skinId: string) => {
    audio.playClick();
    const updatedWeapon = { ...weapon, currentSkin: skinId };
    onModifyWeapon(weapon.id, updatedWeapon);
  };

  // Calculate modified stats
  const calculateStats = () => {
    let damage = weapon.damage;
    let range = weapon.range;
    let accuracy = weapon.accuracy;
    let mobility = weapon.mobility;
    let fireRate = weapon.fireRate;
    let control = weapon.control;

    // Apply modifiers
    Object.entries(weapon.attachments).forEach(([key, attId]) => {
      if (!attId) return;
      const att = ATTACHMENTS_DATA.find(a => a.id === attId);
      if (att) {
        if (att.statModifiers.damage) damage += att.statModifiers.damage;
        if (att.statModifiers.range) range += att.statModifiers.range;
        if (att.statModifiers.accuracy) accuracy += att.statModifiers.accuracy;
        if (att.statModifiers.mobility) mobility += att.statModifiers.mobility;
        if (att.statModifiers.fireRate) fireRate += att.statModifiers.fireRate;
        if (att.statModifiers.control) control += att.statModifiers.control;
      }
    });

    return {
      damage: Math.min(100, Math.max(10, damage)),
      range: Math.min(100, Math.max(10, range)),
      accuracy: Math.min(100, Math.max(10, accuracy)),
      mobility: Math.min(100, Math.max(10, mobility)),
      fireRate: Math.min(100, Math.max(10, fireRate)),
      control: Math.min(100, Math.max(10, control))
    };
  };

  const currentStats = calculateStats();

  return (
    <div className="absolute inset-0 grid grid-cols-12 overflow-hidden bg-[#0A0C0E]">
      {/* 3D Workbench Renderer */}
      <div className="relative col-span-12 md:col-span-8 w-full h-full select-none">
        
        {/* Interactive Overlay Nodes on Workbench */}
        <div className="absolute top-4 left-4 z-10 bg-black/60 border border-teal-500/20 px-3 py-1.5 rounded-lg backdrop-blur-md">
          <div className="flex items-center space-x-2 text-xs text-white">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            <span className="font-mono text-xs tracking-wider">TACTICAL GUNSMITH SYSTEM V1.0</span>
          </div>
        </div>

        {/* Swipe to Inspect prompt */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 text-white/50 text-[10px] font-mono select-none pointer-events-none flex items-center gap-1">
          <Sliders className="w-3.5 h-3.5 animate-pulse" /> SWIPE TO SPIN AND INSPECT WEAPON MODS
        </div>

        {/* 3D Canvas Container */}
        <div ref={canvasRef} className="w-full h-full" id="gunsmith-canvas-container" />

        {/* Screen Attachment Hotspots mapped on overlay */}
        <div className="absolute top-1/4 left-6 flex flex-col gap-2 z-10 select-none">
          <div className="text-[11px] font-mono text-cyan-400/80 mb-1 border-b border-cyan-500/10 pb-1">COMPONENTS SELECTOR</div>
          {slots.map((slot) => {
            const equippedId = weapon.attachments[slot];
            const equippedAtt = ATTACHMENTS_DATA.find(a => a.id === equippedId);
            const isSel = selectedSlot === slot;

            return (
              <button
                id={`gunsmith-slot-${slot}`}
                key={slot}
                onClick={() => {
                  audio.playClick();
                  setSelectedSlot(isSel ? null : slot);
                }}
                className={`flex items-center text-left py-1.5 px-3 rounded-lg border text-xs transition-all w-48 ${
                  isSel
                    ? 'bg-teal-950/40 border-teal-400 text-teal-300 shadow-lg shadow-teal-500/10'
                    : equippedId
                    ? 'bg-slate-900/60 border-slate-700/60 text-white'
                    : 'bg-black/40 border-dashed border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                <div className="flex-1">
                  <span className="block text-[8px] uppercase tracking-widest font-mono text-slate-400">{slot}</span>
                  <span className="block font-medium truncate text-[11px]">
                    {equippedAtt ? equippedAtt.name : 'EMPTY'}
                  </span>
                </div>
                {equippedId && (
                  <button
                    id={`detach-slot-${slot}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDetach(slot);
                    }}
                    className="p-1 hover:text-red-400 transition-colors text-slate-400 ml-1.5"
                    title="Remove attachment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Customizer Panel (Stats, Attachment list, Skins) */}
      <div className="col-span-12 md:col-span-4 bg-[#0F1216] border-l border-white/5 flex flex-col overflow-y-auto h-full p-4 select-none">
        
        {/* Weapon Title */}
        <div className="mb-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] uppercase tracking-widest bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded font-mono font-bold">
                {weapon.category}
              </span>
              <h2 className="text-xl font-bold font-sans text-gray-100 tracking-tight mt-1">{weapon.name}</h2>
            </div>
            <div className="text-right">
              <span className={`text-[10px] uppercase font-mono tracking-wider font-extrabold ${
                weapon.rarity === 'legendary' ? 'text-amber-400' :
                weapon.rarity === 'epic' ? 'text-purple-400' :
                weapon.rarity === 'rare' ? 'text-blue-400' : 'text-gray-400'
              }`}>
                ● {weapon.rarity}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Weapons Bench Stats Panel */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-3.5 mb-4 font-mono">
          <h3 className="text-[10px] font-bold tracking-widest text-[#52e3ff] mb-2">BENCH PERFORMANCE GRAPH</h3>
          
          <div className="space-y-2 text-[11px]">
            {/* Accuracy */}
            <div>
              <div className="flex justify-between text-slate-300 mb-0.5">
                <span>Accuracy</span>
                <span>{currentStats.accuracy} <span className="text-teal-400 text-[10px]">
                  ({currentStats.accuracy - weapon.accuracy >= 0 ? '+' : ''}{currentStats.accuracy - weapon.accuracy})
                </span></span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-teal-400 rounded-full" style={{ width: `${currentStats.accuracy}%` }} />
              </div>
            </div>

            {/* Damage */}
            <div>
              <div className="flex justify-between text-slate-300 mb-0.5">
                <span>Damage</span>
                <span>{currentStats.damage}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-400 rounded-full" style={{ width: `${currentStats.damage}%` }} />
              </div>
            </div>

            {/* Range */}
            <div>
              <div className="flex justify-between text-slate-300 mb-0.5">
                <span>Range</span>
                <span>{currentStats.range} <span className="text-teal-400 text-[10px]">
                  ({currentStats.range - weapon.range >= 0 ? '+' : ''}{currentStats.range - weapon.range})
                </span></span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${currentStats.range}%` }} />
              </div>
            </div>

            {/* Mobility */}
            <div>
              <div className="flex justify-between text-slate-300 mb-0.5">
                <span>Mobility</span>
                <span>{currentStats.mobility} <span className={currentStats.mobility - weapon.mobility < 0 ? 'text-red-400 text-[10px]' : 'text-teal-400 text-[10px]'}>
                  ({currentStats.mobility - weapon.mobility >= 0 ? '+' : ''}{currentStats.mobility - weapon.mobility})
                </span></span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 rounded-full" style={{ width: `${currentStats.mobility}%` }} />
              </div>
            </div>

            {/* Fire Rate */}
            <div>
              <div className="flex justify-between text-slate-300 mb-0.5">
                <span>Fire Rate</span>
                <span>{currentStats.fireRate}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${currentStats.fireRate}%` }} />
              </div>
            </div>

            {/* Control */}
            <div>
              <div className="flex justify-between text-slate-300 mb-0.5">
                <span>Control (Recoil)</span>
                <span>{currentStats.control} <span className="text-teal-400 text-[10px]">
                  ({currentStats.control - weapon.control >= 0 ? '+' : ''}{currentStats.control - weapon.control})
                </span></span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${currentStats.control}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Attachment Options Slot Panel */}
        {selectedSlot ? (
          <div className="flex-1 flex flex-col min-h-[180px] border border-teal-500/20 rounded-lg p-3 bg-teal-950/10 mb-4 overflow-hidden">
            <div className="flex justify-between items-center mb-2 border-b border-teal-500/10 pb-1">
              <span className="text-xs font-mono font-bold uppercase text-teal-400">MODIFY MODS: {selectedSlot}</span>
              <button
                id="close-slot-modifier"
                onClick={() => setSelectedSlot(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                CLOSE
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[160px] md:max-h-none">
              {ATTACHMENTS_DATA.filter((a) => a.category === selectedSlot).map((att) => {
                const isEquipped = weapon.attachments[selectedSlot] === att.id;
                
                return (
                  <div
                    id={`select-att-${att.id}`}
                    key={att.id}
                    className={`p-2 rounded border transition-all text-xs flex justify-between items-center ${
                      isEquipped
                        ? 'bg-teal-950/40 border-teal-400 text-teal-200'
                        : 'bg-black/40 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-[11px]">{att.name}</div>
                      <div className="text-[9px] text-slate-400 mt-1 space-y-0.5 font-mono">
                        {Object.entries(att.statModifiers).map(([modKey, val]) => (
                          <div key={modKey}>
                            ● {modKey}: <span className={val > 0 ? 'text-teal-400' : 'text-red-400'}>
                              {val > 0 ? `+${val}` : val}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      {isEquipped ? (
                        <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400 bg-teal-950 px-2 py-1 rounded">
                          EQUIPPED
                        </span>
                      ) : (
                        <button
                          id={`equip-${att.id}`}
                          onClick={() => handleEquipAttachment(att)}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono ${
                            att.unlocked
                              ? 'bg-teal-500 hover:bg-teal-400 text-slate-950'
                              : gold >= att.cost
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {att.unlocked ? 'EQUIP' : `BUY: ${att.cost}G`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 border border-dashed border-slate-800 rounded-lg p-3 text-center flex flex-col justify-center items-center text-slate-500 text-xs mb-4 min-h-[100px]">
            <PlusSquare className="w-6 h-6 mb-2 text-slate-600" />
            <span>Select any slot on left side to view compatible attachments</span>
          </div>
        )}

        {/* Tactical Skins Catalog (24k gold, neon, carbon) */}
        <div>
          <h4 className="text-[10px] font-mono font-bold tracking-widest text-slate-400 mb-2">FACTORY WEAPON SKIN RE-FINISH</h4>
          <div className="grid grid-cols-3 gap-2">
            {WEAPON_SKINS.map((sk) => {
              const isApplied = weapon.currentSkin === sk.id;
              return (
                <button
                  id={`skin-btn-${sk.id}`}
                  key={sk.id}
                  onClick={() => handleApplySkin(sk.id)}
                  className={`p-2 rounded border flex flex-col items-center justify-between text-center transition-all ${
                    isApplied
                      ? 'border-teal-400 bg-teal-950/20'
                      : 'border-slate-800 bg-black/40 hover:border-slate-700'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full border border-white/10 shadow-inner mb-1.5"
                    style={{ backgroundColor: sk.color }}
                  />
                  <div className="text-[9px] font-mono leading-tight font-bold text-gray-200">{sk.name}</div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
