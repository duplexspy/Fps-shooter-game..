/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Weapon, WeaponCategory } from '../types';
import { WEAPONS_DATA } from '../data';
import { Shield, Lock, Sliders, ChevronRight, Check } from 'lucide-react';
import { audio } from './AudioController';

interface WeaponsSelectorProps {
  selectedWeaponId: string;
  onSelectWeapon: (id: string) => void;
  gold: number;
  onDeductGold: (amount: number) => void;
  weapons: Weapon[];
  onUnlockWeapon: (id: string, cost: number) => void;
}

export const WeaponsSelector: React.FC<WeaponsSelectorProps> = ({
  selectedWeaponId,
  onSelectWeapon,
  gold,
  onDeductGold,
  weapons,
  onUnlockWeapon
}) => {
  const [activeCategory, setActiveCategory] = useState<WeaponCategory>('Assault Rifle');

  const categories: WeaponCategory[] = ['Assault Rifle', 'SMG', 'Sniper', 'Shotgun', 'Pistol', 'LMG'];

  const filteredWeapons = weapons.filter(w => w.category === activeCategory);
  const currentWp = weapons.find(w => w.id === selectedWeaponId) || weapons[0];

  const handleSelectWp = (wp: Weapon) => {
    audio.playClick();
    if (!wp.unlocked) {
      if (gold >= wp.cost) {
        onUnlockWeapon(wp.id, wp.cost);
      } else {
        alert("Insufficient military supply funds to buy this weapon!");
        return;
      }
    } else {
      onSelectWeapon(wp.id);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none grid grid-cols-12 overflow-hidden px-4 md:px-8 py-3.5 select-none z-10">
      
      {/* Left Column: Weapon Catalog Categories & List */}
      <div className="col-span-12 md:col-span-4 h-full flex flex-col pointer-events-auto bg-[#0A0C0E]/94 border border-white/5 p-4 rounded-xl shadow-2xl overflow-y-auto max-h-[85vh] self-center">
        <h2 className="text-sm font-bold tracking-widest text-[#52e3ff] mb-1 font-mono uppercase">DIVISION INVENTORY</h2>
        <p className="text-[10px] text-slate-400 font-mono mb-4 border-b border-white/10 pb-2">EQUIP ARMAMENT LOADOUT</p>

        {/* Weapons Classes Categories Grid */}
        <div className="grid grid-cols-3 gap-1 mb-4">
          {categories.map((cat) => (
            <button
              id={`cat-btn-${cat}`}
              key={cat}
              onClick={() => {
                audio.playClick();
                setActiveCategory(cat);
              }}
              className={`p-1.5 rounded text-[10px] font-mono uppercase font-bold text-center border transition-all ${
                activeCategory === cat
                  ? 'border-teal-400 bg-teal-950/20 text-teal-300'
                  : 'border-slate-800 bg-black/40 text-slate-500'
              }`}
            >
              {cat.split(' ')[0]} {/* shortened */}
            </button>
          ))}
        </div>

        {/* List of filtered tactical weapons */}
        <div className="flex-1 space-y-2.5 overflow-y-auto min-h-0">
          {filteredWeapons.map((wp) => {
            const isSel = wp.id === selectedWeaponId;
            return (
              <button
                id={`wp-btn-${wp.id}`}
                key={wp.id}
                onClick={() => handleSelectWp(wp)}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  isSel
                    ? 'bg-teal-950/40 border-teal-400 shadow-lg shadow-teal-500/5'
                    : 'bg-black/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-[9px] uppercase font-mono tracking-widest font-extrabold ${
                      wp.rarity === 'legendary' ? 'text-amber-400' :
                      wp.rarity === 'epic' ? 'text-purple-400' :
                      wp.rarity === 'rare' ? 'text-blue-400' : 'text-slate-400'
                    }`}>
                      {wp.rarity}
                    </span>
                    <h4 className="text-xs font-bold text-gray-100">{wp.name}</h4>
                  </div>
                  <div>
                    {wp.unlocked ? (
                      isSel && <Check className="w-3.5 h-3.5 text-teal-400" />
                    ) : (
                      <span className="text-[9px] font-mono text-amber-500 bg-amber-950/30 px-2 py-0.5 rounded font-extrabold flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> {wp.cost}G
                      </span>
                    )}
                  </div>
                </div>

                {/* Micro Stats bars inside card */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-[8px] font-mono text-slate-400">
                  <div>
                    <span>DAM:</span> <span className="text-red-400 font-bold">{wp.damage}</span>
                  </div>
                  <div>
                    <span>ACC:</span> <span className="text-teal-400 font-bold">{wp.accuracy}</span>
                  </div>
                  <div>
                    <span>MOB:</span> <span className="text-green-400 font-bold">{wp.mobility}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Comparative Armory specs (pointer-events-auto) */}
      <div className="hidden md:flex col-span-12 md:col-span-3 ml-auto h-full flex-col pointer-events-auto bg-[#0A0C0E]/94 border border-white/5 p-4 rounded-xl shadow-2xl max-h-[70vh] self-center overflow-y-auto">
        <h3 className="text-xs font-bold tracking-widest text-[#52e3ff] mb-1 font-mono uppercase">ARMORY SPECIFICATIONS</h3>
        <p className="text-[9px] text-slate-400 font-mono mb-4 border-b border-white/10 pb-2">LOADOUT PARAMETERS</p>

        <div className="space-y-4 text-xs font-mono">
          <div>
            <span className="text-[9px] text-[#52e3ff]/70 block uppercase">FITTED MODEL</span>
            <span className="text-white text-md font-bold block mt-1">{currentWp.name}</span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-slate-400 text-[10px] mb-1">
                <span>DAMAGE RATIO</span>
                <span className="text-red-400">{currentWp.damage}/100</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-400" style={{ width: `${currentWp.damage}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 text-[10px] mb-1">
                <span>EFFECTIVE ACCURACY</span>
                <span className="text-teal-400">{currentWp.accuracy}/100</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-teal-400" style={{ width: `${currentWp.accuracy}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 text-[10px] mb-1">
                <span>TACTICAL MOBILITY</span>
                <span className="text-green-400">{currentWp.mobility}/100</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-400" style={{ width: `${currentWp.mobility}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 text-[10px] mb-1">
                <span>MAG CAPACITY</span>
                <span className="text-cyan-400">{currentWp.magazineSize} rnds</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 text-[10px] mb-1">
                <span>RELOAD SPEED</span>
                <span className="text-amber-400">{currentWp.reloadTime}s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
