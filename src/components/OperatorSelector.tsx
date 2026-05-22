/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Operator } from '../types';
import { OPERATORS_DATA } from '../data';
import { User, Shield, HelpCircle, Palette, ChevronRight, Check } from 'lucide-react';
import { audio } from './AudioController';

interface OperatorSelectorProps {
  selectedOperatorId: string;
  onSelectOperator: (id: string) => void;
  onUpdateOperatorCustomization: (updatedOperator: Operator) => void;
  gold: number;
  onDeductGold: (amount: number) => void;
  operators: Operator[];
}

export const OperatorSelector: React.FC<OperatorSelectorProps> = ({
  selectedOperatorId,
  onSelectOperator,
  onUpdateOperatorCustomization,
  gold,
  onDeductGold,
  operators
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'facewear' | 'armor' | 'palette'>('roster');

  const currentOp = operators.find(o => o.id === selectedOperatorId) || operators[0];

  // Headwear list
  const headwearOptions = [
    { id: 'tactical_helmet', name: 'Tactical Bulletproof Helmet' },
    { id: 'gas_mask', name: 'Hazmat Gas Mask V2' },
    { id: 'beret', name: 'Special Forces Woolen Beret' },
    { id: 'spec_ops', name: 'Recon Tactical Cap' }
  ];

  // Armor list
  const armorOptions = [
    { id: 'light', name: 'Stealth Carbon Mesh' },
    { id: 'tactical_vest', name: 'Heavy Patrol Kevlar Vest' },
    { id: 'heavy_plate', name: 'Ceramic Ballistic S-Plates' }
  ];

  const skinTones = [
    { name: 'Fair', value: '#ffd6cc' },
    { name: 'Tan', value: '#dcb8a3' },
    { name: 'Bronze', value: '#ae8c7c' },
    { name: 'Dark', value: '#5c4538' }
  ];

  const suitColors = [
    { name: 'Olive Drab Green', value: '#3d4a3e' },
    { name: 'Desert Khaki Camo', value: '#8A7D6B' },
    { name: 'Stealth Black Carbon', value: '#1a1f1a' },
    { name: 'Blizzard Blizzard Grey', value: '#413c58' }
  ];

  const handleSelectOp = (op: Operator) => {
    audio.playClick();
    if (!op.unlocked) {
      if (gold >= op.cost) {
        onDeductGold(op.cost);
        op.unlocked = true;
        onUpdateOperatorCustomization(op);
      } else {
        alert("Insufficient gold credits to hire this special operative!");
        return;
      }
    }
    onSelectOperator(op.id);
  };

  const updateProp = (key: keyof Operator, val: any) => {
    audio.playClick();
    const copy = { ...currentOp, [key]: val };
    onUpdateOperatorCustomization(copy);
  };

  return (
    <div className="absolute inset-0 pointer-events-none grid grid-cols-12 overflow-hidden px-4 md:px-8 py-3.5 select-none z-10">
      
      {/* Left Column: Soldier Operator List (pointer-events-auto) */}
      <div className="col-span-12 md:col-span-4 h-full flex flex-col pointer-events-auto bg-[#0A0C0E]/94 border border-white/5 p-4 rounded-xl shadow-2xl overflow-y-auto max-h-[85vh] self-center">
        <h2 className="text-sm font-bold tracking-widest text-[#52e3ff] mb-1 font-mono uppercase">OPERATIVE BARRACKS</h2>
        <p className="text-[10px] text-slate-400 font-mono mb-4 border-b border-white/10 pb-2">CHOOSE ACTIVE COMBATANT</p>

        {/* Categories Tabs inside Baracks */}
        <div className="flex border-b border-white/10 mb-3 text-[10px] font-mono justify-between">
          <button
            id="tab-roster"
            onClick={() => setActiveTab('roster')}
            className={`py-1.5 px-3 border-b-2 transition-all font-bold ${activeTab === 'roster' ? 'border-teal-400 text-teal-300' : 'border-transparent text-slate-400'}`}
          >
            ROSTER
          </button>
          <button
            id="tab-facewear"
            onClick={() => setActiveTab('facewear')}
            className={`py-1.5 px-3 border-b-2 transition-all font-bold ${activeTab === 'facewear' ? 'border-teal-400 text-teal-300' : 'border-transparent text-slate-400'}`}
          >
            FACEWEAR
          </button>
          <button
            id="tab-armor"
            onClick={() => setActiveTab('armor')}
            className={`py-1.5 px-3 border-b-2 transition-all font-bold ${activeTab === 'armor' ? 'border-teal-400 text-teal-300' : 'border-transparent text-slate-400'}`}
          >
            ARMOR
          </button>
          <button
            id="tab-palette"
            onClick={() => setActiveTab('palette')}
            className={`py-1.5 px-3 border-b-2 transition-all font-bold ${activeTab === 'palette' ? 'border-teal-400 text-teal-300' : 'border-transparent text-slate-400'}`}
          >
            PALETTES
          </button>
        </div>

        {/* Tab Content 1: Operatives List */}
        {activeTab === 'roster' && (
          <div className="flex-1 space-y-2.5 overflow-y-auto min-h-0">
            {operators.map((op) => {
              const isSel = op.id === selectedOperatorId;
              return (
                <button
                  id={`op-select-${op.id}`}
                  key={op.id}
                  onClick={() => handleSelectOp(op)}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    isSel
                      ? 'bg-teal-950/40 border-teal-400 shadow-lg shadow-teal-500/5'
                      : 'bg-black/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-[#52e3ff]">
                        {op.codename}
                      </span>
                      <h4 className="text-xs font-bold text-gray-100">{op.name}</h4>
                    </div>
                    <div>
                      {op.unlocked ? (
                        isSel && <Check className="w-3.5 h-3.5 text-teal-400" />
                      ) : (
                        <span className="text-[9px] font-mono text-amber-500 bg-amber-950/40 px-1.5 py-0.5 rounded font-extrabold">
                          HIRE: {op.cost}G
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1.5 line-clamp-1 italic font-mono">
                    "{op.bio}"
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab Content 2: Facewear Accessories */}
        {activeTab === 'facewear' && (
          <div className="space-y-2 flex-1 overflow-y-auto pr-1">
            <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 block mb-2">CUSTOMIZE HEADGEAR</span>
            {headwearOptions.map((opt) => {
              const checked = currentOp.headType === opt.id;
              return (
                <button
                  id={`geartype-${opt.id}`}
                  key={opt.id}
                  onClick={() => updateProp('headType', opt.id)}
                  className={`w-full p-2.5 rounded border text-left text-xs font-mono flex justify-between items-center transition-all ${
                    checked ? 'bg-teal-950/20 border-teal-400 text-teal-300' : 'bg-black/30 border-slate-800 text-slate-400'
                  }`}
                >
                  <span>{opt.name}</span>
                  {checked && <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow shadow-teal-400" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Tab Content 3: Kevlar Plate Selection */}
        {activeTab === 'armor' && (
          <div className="space-y-2 flex-1 overflow-y-auto pr-1">
            <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 block mb-2">BALLISTIC BODY ARMOR</span>
            {armorOptions.map((opt) => {
              const checked = currentOp.armorType === opt.id;
              return (
                <button
                  id={`armortype-${opt.id}`}
                  key={opt.id}
                  onClick={() => updateProp('armorType', opt.id)}
                  className={`w-full p-2.5 rounded border text-left text-xs font-mono flex justify-between items-center transition-all ${
                    checked ? 'bg-teal-950/20 border-teal-400 text-teal-300' : 'bg-black/30 border-slate-800 text-slate-400'
                  }`}
                >
                  <span>{opt.name}</span>
                  {checked && <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow shadow-teal-400" />}
                </button>
              );
            })}

            <div className="mt-4">
              <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 block mb-2">TACTICAL RUCK/BACKPACK</span>
              <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                {['none', 'small', 'tactical', 'heavy'].map((bType) => {
                  const active = currentOp.backpackType === bType;
                  return (
                    <button
                      id={`backpack-${bType}`}
                      key={bType}
                      onClick={() => updateProp('backpackType', bType)}
                      className={`p-1.5 rounded border uppercase font-bold text-center transition-all ${
                        active ? 'border-teal-400 bg-teal-950/10 text-teal-300' : 'border-slate-800 bg-black/40 text-slate-400'
                      }`}
                    >
                      {bType}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 4: Skin Color palette */}
        {activeTab === 'palette' && (
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {/* Skin Tone */}
            <div>
              <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 block mb-2">SKIN COLOR SPECS</span>
              <div className="grid grid-cols-4 gap-2">
                {skinTones.map((ton) => (
                  <button
                    id={`skincolor-${ton.name}`}
                    key={ton.name}
                    onClick={() => updateProp('skinColor', ton.value)}
                    className="flex flex-col items-center justify-center p-1.5 rounded bg-black/40 border border-slate-800 hover:border-slate-700"
                  >
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: ton.value }} />
                    <span className="text-[8px] font-mono mt-1 text-slate-400 block">{ton.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Suit Camouflage Webbing */}
            <div>
              <span className="text-[9px] uppercase font-mono tracking-widest text-[#52e3ff] block mb-2">CAMOUFLAGE GEAR FABRIC</span>
              <div className="grid grid-cols-2 gap-2">
                {suitColors.map((cl) => (
                  <button
                    id={`suitcolor-${cl.name}`}
                    key={cl.name}
                    onClick={() => {
                      updateProp('armorColor', cl.value);
                      updateProp('backpackColor', cl.value);
                    }}
                    className="flex items-center space-x-2 py-1.5 px-2.5 rounded bg-black/40 border border-slate-800 text-left hover:border-slate-700"
                  >
                    <div className="w-5 h-5 rounded" style={{ backgroundColor: cl.value }} />
                    <span className="text-[8px] font-mono text-slate-300 leading-tight block">{cl.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tactical Gloves */}
            <div>
              <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 block mb-2">SQUAD GLOVE FINISH</span>
              <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                {['#121212', '#413c58', '#4B433F'].map((g, idx) => {
                  const label = idx === 0 ? 'MATTE' : idx === 1 ? 'RECON' : 'DESERT';
                  const act = currentOp.gloveColor === g;
                  return (
                    <button
                      id={`glove-${label}`}
                      key={g}
                      onClick={() => updateProp('gloveColor', g)}
                      className={`py-1 rounded border uppercase text-center transition-all ${
                        act ? 'bg-teal-950/20 border-teal-400 text-teal-300' : 'bg-black/30 border-slate-700 text-slate-400'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Profile specifications overview (pointer-events-auto) */}
      <div className="hidden md:flex col-span-12 md:col-span-3 ml-auto h-full flex-col pointer-events-auto bg-[#0A0C0E]/94 border border-white/5 p-4 rounded-xl shadow-2xl max-h-[70vh] self-center overflow-y-auto">
        <h3 className="text-xs font-bold tracking-widest text-[#52e3ff] mb-1 font-mono uppercase">SPEC OPERATIVE FILES</h3>
        <p className="text-[9px] text-slate-400 font-mono mb-4 border-b border-white/10 pb-2">TACTICAL SPECIFICATIONS</p>

        <div className="space-y-4 text-xs font-mono">
          <div>
            <span className="text-[9px] text-[#52e3ff]/70 block uppercase">Combat Dossier</span>
            <div className="p-2.5 bg-black/30 border border-slate-800 rounded text-[10px] text-slate-300 leading-relaxed mt-1">
              {currentOp.bio}
            </div>
          </div>

          <div className="space-y-3.5 border-t border-white/10 pt-4">
            <div>
              <div className="flex justify-between text-slate-400 text-[10px] mb-1">
                <span>RECON SPEED RATE</span>
                <span className="text-white">{currentOp.gender === 'female' ? '92%' : '80%'}</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400" style={{ width: currentOp.gender === 'female' ? '92%' : '80%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 text-[10px] mb-1">
                <span>ARMOR PLATE ABSORB</span>
                <span className="text-white">
                  {currentOp.armorType === 'heavy_plate' ? '95%' : currentOp.armorType === 'tactical_vest' ? '70%' : '45%'}
                </span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-teal-400" style={{
                  width: currentOp.armorType === 'heavy_plate' ? '95%' : currentOp.armorType === 'tactical_vest' ? '70%' : '45%'
                }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 text-[10px] mb-1">
                <span>VOICE SYNTH PACK</span>
                <span className="text-[#52e3ff]">{currentOp.voicePack}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
