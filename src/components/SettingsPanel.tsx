/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { GameSettings, HUDButtonPos } from '../types';
import { Sliders, Volume2, Monitor, Hand, Move, Save, Trash2, Layout } from 'lucide-react';
import { audio } from './AudioController';

interface SettingsPanelProps {
  settings: GameSettings;
  onSaveSettings: (updated: GameSettings) => void;
  onResetLayout: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSaveSettings,
  onResetLayout
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'audio' | 'hud'>('general');
  const [tempSettings, setTempSettings] = useState<GameSettings>({
    ...settings,
    hudLayout: [...settings.hudLayout]
  });

  const [selectedHudBtnId, setSelectedHudBtnId] = useState<string | null>(null);
  const hudContainerRef = useRef<HTMLDivElement>(null);

  const updateSetting = (key: keyof GameSettings, val: any) => {
    audio.playClick();
    const updated = { ...tempSettings, [key]: val };
    setTempSettings(updated);
    onSaveSettings(updated);
  };

  const updateHudButton = (id: string, prop: keyof HUDButtonPos, val: number) => {
    const updatedLayout = tempSettings.hudLayout.map((btn) => {
      if (btn.id === id) {
        return { ...btn, [prop]: val };
      }
      return btn;
    });
    const updated = { ...tempSettings, hudLayout: updatedLayout };
    setTempSettings(updated);
    onSaveSettings(updated);
  };

  // Drag interaction inside virtual mobile HUD canvas
  const handleVirtualHudDrag = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, btnId: string) => {
    e.preventDefault();
    setSelectedHudBtnId(btnId);

    const container = hudContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    const moveHandler = (clientX: number, clientY: number) => {
      // Calculate percentage inside container specs
      const xPercent = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
      const yPercent = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));

      updateHudButton(btnId, 'x', Math.round(xPercent));
      updateHudButton(btnId, 'y', Math.round(yPercent));
    };

    const mouseMove = (ev: MouseEvent) => moveHandler(ev.clientX, ev.clientY);
    const mouseUp = () => {
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mouseup', mouseUp);
    };

    const touchMove = (ev: TouchEvent) => {
      if (ev.touches.length) {
        moveHandler(ev.touches[0].clientX, ev.touches[0].clientY);
      }
    };
    const touchEnd = () => {
      window.removeEventListener('touchmove', touchMove);
      window.removeEventListener('touchend', touchEnd);
    };

    if ('touches' in e) {
      window.addEventListener('touchmove', touchMove);
      window.addEventListener('touchend', touchEnd);
    } else {
      window.addEventListener('mousemove', mouseMove);
      window.addEventListener('mouseup', mouseUp);
    }
  };

  const selectedBtnConfig = tempSettings.hudLayout.find(b => b.id === selectedHudBtnId);

  return (
    <div className="absolute inset-x-4 md:inset-x-12 top-20 bottom-16 bg-[#0A0C0E]/95 border border-white/5 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white select-none z-10">
      
      {/* Top Selector Panel Tabs */}
      <div className="flex border-b border-white/5 bg-slate-900/40 p-1.5 font-mono text-xs">
        <button
          id="tab-set-general"
          onClick={() => { audio.playClick(); setActiveSubTab('general'); }}
          className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-all ${activeSubTab === 'general' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
        >
          <Monitor className="w-3.5 h-3.5" /> GRAPHICS & SENSITIVITY
        </button>
        <button
          id="tab-set-audio"
          onClick={() => { audio.playClick(); setActiveSubTab('audio'); }}
          className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-all ${activeSubTab === 'audio' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
        >
          <Volume2 className="w-3.5 h-3.5" /> VOLUME CONTROL
        </button>
        <button
          id="tab-set-hud"
          onClick={() => { audio.playClick(); setActiveSubTab('hud'); }}
          className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-all ${activeSubTab === 'hud' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
        >
          <Layout className="w-3.5 h-3.5" /> HUD LAYOUT CUSTOMIZER
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        
        {/* Sub-Tab 1: Graphics & Sensitivity */}
        {activeSubTab === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {/* Graphics Level Selector */}
            <div className="bg-black/30 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-bold tracking-widest text-teal-400 font-mono mb-3 uppercase">GRAPHICS RESOLUTION QUALITY</h3>
              <p className="text-[10px] text-slate-400 font-mono mb-4 leading-relaxed">Customize shaders, shadow maps, and anti-aliasing steps based on device power.</p>
              
              <div className="grid grid-cols-3 gap-2">
                {['low', 'medium', 'high'].map((q) => (
                  <button
                    id={`set-graphic-${q}`}
                    key={q}
                    onClick={() => updateSetting('graphicsQuality', q)}
                    className={`py-2 px-3 rounded-lg border text-xs font-mono font-bold uppercase transition-all ${
                      tempSettings.graphicsQuality === q
                        ? 'border-teal-400 bg-teal-950/20 text-teal-300'
                        : 'border-slate-800 bg-slate-900/30 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Look Sensitivities */}
            <div className="bg-black/30 border border-slate-800 rounded-xl p-4 font-mono text-xs">
              <h3 className="text-xs font-bold tracking-widest text-[#52e3ff] mb-3 uppercase">AIM SENSITIVITY CALIBRATION</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>HIPFIRE CAMERA LOOK</span>
                    <span className="text-white font-bold">{tempSettings.sensitivity.toFixed(1)}x</span>
                  </div>
                  <input
                    id="set-sensitivity-slider"
                    type="range"
                    min="1.0"
                    max="10.0"
                    step="0.5"
                    value={tempSettings.sensitivity}
                    onChange={(e) => updateSetting('sensitivity', parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>ADS SCOPED TARGET AIM</span>
                    <span className="text-white font-bold">{tempSettings.adsSensitivity.toFixed(1)}x</span>
                  </div>
                  <input
                    id="set-ads-sensitivity-slider"
                    type="range"
                    min="1.0"
                    max="8.0"
                    step="0.5"
                    value={tempSettings.adsSensitivity}
                    onChange={(e) => updateSetting('adsSensitivity', parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                  />
                </div>

                {/* Gyro Sensor Option */}
                <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-1">
                  <div>
                    <span className="block text-slate-300">INTEGRATE MOBILE GYROSCOPE</span>
                    <span className="block text-[9px] text-slate-500">Enable device motion tracking alignment</span>
                  </div>
                  <button
                    id="set-gyro-toggle"
                    onClick={() => updateSetting('gyroEnabled', !tempSettings.gyroEnabled)}
                    className={`px-3 py-1.5 rounded font-bold text-[10px] transition-colors ${
                      tempSettings.gyroEnabled ? 'bg-teal-500 text-slate-950' : 'bg-slate-850 border border-slate-705 text-slate-400'
                    }`}
                  >
                    {tempSettings.gyroEnabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sub-Tab 2: Audio Configuration */}
        {activeSubTab === 'audio' && (
          <div className="bg-black/30 border border-slate-800 rounded-xl p-5 max-w-2xl font-mono text-xs space-y-5">
            <h3 className="text-xs font-bold tracking-widest text-teal-400 uppercase">TACTICAL AUDIO VOLUME MIXER</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>SQUAD RADIO VOICE CHANNELS</span>
                  <span className="text-white font-bold">{tempSettings.voiceVolume}%</span>
                </div>
                <input
                  id="set-voice-volume-slider"
                  type="range"
                  min="0"
                  max="100"
                  value={tempSettings.voiceVolume}
                  onChange={(e) => updateSetting('voiceVolume', parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>WEAPONS FIRE & PHYSICAL SFX</span>
                  <span className="text-white font-bold">{tempSettings.sfxVolume}%</span>
                </div>
                <input
                  id="set-sfx-volume-slider"
                  type="range"
                  min="0"
                  max="100"
                  value={tempSettings.sfxVolume}
                  onChange={(e) => updateSetting('sfxVolume', parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>CINEMATIC LOBBY MILITARY MUSIC</span>
                  <span className="text-white font-bold">{tempSettings.musicVolume}%</span>
                </div>
                <input
                  id="set-music-volume-slider"
                  type="range"
                  min="0"
                  max="100"
                  value={tempSettings.musicVolume}
                  onChange={(e) => updateSetting('musicVolume', parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Sub-Tab 3: HUD Customizer Sandbox */}
        {activeSubTab === 'hud' && (
          <div className="grid grid-cols-12 gap-5 h-full">
            
            {/* Visual HUD Mock screen */}
            <div className="col-span-12 lg:col-span-8 flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-2">
                DRAG COMPONENTS ON MOCK SCREEN TO REPOSITION
              </span>

              {/* Simulated Mobile Device frame */}
              <div
                id="virtual-hud-canvas"
                ref={hudContainerRef}
                className="relative flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden min-h-[220px] aspect-[16/9]"
              >
                {/* HUD Grid alignment */}
                <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-5 pointer-events-none">
                  {Array.from({ length: 72 }).map((_, i) => (
                    <div key={i} className="border border-white" />
                  ))}
                </div>

                {/* Left/Right dividing sector line */}
                <div className="absolute inset-y-0 left-1/2 border-l border-white/5 pointer-events-none" />

                {/* Render dragging knobs overlays */}
                {tempSettings.hudLayout.map((btn) => {
                  const isSel = selectedHudBtnId === btn.id;
                  
                  return (
                    <div
                      id={`hud-drag-${btn.id}`}
                      key={btn.id}
                      onMouseDown={(e) => handleVirtualHudDrag(e, btn.id)}
                      onTouchStart={(e) => handleVirtualHudDrag(e, btn.id)}
                      className={`absolute cursor-move select-none rounded-full flex flex-col items-center justify-center border font-mono text-[8px] font-bold text-center pointer-events-auto transition-shadow ${
                        isSel
                          ? 'bg-teal-500 text-slate-950 border-teal-300 ring-4 ring-teal-500/20'
                          : 'bg-slate-800/80 border-slate-600/80 text-white'
                      }`}
                      style={{
                        left: `${btn.x}%`,
                        top: `${btn.y}%`,
                        transform: 'translate(-50%, -50%)',
                        width: `${btn.size * 55}px`,
                        height: `${btn.size * 55}px`,
                        opacity: btn.opacity
                      }}
                    >
                      <Move className="w-3.5 h-3.5 opacity-50 mb-0.5" />
                      <span className="leading-tight px-1 uppercase truncate max-w-full text-[7px]">{btn.name.split(' ')[0]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scale + Opacity Controllers for Selected Button */}
            <div className="col-span-12 lg:col-span-4 bg-black/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-between max-h-[300px] lg:max-h-none">
              <div>
                <h4 className="text-xs font-bold tracking-widest text-[#52e3ff] font-mono mb-3 uppercase">COMPONENT PROPS</h4>
                {selectedBtnConfig ? (
                  <div className="space-y-4 font-mono text-[11px]">
                    <div>
                      <span className="block text-slate-300 uppercase font-bold text-teal-400 mb-0.5">
                        {selectedBtnConfig.name}
                      </span>
                      <span className="text-[9px] text-slate-500 block">
                        COORDINATES: X: {selectedBtnConfig.x}%, Y: {selectedBtnConfig.y}%
                      </span>
                    </div>

                    {/* Scale Slider */}
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>BUTTON SIZE/SCALE</span>
                        <span className="text-white">{selectedBtnConfig.size.toFixed(2)}x</span>
                      </div>
                      <input
                        id="hud-size-slider"
                        type="range"
                        min="0.6"
                        max="1.8"
                        step="0.05"
                        value={selectedBtnConfig.size}
                        onChange={(e) => updateHudButton(selectedBtnConfig.id, 'size', parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                      />
                    </div>

                    {/* Opacity Slider */}
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>OPACITY DENSITY</span>
                        <span className="text-white">{Math.round(selectedBtnConfig.opacity * 100)}%</span>
                      </div>
                      <input
                        id="hud-opacity-slider"
                        type="range"
                        min="0.2"
                        max="1.0"
                        step="0.05"
                        value={selectedBtnConfig.opacity}
                        onChange={(e) => updateHudButton(selectedBtnConfig.id, 'opacity', parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 text-xs font-mono">
                    Tap any touchscreen component node on mock screen to customize scaling
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="border-t border-white/5 pt-3 flex gap-2">
                <button
                  id="reset-hud-btn"
                  onClick={() => { audio.playClick(); onResetLayout(); }}
                  className="flex-1 py-1.5 bg-red-650/20 border border-red-500/20 hover:bg-red-500/10 text-red-400 rounded text-[10px] font-mono uppercase"
                >
                  RESET HUD
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
