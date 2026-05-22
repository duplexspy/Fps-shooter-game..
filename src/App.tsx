/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuScreen, Operator, Weapon, GameMap, GameMode, GameSettings, PlayerStats } from './types';
import {
  OPERATORS_DATA,
  WEAPONS_DATA,
  MAPS_DATA,
  MODES_DATA,
  INITIAL_PLAYER_STATS,
  INITIAL_SETTINGS
} from './data';
import { Lobby3DView } from './components/Lobby3DView';
import { OperatorSelector } from './components/OperatorSelector';
import { WeaponsSelector } from './components/WeaponsSelector';
import { Gunsmith3DView } from './components/Gunsmith3DView';
import { SettingsPanel } from './components/SettingsPanel';
import { Gameplay3DView } from './components/Gameplay3DView';
import { audio } from './components/AudioController';
import {
  Shield,
  Coins,
  Radio,
  User,
  Settings as SettingsIcon,
  ShoppingBag,
  Award,
  Zap,
  Target,
  Trophy,
  Users,
  Compass,
  Layout,
  Volume2,
  Sword,
  Sliders,
  Play,
  Share2,
  BookOpen
} from 'lucide-react';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<MenuScreen>('lobby');
  const [playerStats, setPlayerStats] = useState<PlayerStats>({ ...INITIAL_PLAYER_STATS });
  const [settings, setSettings] = useState<GameSettings>({ ...INITIAL_SETTINGS });
  const [operators, setOperators] = useState<Operator[]>(JSON.parse(JSON.stringify(OPERATORS_DATA)));
  const [weapons, setWeapons] = useState<Weapon[]>(JSON.parse(JSON.stringify(WEAPONS_DATA)));

  // Selected configs
  const [selectedMapId, setSelectedMapId] = useState<string>('map_desert');
  const [selectedModeId, setSelectedModeId] = useState<string>('mode_practice');

  // Matchmaker queue simulator
  const [matchmakingProgress, setMatchmakingProgress] = useState(0); // 0 to 100
  const [queueTime, setQueueTime] = useState(0);
  const [lobbyPlayers, setLobbyPlayers] = useState<{ name: string; ping: number; isReady: boolean }[]>([]);

  const selectedOperator = operators.find(o => o.id === playerStats.selectedOperatorId) || operators[0];
  const selectedWeapon = weapons.find(w => w.id === playerStats.selectedWeaponId) || weapons[0];
  const selectedMap = MAPS_DATA.find(m => m.id === selectedMapId) || MAPS_DATA[0];
  const selectedMode = MODES_DATA.find(md => md.id === selectedModeId) || MODES_DATA[0];

  // Initiate Web Audio synthetic volumes
  useEffect(() => {
    audio.setVolumes(settings.musicVolume, settings.sfxVolume);
  }, [settings.musicVolume, settings.sfxVolume]);

  // Matchmaking simulation countdown
  useEffect(() => {
    if (activeScreen !== 'matchmaker') return;

    let queueInterval = setInterval(() => {
      setQueueTime(prev => prev + 1);
    }, 1000);

    let progressInterval = setInterval(() => {
      setMatchmakingProgress(prev => {
        const next = prev + Math.floor(Math.random() * 8) + 3;
        if (next >= 100) {
          clearInterval(progressInterval);
          clearInterval(queueInterval);
          // Transition to gameplay after syncing channels
          setTimeout(() => {
            audio.playClick();
            setActiveScreen('gameplay');
          }, 800);
          return 100;
        }

        // Add fun simulated player names dynamically
        if (next > 20 && lobbyPlayers.length === 0) {
          setLobbyPlayers([
            { name: 'AlphaSpecs_09', ping: 24, isReady: true },
            { name: 'Vortex_Hunter', ping: 32, isReady: true }
          ]);
        }
        if (next > 55 && lobbyPlayers.length === 2) {
          setLobbyPlayers(prevList => [
            ...prevList,
            { name: 'Silent_Slayer_7', ping: 18, isReady: true },
            { name: 'GigaJuggernaut', ping: 45, isReady: true }
          ]);
        }
        return next;
      });
    }, 450);

    return () => {
      clearInterval(queueInterval);
      clearInterval(progressInterval);
    };
  }, [activeScreen]);

  const handleStartPracticeMatch = () => {
    // If practice range mode is selected, launch immediately, otherwise start simulated multiplayer matchmaker
    audio.playClick();
    if (selectedModeId === 'mode_practice') {
      setActiveScreen('gameplay');
    } else {
      setQueueTime(0);
      setMatchmakingProgress(0);
      setLobbyPlayers([]);
      setActiveScreen('matchmaker');
      audio.playMatchFound();
    }
  };

  const handleFinishMatch = (matchKills: number, earnedXP: number, earnedGold: number) => {
    audio.playReload();
    const newXP = playerStats.xp + earnedXP;
    let nextLvl = playerStats.level;
    let lvlUpped = false;

    if (newXP >= playerStats.nextLevelXp) {
      nextLvl += 1;
      lvlUpped = true;
    }

    setPlayerStats(prev => ({
      ...prev,
      kills: prev.kills + matchKills,
      matchesPlayed: prev.matchesPlayed + 1,
      wins: prev.wins + 1,
      gold: prev.gold + earnedGold,
      xp: lvlUpped ? 0 : newXP,
      level: nextLvl,
      rankPoints: prev.rankPoints + 15
    }));

    setActiveScreen('lobby');
    if (lvlUpped) {
      alert(`PROMOTION GRANTED! Corporal, you have risen to Level ${nextLvl}! Supplied 500 bonus coins.`);
      setPlayerStats(prev => ({ ...prev, gold: prev.gold + 500 }));
    }
  };

  // Callback to update operator configs inside barracks selector
  const handleUpdateOperatorCustomization = (updatedOp: Operator) => {
    setOperators(prev => prev.map(o => o.id === updatedOp.id ? updatedOp : o));
  };

  // Callback to update custom gun modifications inside work bench selector
  const handleModifyWeapon = (idOfWeapon: string, updatedWp: Weapon) => {
    setWeapons(prev => prev.map(w => w.id === idOfWeapon ? updatedWp : w));
  };

  const handleSelectOperator = (id: string) => {
    setPlayerStats(prev => ({ ...prev, selectedOperatorId: id }));
  };

  const handleSelectWeapon = (id: string) => {
    setPlayerStats(prev => ({ ...prev, selectedWeaponId: id }));
  };

  const handleUnlockWeapon = (id: string, cost: number) => {
    setWeapons(prev => prev.map(w => w.id === id ? { ...w, unlocked: true } : w));
    setPlayerStats(prev => ({ ...prev, gold: prev.gold - cost, selectedWeaponId: id }));
  };

  return (
    <div className="relative w-screen h-screen font-sans bg-[#050709] select-none text-white overflow-hidden uppercase tracking-normal">
      
      {/* LANDSCAPE ORIENTATION CORNER NOTICE GAUGE */}
      <div className="absolute top-2.5 right-20 z-10 pointer-events-none hidden max-md:flex items-center gap-1 bg-red-650/40 p-1 rounded backdrop-blur-md border border-red-500/10 text-[9px] font-mono select-none">
        ⚠️ ORIENT LANDSCAPE FOR MOBILE HUD CONTROLS
      </div>

      {/* CORE 3D WORLD: CINEMATIC BACKGROUND */}
      {/* Standard non-overlapping 3D rendered character scene */}
      {activeScreen !== 'gameplay' && activeScreen !== 'matchmaker' && (
        <Lobby3DView operator={selectedOperator} weapon={selectedWeapon} />
      )}

      {/* TOP HEADER STATUS COGNIZANCE MODULE */}
      {activeScreen !== 'gameplay' && activeScreen !== 'matchmaker' && (
        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#0A0C0E]/90 to-transparent flex items-center justify-between px-6 pointer-events-none select-none z-20">
          
          {/* Top Left: Player Level Profiler Badge (pointer-events-auto) */}
          <div className="pointer-events-auto flex items-center space-x-3 bg-slate-900/60 border border-white/5 py-1 px-3 rounded-lg backdrop-blur-md">
            <User className="w-5 h-5 text-teal-400" />
            <div className="font-mono text-[10px]">
              <div className="text-gray-200 font-bold max-w-[120px] truncate">{playerStats.username}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-yellow-400 font-extrabold">LVL {playerStats.level}</span>
                <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#52e3ff]" style={{ width: `${(playerStats.xp / playerStats.nextLevelXp) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Top Center: Current operational location readout */}
          <div className="hidden lg:flex flex-col items-center">
            <span className="text-[9px] font-mono tracking-widest text-[#52e3ff] leading-none">SECTOR HEADQUARTERS</span>
            <span className="text-[11px] font-mono text-white/50">{selectedMap.name} :: ACTIVE DEPLOYMENT</span>
          </div>

          {/* Top Right: Currencies and Network Connection */}
          <div className="pointer-events-auto flex items-center space-x-3 bg-slate-900/60 border border-white/5 py-1 px-3 rounded-lg backdrop-blur-md font-mono text-xs">
            {/* Gold coins indicator */}
            <div className="flex items-center gap-1.5" title="Military Supply Gold">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="font-bold text-gray-205">{playerStats.gold}</span>
            </div>

            {/* Premium military credits */}
            <div className="flex items-center gap-1.5 border-l border-white/10 pl-3" title="Premium Tactical Credits">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-gray-205">{playerStats.credits}</span>
            </div>

            {/* Ping Speed gauge */}
            <div className="flex items-center gap-1.5 border-l border-white/10 pl-3 text-emerald-400" title="Operational latency">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span className="text-[10px] font-bold">14ms</span>
            </div>

            {/* Settings Trigger Icon */}
            <button
              id="lobby-settings-icon"
              onClick={() => {
                audio.playClick();
                setActiveScreen(activeScreen === 'settings' ? 'lobby' : 'settings');
              }}
              className={`p-1 hover:text-white transition-colors ml-1 ${activeScreen === 'settings' ? 'text-teal-400' : 'text-slate-400'}`}
              title="Calibration configurations"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* RENDER DYNAMIC ACTIVE OVERLAYS INTERFACES */}
      <AnimatePresence mode="wait">
        {/* Lobby Default HUD overlay */}
        {activeScreen === 'lobby' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* LEFT COMMAND SIDE BAR WITH OPERATORS AND WEAPONS DRAWERS */}
            <div className="absolute left-6 top-20 bottom-24 w-52 flex flex-col justify-center space-y-2 pointer-events-auto z-10 selection-none">
              <span className="text-[9px] font-mono tracking-widest text-[#52e3ff] block mb-1">COMMAND RAILS</span>
              
              <button
                id="btn-nav-operators"
                onClick={() => { audio.playClick(); setActiveScreen('operators'); }}
                className="w-full flex items-center justify-between p-3.5 bg-slate-900/80 border border-white/5 rounded-xl hover:border-teal-400/30 text-xs text-left cursor-pointer transition-all hover:bg-slate-900"
              >
                <div className="flex items-center space-x-2.5">
                  <User className="w-4 h-4 text-teal-400" />
                  <div>
                    <span className="block font-bold leading-tight">BARACKS CODENAME</span>
                    <span className="block text-[8px] text-gray-400 font-mono mt-0.5">{selectedOperator.name}</span>
                  </div>
                </div>
              </button>

              <button
                id="btn-nav-weapons"
                onClick={() => { audio.playClick(); setActiveScreen('weapons'); }}
                className="w-full flex items-center justify-between p-3.5 bg-slate-900/80 border border-white/5 rounded-xl hover:border-teal-400/30 text-xs text-left cursor-pointer transition-all hover:bg-slate-900"
              >
                <div className="flex items-center space-x-2.5">
                  <Sliders className="w-4 h-4 text-[#52e3ff]" />
                  <div>
                    <span className="block font-bold leading-tight">TACTICAL CLASS</span>
                    <span className="block text-[8px] text-gray-400 font-mono mt-0.5">{selectedWeapon.name}</span>
                  </div>
                </div>
              </button>

              <button
                id="btn-nav-gunsmith"
                onClick={() => { audio.playClick(); setActiveScreen('gunsmith'); }}
                className="w-full flex items-center justify-between p-3.5 bg-slate-900/80 border border-white/5 rounded-xl hover:border-teal-400/30 text-xs text-left cursor-pointer transition-all hover:bg-slate-900"
              >
                <div className="flex items-center space-x-2.5">
                  <Layout className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="block font-bold leading-tight">GUNSMITH WORKBENCH</span>
                    <span className="block text-[8px] text-gray-400 font-mono mt-0.5">CUSTOM ATTACHMENTS</span>
                  </div>
                </div>
              </button>
            </div>

            {/* RIGHT EVENTS & CAMPAIGN FEED PANELS */}
            <div className="absolute right-6 top-20 bottom-24 w-52 flex flex-col justify-center space-y-2 pointer-events-auto z-10 select-none">
              <span className="text-[9px] font-mono tracking-widest text-[#52e3ff] block mb-1 text-right">OPERATIONS INTAKE</span>
              
              <div className="p-3 bg-slate-900/80 border border-white/5 rounded-xl text-left">
                <div className="flex items-center gap-1.5 text-[10px] text-yellow-500 font-bold mb-1.5 font-mono">
                  <Award className="w-3.5 h-3.5" /> DAILY COMBAT ORDERS
                </div>
                <div className="text-[9px] font-mono text-slate-300 space-y-1.5 leading-tight">
                  <div className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span>Target Target Shot 0/20</span>
                    <span className="text-[#52e3ff]">+250G</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Rank Points 1240/2000</span>
                    <span className="text-[#52e3ff]">+12% XP</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-900/80 border border-white/5 rounded-xl text-left">
                <div className="flex items-center gap-1.5 text-[10px] text-purple-400 font-bold mb-1 font-mono">
                  <Trophy className="w-3.5 h-3.5" /> SQUAD SEASON X BATTLE PASS
                </div>
                <div className="text-[8px] font-mono text-slate-400">UNRESTRICTED CLASSIFIED LEVEL 14</div>
                <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: '65%' }} />
                </div>
              </div>
            </div>

            {/* LOWER COGNIZANCE: MATCHMAKING GAME MODE MAP SELECTOR AND START INJECTOR */}
            <div className="absolute bottom-16 inset-x-6 h-20 flex pointer-events-auto items-center justify-between gap-4 z-10 select-none">
              {/* Left Selector: Map Thumbnail */}
              <div className="flex gap-4 items-center bg-slate-900/80 border border-white/5 p-2 rounded-xl backdrop-blur-md max-w-sm">
                <div>
                  <div className="w-16 h-12 rounded border border-white/10 flex items-center justify-center text-[10px] font-mono font-bold" style={{ backgroundColor: selectedMap.colorTheme === 'desert' ? '#FFC890' : selectedMap.colorTheme === 'urban' ? '#4D4B54' : selectedMap.colorTheme === 'industrial' ? '#3C403E' : '#1E351F' }}>
                    {selectedMap.name.split(' ')[0]}
                  </div>
                </div>
                <div className="font-mono text-[10px]">
                  <span className="text-gray-400 block tracking-widest leading-none">MAP SQUAD COURSE</span>
                  <select
                    id="lobby-map-dropdown"
                    value={selectedMapId}
                    onChange={(e) => { audio.playClick(); setSelectedMapId(e.target.value); }}
                    className="bg-transparent text-white font-bold text-xs mt-1 outline-none border border-white/10 rounded px-1 cursor-pointer py-0.5"
                  >
                    {MAPS_DATA.map(m => (
                      <option key={m.id} value={m.id} className="bg-[#0f1216]">{m.name} ({m.difficulty})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Big Red START MATCH Triggers */}
              <div className="flex items-center bg-slate-900/80 border border-white/5 p-2 rounded-xl backdrop-blur-md">
                <div className="font-mono text-right mr-4 leading-tight text-[10px]">
                  <span className="text-gray-400 block tracking-widest">TACTICAL MODE SELECTOR</span>
                  <select
                    id="lobby-mode-dropdown"
                    value={selectedModeId}
                    onChange={(e) => { audio.playClick(); setSelectedModeId(e.target.value); }}
                    className="bg-transparent text-white font-bold text-xs mt-1 outline-none border border-white/10 rounded px-1 cursor-pointer py-0.5 text-right"
                  >
                    {MODES_DATA.map(md => (
                      <option key={md.id} value={md.id} className="bg-[#0f1216]">{md.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  id="btn-matchmaker-trigger"
                  onClick={handleStartPracticeMatch}
                  className="bg-red-650 hover:bg-red-500 active:scale-95 text-xs text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-red-950/40 flex items-center space-x-2 cursor-pointer font-mono"
                >
                  <Play className="w-4 h-4 fill-white text-white" />
                  <span>START COMBAT RANGE</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Operators customization overlays */}
        {activeScreen === 'operators' && (
          <motion.div
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -200, opacity: 0 }}
            className="absolute inset-0 z-10"
          >
            <OperatorSelector
              selectedOperatorId={playerStats.selectedOperatorId}
              onSelectOperator={handleSelectOperator}
              onUpdateOperatorCustomization={handleUpdateOperatorCustomization}
              gold={playerStats.gold}
              onDeductGold={(amt) => setPlayerStats(prev => ({ ...prev, gold: prev.gold - amt }))}
              operators={operators}
            />
            {/* Standard BACK BUTTON to lobby */}
            <button
              id="back-lobby-operators"
              onClick={() => { audio.playClick(); setActiveScreen('lobby'); }}
              className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-slate-700 hover:text-teal-400 hover:border-teal-400 text-xs px-6 py-2 rounded-lg font-mono tracking-wider text-slate-300 z-20 pointer-events-auto shadow-lg"
            >
              APPLY AND EXIT TO LOBBY
            </button>
          </motion.div>
        )}

        {/* Weapons Catalog Selector overlays */}
        {activeScreen === 'weapons' && (
          <motion.div
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -200, opacity: 0 }}
            className="absolute inset-0 z-10"
          >
            <WeaponsSelector
              selectedWeaponId={playerStats.selectedWeaponId}
              onSelectWeapon={handleSelectWeapon}
              gold={playerStats.gold}
              onDeductGold={(amt) => setPlayerStats(prev => ({ ...prev, gold: prev.gold - amt }))}
              weapons={weapons}
              onUnlockWeapon={handleUnlockWeapon}
            />
            <button
              id="back-lobby-weapons"
              onClick={() => { audio.playClick(); setActiveScreen('lobby'); }}
              className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-slate-700 hover:text-teal-400 hover:border-teal-400 text-xs px-6 py-2 rounded-lg font-mono tracking-wider text-slate-300 z-20 pointer-events-auto shadow-lg"
            >
              APPLY AND EXIT TO LOBBY
            </button>
          </motion.div>
        )}

        {/* Gunsmith Workbench Full screen system */}
        {activeScreen === 'gunsmith' && (
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            className="absolute inset-0 z-15"
          >
            <Gunsmith3DView
              weapon={selectedWeapon}
              onModifyWeapon={handleModifyWeapon}
              gold={playerStats.gold}
              credits={playerStats.credits}
              onDeductGold={(amt) => setPlayerStats(prev => ({ ...prev, gold: prev.gold - amt }))}
              onDeductCredits={(amt) => setPlayerStats(prev => ({ ...prev, credits: prev.credits - amt }))}
            />
            <button
              id="back-lobby-gunsmith"
              onClick={() => { audio.playClick(); setActiveScreen('lobby'); }}
              className="absolute bottom-5 left-6 bg-slate-900 border border-slate-700 hover:text-teal-400 hover:border-teal-400 text-xs px-6 py-2 rounded-lg font-mono tracking-wider text-slate-300 z-20 shadow-lg"
            >
              SAVE CONFIGS AND FILE REPORTS
            </button>
          </motion.div>
        )}

        {/* Audio / Video and Custom HUD Sandbox setting panel */}
        {activeScreen === 'settings' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-20"
          >
            <SettingsPanel
              settings={settings}
              onSaveSettings={(updatedSetting) => setSettings(updatedSetting)}
              onResetLayout={() => setSettings(prev => ({ ...prev, hudLayout: [...INITIAL_SETTINGS.hudLayout] }))}
            />
            <button
              id="back-lobby-settings"
              onClick={() => { audio.playClick(); setActiveScreen('lobby'); }}
              className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-slate-700 hover:text-teal-400 hover:border-teal-400 text-xs px-8 py-2 rounded-lg font-mono tracking-wider text-slate-300 z-25 shadow-lg"
            >
              DEAL CONFIGURATION REPORTS
            </button>
          </motion.div>
        )}

        {/* Multiplayer Matchmaker queue overlay */}
        {activeScreen === 'matchmaker' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-30 bg-[#06080B] flex flex-col justify-between p-8 select-none"
          >
            {/* Top Details */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4 font-mono text-xs text-white/50">
              <div>
                <span className="block text-teal-400 font-bold uppercase tracking-widest">TACTICAL MATCHMAKER SUITE</span>
                <span className="block mt-0.5">ESTIMATED WAITING TIME: 0:12 SECS</span>
              </div>
              <div className="text-right">
                <span className="block text-white uppercase font-bold">{selectedMode.name}</span>
                <span className="block mt-0.5">{selectedMap.name}</span>
              </div>
            </div>

            {/* Central Queue Info */}
            <div className="max-w-md mx-auto text-center w-full">
              <Compass className="w-14 h-14 text-teal-400 animate-spin mx-auto mb-4" />
              <h2 className="text-lg font-serif font-bold tracking-tight text-white mb-1">
                ENLISTING VOLUNTEERS...
              </h2>
              <div className="text-xs text-slate-400 font-mono mb-6">
                SEARCHING MATCHMAKING CLUSTER :: ELAPSED 0:0{queueTime}S
              </div>

              {/* Loader Slider */}
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5 relative mb-6">
                <div className="bg-teal-400 h-full rounded-full transition-all duration-300" style={{ width: `${matchmakingProgress}%` }} />
              </div>

              {/* Lobby connected participants */}
              <div className="bg-slate-950 border border-white/5 rounded-xl p-4 text-left font-mono space-y-2">
                <div className="text-[9px] tracking-widest text-[#52e3ff]/85 block font-bold mb-1 border-b border-white/5 pb-1 uppercase">
                  Connected Operatives ({lobbyPlayers.length + 1} / 5)
                </div>
                
                {/* Me */}
                <div className="flex justify-between items-center text-xs text-white">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400" /> {playerStats.username} (YOU)
                  </div>
                  <span className="text-emerald-400 text-[10px] font-bold">14ms :: SQUAD-A</span>
                </div>

                {/* Others connected */}
                {lobbyPlayers.map((ply, index) => (
                  <div key={index} className="flex justify-between items-center text-xs text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse" /> {ply.name}
                    </div>
                    <span className="text-cyan-400 text-[10px]">{ply.ping}ms :: READY</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Exit actions */}
            <div className="flex justify-center border-t border-white/5 pt-4">
              <button
                id="cancel-matchmaker-btn"
                onClick={() => { audio.playClick(); setActiveScreen('lobby'); }}
                className="py-2.5 px-10 bg-red-650/30 border border-red-500/20 hover:bg-slate-900 text-red-100 text-xs font-mono font-bold uppercase rounded-lg"
              >
                ABORT SQUAD MATCHMAKER
              </button>
            </div>
          </motion.div>
        )}

        {/* 3D First Person Tactical Range gameplay wrapper */}
        {activeScreen === 'gameplay' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-40"
          >
            <Gameplay3DView
              operator={selectedOperator}
              weapon={selectedWeapon}
              selectedMap={selectedMap}
              selectedMode={selectedMode}
              settings={settings}
              onExitGame={handleFinishMatch}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE BOTTOM SCREEN NAVIGATION TABS BAR ACCORDING TO SPECS */}
      {activeScreen !== 'gameplay' && activeScreen !== 'matchmaker' && (
        <div className="absolute bottom-0 inset-x-0 h-14 bg-[#0A0C0E] border-t border-white/5 flex items-center justify-around px-8 z-20">
          <button
            id="nav-tab-lobby"
            onClick={() => { audio.playClick(); setActiveScreen('lobby'); }}
            className={`flex flex-col items-center justify-center font-mono text-[9px] ${activeScreen === 'lobby' ? 'text-teal-400 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            <Compass className="w-4 h-4 mb-0.5" />
            <span>HQ HOME</span>
          </button>

          <button
            id="nav-tab-arsenal"
            onClick={() => { audio.playClick(); setActiveScreen('weapons'); }}
            className={`flex flex-col items-center justify-center font-mono text-[9px] ${activeScreen === 'weapons' ? 'text-teal-400 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            <Sliders className="w-4 h-4 mb-0.5" />
            <span>ARSENAL</span>
          </button>

          <button
            id="nav-tab-gunsmith"
            onClick={() => { audio.playClick(); setActiveScreen('gunsmith'); }}
            className={`flex flex-col items-center justify-center font-mono text-[9px] ${activeScreen === 'gunsmith' ? 'text-teal-400 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            <Layout className="w-4 h-4 mb-0.5" />
            <span>GUNSMITH</span>
          </button>

          <button
            id="nav-tab-operators"
            onClick={() => { audio.playClick(); setActiveScreen('operators'); }}
            className={`flex flex-col items-center justify-center font-mono text-[9px] ${activeScreen === 'operators' ? 'text-teal-400 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            <User className="w-4 h-4 mb-0.5" />
            <span>OPERATORS</span>
          </button>

          <button
            id="nav-tab-friends"
            onClick={() => {
              audio.playClick();
              alert(`COMMUNICATIONS LINK STANDBY! Social squad chats offline during local practice range drills.`);
            }}
            className="flex flex-col items-center justify-center font-mono text-[9px] text-slate-400 hover:text-white"
          >
            <Users className="w-4 h-4 mb-0.5" />
            <span>SQUAD CLAN</span>
          </button>
        </div>
      )}

    </div>
  );
}
