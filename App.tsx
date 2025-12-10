import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Music2, RotateCcw, Layers, ListFilter, ArrowRight, Dices, Hand, Mic2, Sparkles, Volume2 } from 'lucide-react';

// --- 0. Color System (The Visual-Audio Link) ---
const INST_COLOR: Record<string, string> = {
    K: '#000000',   // Kick: Black
    S: '#ef4444',   // Snare: Red
    T1: '#3b82f6',  // Tom1: Blue
    T2: '#a855f7',  // Tom2: Purple
    F: '#22c55e',   // Floor: Green
    H: '#000000',   // HH: Black
    C: '#ef4444',   // Crash: Red
    R: '#3b82f6',   // Ride: Blue
    Ghost: '#94a3b8' // Ghost note: Gray/Slate
};

const BEATER_COLORS = {
    Red: '#ef4444',
    Blue: '#3b82f6',
    Green: '#22c55e',
    Purple: '#a855f7',
    Gray: '#64748b',
    Pink: '#ec4899',
    Orange: '#f97316',
    White: '#cbd5e1' 
};

// --- 1. Groove Definitions ---

const CATEGORIES: Record<string, { label: string; color: string }> = {
  'Lv1': { label: 'Lv.1｜8 Beat Basic (流行搖滾基礎)', color: 'text-cyan-400' },
  'Lv2': { label: 'Lv.2｜8 Beat Variations (底鼓變化)', color: 'text-cyan-500' },
  'Lv3': { label: 'Lv.3｜16 Beat Basic (密集律動)', color: 'text-blue-400' },
  'Lv4': { label: 'Lv.4｜16 Beat Variations (切分應用)', color: 'text-blue-500' },
  'Lv5': { label: 'Lv.5｜Funk Basic (放克入門)', color: 'text-purple-400' },
  'Lv6': { label: 'Lv.6｜Funk Advanced (深度切分)', color: 'text-purple-500' },
  'Lv7': { label: 'Lv.7｜Linear Groove (線性手法)', color: 'text-pink-400' },
  'Lv8': { label: 'Lv.8｜Shuffle & Blues (藍調搖擺)', color: 'text-indigo-400' },
  'Lv9': { label: 'Lv.9｜Jazz & Odd Time (爵士與奇數拍)', color: 'text-yellow-400' },
  'Lv10': { label: 'Lv.10｜J-POP & Fast Rock (日系疾走)', color: 'text-orange-500' },
  'Lv11': { label: 'Lv.11｜Double Pedal (金屬雙踏)', color: 'text-red-600' },
  'Lv12': { label: 'Lv.12｜Master Class (大師綜合)', color: 'text-emerald-400' },
  'Lv13': { label: 'Lv.13｜Dream Theater Challenge (前衛金屬神殿)', color: 'text-yellow-500' },
};

type Instrument = 'K' | 'K2' | 'S' | 'S_G' | 'S_R' | 'H' | 'O' | 'R' | 'C' | 'T1' | 'T2' | 'F' | '.';
type Pattern = {
    cat: string;
    name: string;
    bpm: number;
    lv: number;
    meter: number[];
    gridSize: number;
    steps: Instrument[][];
    isVariation?: boolean;
};

const generateGrooves = () => {
    let patterns: Record<string, Pattern> = {};
    let idCounter = 0;

    const initSteps = (size: number) => Array(size).fill(null).map(() => []);

    const add = (cat: string, name: string, bpm: number, gridSize: number, meter: number[], builder: (s: Instrument[][]) => void) => {
        const steps = initSteps(gridSize);
        builder(steps);
        for(let i=0; i<gridSize; i++) if(steps[i].length===0) steps[i].push('.');
        patterns[`p_${++idCounter}`] = { cat, name, bpm, lv: parseInt(cat.replace('Lv','')), meter, gridSize, steps };
    };

    // Helpers
    const hh8 = (s: Instrument[][]) => { for(let i=0; i<s.length; i+=2) s[i].push('H'); };
    const hh16 = (s: Instrument[][]) => { for(let i=0; i<s.length; i++) s[i].push('H'); };
    const sn44 = (s: Instrument[][]) => { if(s.length > 4) s[4].push('S'); if(s.length > 12) s[12].push('S'); }; 

    // --- LV.1: 8 Beat Basic ---
    add('Lv1', 'Money Beat (Michael Jackson - Billie Jean)', 117, 16, [4,4], s => {
        hh8(s); sn44(s); s[0].push('K'); s[8].push('K'); 
    });
    add('Lv1', 'We Will Rock You (Queen)', 82, 16, [4,4], s => {
        s[0].push('K'); s[2].push('K'); s[4].push('S'); 
        s[8].push('K'); s[10].push('K'); s[12].push('S');
    });
    add('Lv1', 'Slow Rock Ballad (Coldplay - Yellow)', 87, 16, [4,4], s => {
        for(let i=0; i<16; i+=2) s[i].push('O'); 
        sn44(s); s[0].push('K'); s[8].push('K'); s[10].push('K');
    });

    // --- LV.2: 8 Beat Variations ---
    add('Lv2', 'Smells Like Teen Spirit (Nirvana)', 110, 16, [4,4], s => {
        s[0].push('K'); s[0].push('C'); s[2].push('K'); s[4].push('S'); s[4].push('H');
        s[6].push('K'); s[7].push('K'); s[8].push('C'); s[8].push('K'); 
        s[12].push('S'); s[12].push('H'); s[14].push('K');
    });
    add('Lv2', 'Offbeat Kick (Disco Feel)', 120, 16, [4,4], s => {
        hh8(s); sn44(s); s[0].push('K'); s[6].push('K'); s[10].push('K');
    });
    add('Lv2', 'Anticipation (Red Hot Chili Peppers)', 100, 16, [4,4], s => {
        hh8(s); sn44(s); s[0].push('K'); s[8].push('K'); s[14].push('K');
    });

    // --- LV.3: 16 Beat Basic ---
    add('Lv3', '16 Beat Ballad (One Handed)', 75, 16, [4,4], s => {
        hh16(s); sn44(s); s[0].push('K'); s[3].push('K'); s[8].push('K');
    });
    add('Lv3', 'Tom Sawyer (Rush) - Main Groove', 88, 16, [4,4], s => {
        hh16(s); sn44(s); s[0].push('K'); s[2].push('K'); s[6].push('K'); s[11].push('K'); s[15].push('O');
    });
    add('Lv3', 'Two-Handed 16th (RLRL)', 95, 16, [4,4], s => {
        for(let i=0; i<16; i++) s[i].push('H');
        s[4].push('S'); s[12].push('S'); s[0].push('K'); s[8].push('K');
    });

    // --- LV.4: 16 Beat Variations ---
    add('Lv4', 'Funk Rock (Chad Smith Style)', 105, 16, [4,4], s => {
        hh16(s); sn44(s); s[0].push('K'); s[8].push('K'); s[11].push('K'); s[14].push('K');
    });
    add('Lv4', 'Rosanna (Toto) - The Ghost Notes', 86, 16, [4,4], s => {
        hh16(s); s[4].push('S'); s[12].push('S');
        s[0].push('K'); s[10].push('K');
        [1,3,5,9,13].forEach(i=>s[i].push('S_G'));
    });
    add('Lv4', 'Jungle/DnB Basic', 170, 16, [4,4], s => {
        s[0].push('C'); s[0].push('K'); s[4].push('S'); 
        s[7].push('S_G'); s[9].push('S_G'); s[10].push('K'); s[12].push('S');
        for(let i=0; i<16; i+=2) s[i].push('R');
    });

    // --- LV.5: Funk Basic ---
    add('Lv5', 'Funky Drummer (James Brown)', 98, 16, [4,4], s => {
        hh16(s); s[0].push('K'); s[2].push('K'); s[4].push('S'); s[10].push('K'); s[12].push('S');
        [1,5,6,9,13,15].forEach(i=>s[i].push('S_G'));
    });
    add('Lv5', 'Chameleon (Herbie Hancock)', 95, 16, [4,4], s => {
        hh16(s); s[0].push('K'); s[4].push('S'); s[11].push('K'); s[12].push('S');
        s[1].push('S_G'); s[15].push('S_G');
    });
    add('Lv5', 'Superstition (Stevie Wonder)', 100, 16, [4,4], s => {
        hh16(s); s[0].push('K'); s[4].push('S'); s[8].push('K'); s[12].push('S');
        s[2].push('K'); s[14].push('K');
    });

    // --- LV.6: Funk Advanced ---
    add('Lv6', 'Linear Funk (Tower of Power)', 106, 16, [4,4], s => {
        s[0].push('K'); s[1].push('S'); s[3].push('S'); s[4].push('K');
        s[6].push('K'); s[7].push('S'); s[9].push('S'); s[10].push('K');
        s[12].push('K'); s[13].push('S'); s[15].push('S');
    });
    add('Lv6', '50 Ways to Leave Your Lover (Steve Gadd)', 90, 16, [4,4], s => {
        s[0].push('K'); s[0].push('H'); s[1].push('S_G'); s[2].push('H'); s[3].push('O');
        s[4].push('S'); s[6].push('K'); s[7].push('S_G'); 
        s[8].push('K'); s[8].push('H'); s[9].push('S_G'); s[10].push('H'); s[11].push('O');
        s[12].push('S'); s[14].push('K'); s[15].push('S_G');
    });

    // --- LV.7: Linear Groove ---
    add('Lv7', 'Gospel Chops Basic (R L K)', 110, 12, [12,8], s => {
        [0,3,6,9].forEach(i=>s[i].push('R'));
        [1,4,7,10].forEach(i=>s[i].push('S'));
        [2,5,8,11].forEach(i=>s[i].push('K'));
    });
    add('Lv7', 'Linear Fill Application (R K L K)', 120, 16, [4,4], s => {
        s[0].push('R'); s[1].push('K'); s[2].push('S'); s[3].push('K');
        s[4].push('R'); s[5].push('K'); s[6].push('S'); s[7].push('K');
        s[8].push('C'); s[12].push('S');
    });

    // --- LV.8: Shuffle & Blues ---
    add('Lv8', 'Rosanna Shuffle (Toto) - Half Time', 130, 12, [12,8], s => {
        for(let i=0; i<12; i++) s[i].push('H');
        s[6].push('S'); 
        s[0].push('K'); s[8].push('K');
        [0,2,3,5,8,9,11].forEach(i=>s[i].push('S_G')); 
    });
    add('Lv8', 'La Grange (ZZ Top)', 160, 12, [12,8], s => {
        for(let i=0; i<12; i+=3) { s[i].push('R'); s[i+2].push('R'); }
        s[3].push('S'); s[9].push('S'); s[3].push('R'); s[9].push('R');
        s[0].push('K'); s[6].push('K');
    });

    // --- LV.9: Jazz & Odd Time ---
    add('Lv9', 'Take Five (Dave Brubeck) - 5/4 Swing', 160, 20, [5,4], s => {
        [0,3,4,6,9,12,15,16,18].forEach(i=>s[i].push('R'));
        s[6].push('S'); s[18].push('S'); 
        s[0].push('K'); s[12].push('K');
        [3,9,15].forEach(i=>s[i].push('H')); 
    });
    add('Lv9', 'Jazz Swing (Standard)', 140, 12, [12,8], s => {
        [0,3,4,6,9,10].forEach(i=>s[i].push('R'));
        s[3].push('H'); s[9].push('H'); 
    });

    // --- LV.10: J-POP & Fast Rock ---
    add('Lv10', 'IDOL (YOASOBI) - Dance Beat', 166, 16, [4,4], s => {
        [0,4,8,12].forEach(i=>s[i].push('K'));
        s[4].push('S'); s[12].push('S');
        for(let i=0; i<16; i+=2) s[i].push('H');
        s[2].push('O'); s[10].push('O'); 
        s[7].push('S_G'); s[15].push('S_G'); 
    });
    add('Lv10', 'Yoru ni Kakeru (YOASOBI)', 130, 16, [4,4], s => {
        hh8(s); sn44(s);
        s[0].push('K'); s[3].push('K'); s[6].push('K'); s[10].push('K'); s[11].push('K');
        s[15].push('O');
    });
    add('Lv10', 'Pretender (Official HIGE DANdism)', 92, 16, [4,4], s => {
        hh16(s); sn44(s);
        s[0].push('K'); s[8].push('K'); s[11].push('K'); s[14].push('K');
        s[2].push('S_G'); s[6].push('S_G');
    });

    // --- LV.11: Double Pedal ---
    add('Lv11', 'Painkiller (Judas Priest) - Intro', 100, 16, [4,4], s => {
        s[0].push('C'); s[4].push('S'); s[8].push('C'); s[12].push('S');
        for(let i=0; i<16; i++) s[i].push(i%2===0?'K':'K2');
    });
    add('Lv11', 'Bleed (Meshuggah) - Herta Pattern', 115, 16, [4,4], s => {
        s[0].push('K'); s[1].push('K2'); s[2].push('K'); 
        s[4].push('S'); s[4].push('C');
        s[6].push('K'); s[7].push('K2'); s[8].push('K');
        s[12].push('S'); s[12].push('C');
        for(let i=0; i<16; i+=2) s[i].push('H');
    });

    // --- LV.12: Master Class ---
    add('Lv12', 'Seven Days (Sting) - 5/4 Groove', 100, 20, [5,4], s => {
        s[0].push('H'); s[0].push('K'); 
        s[4].push('H'); s[4].push('S'); 
        s[8].push('H'); s[8].push('K'); 
        s[10].push('K'); 
        s[12].push('H'); s[14].push('S'); 
        s[16].push('H'); 
    });
    add('Lv12', 'Schism (Tool) - 12/8 Variation', 105, 12, [12,8], s => {
        s[0].push('K'); s[2].push('K'); s[4].push('S');
        s[5].push('K'); s[7].push('K'); s[9].push('S'); s[10].push('K');
        for(let i=0; i<12; i++) s[i].push('H');
    });

    // --- LV.13: Dream Theater Challenge ---
    add('Lv13', '6:00 (Intro) - The Bell Groove', 100, 16, [4,4], s => {
        [0,2,4,6,8,10,12,14].forEach(i => s[i].push('R')); 
        s[4].push('S'); s[12].push('S'); 
        s[0].push('K'); s[3].push('K'); s[10].push('K'); 
        s[7].push('S_G'); s[9].push('S_G'); s[15].push('S_G');
    });

    add('Lv13', 'Metropolis Pt. 1 (7/8 Main Riff)', 130, 14, [7,8], s => {
        s[0].push('C'); s[0].push('K');
        s[2].push('S'); 
        s[4].push('K'); s[6].push('K');
        s[8].push('S');
        s[10].push('K');
        s[12].push('S_G');
        for(let i=0; i<14; i+=2) s[i].push('H');
    });

    add('Lv13', 'Under a Glass Moon (Funky Metal)', 106, 16, [4,4], s => {
        s[0].push('K'); s[3].push('K'); s[8].push('K'); s[11].push('K');
        s[4].push('S'); s[12].push('S');
        for(let i=0; i<16; i+=2) s[i].push('R');
        s[1].push('S_G'); s[5].push('S_G'); s[9].push('S_G'); s[13].push('S_G');
    });

    add('Lv13', 'Pull Me Under (Main Groove)', 102, 16, [4,4], s => {
        s[0].push('K'); s[3].push('K'); s[8].push('K'); s[10].push('K');
        s[4].push('S'); s[12].push('S');
        for(let i=0; i<16; i+=2) s[i].push('H');
        s[15].push('O');
    });

    add('Lv13', 'The Dance of Eternity (7/8 Chaos)', 140, 14, [7,8], s => {
        s[0].push('K'); s[0].push('C');
        s[2].push('S'); s[4].push('K'); s[6].push('K');
        s[8].push('S'); s[10].push('T1'); s[12].push('T2');
    });

    add('Lv13', 'Panic Attack (5/4 Double Bass)', 140, 20, [5,4], s => {
        for(let i=0; i<20; i++) s[i].push(i%2===0 ? 'K' : 'K2');
        s[4].push('S'); s[12].push('S'); 
        s[16].push('C'); 
        s[0].push('C');
    });

    add('Lv13', 'Constant Motion (Shuffle Metal)', 150, 16, [4,4], s => {
        s[0].push('K'); s[2].push('K'); s[4].push('S');
        s[6].push('K'); s[8].push('K'); s[10].push('K'); s[12].push('S');
        s[0].push('C'); s[8].push('C');
    });

    add('Lv13', 'The Glass Prison (Stamina Test)', 145, 16, [4,4], s => {
        for(let i=0; i<16; i++) s[i].push(i%2===0 ? 'K' : 'K2');
        s[4].push('S'); s[12].push('S');
        s[0].push('R'); s[2].push('R'); s[4].push('R'); s[6].push('R');
        s[8].push('C'); s[10].push('R'); s[12].push('R'); s[14].push('R');
    });

    add('Lv13', 'Erotomania (5/4 Groove)', 140, 20, [5,4], s => {
        s[0].push('K'); s[4].push('S'); s[8].push('K'); s[10].push('K');
        s[12].push('S'); s[16].push('K'); s[18].push('S_G');
        for(let i=0; i<20; i+=2) s[i].push('H');
        s[19].push('O');
    });

    add('Lv13', 'Finally Free (The Outro Fill)', 100, 16, [4,4], s => {
        s[0].push('S'); s[1].push('T1'); s[2].push('K'); s[3].push('K');
        s[4].push('S'); s[5].push('T2'); s[6].push('K'); s[7].push('K');
        s[8].push('S'); s[9].push('F'); s[10].push('K'); s[11].push('K');
        s[12].push('C'); s[12].push('K');
    });

    return patterns;
};

const DRUM_PATTERNS = generateGrooves();

// --- Audio Engine ---
const AudioEngine = {
  ctx: null as AudioContext | null,
  masterGain: null as GainNode | null,
  reverbNode: null as ConvolverNode | null,
  reverbGain: null as GainNode | null,
  volDrums: 0.8,
  
  init: () => {
    if (!AudioEngine.ctx) {
      AudioEngine.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      AudioEngine.setupMixer();
    }
    if (AudioEngine.ctx.state === 'suspended') AudioEngine.ctx.resume();
  },

  setupMixer: () => {
      const ctx = AudioEngine.ctx!;
      AudioEngine.masterGain = ctx.createGain();
      AudioEngine.masterGain.connect(ctx.destination);
      
      AudioEngine.reverbNode = ctx.createConvolver();
      AudioEngine.reverbGain = ctx.createGain();
      AudioEngine.reverbGain.gain.value = 0.3; 

      const sampleRate = ctx.sampleRate;
      const length = sampleRate * 2.0; 
      const impulse = ctx.createBuffer(2, length, sampleRate);
      const left = impulse.getChannelData(0);
      const right = impulse.getChannelData(1);
      
      for(let i=0; i<length; i++) {
          const decay = Math.pow(1 - i / length, 3);
          left[i] = (Math.random() * 2 - 1) * decay;
          right[i] = (Math.random() * 2 - 1) * decay;
      }
      
      AudioEngine.reverbNode.buffer = impulse;
      AudioEngine.reverbNode.connect(AudioEngine.reverbGain);
      AudioEngine.reverbGain.connect(AudioEngine.masterGain);
  },

  connectToOutput: (node: AudioNode) => {
      if(AudioEngine.masterGain) {
          node.connect(AudioEngine.masterGain);
          if(AudioEngine.reverbNode) {
              node.connect(AudioEngine.reverbNode);
          }
      } else {
          node.connect(AudioEngine.ctx!.destination);
      }
  },

  playClick: (isAccent: boolean, time?: number) => {
     if (!AudioEngine.ctx) AudioEngine.init();
     const ctx = AudioEngine.ctx!;
     const t = time || ctx.currentTime;
     const osc = ctx.createOscillator();
     const gain = ctx.createGain();
     
     osc.frequency.setValueAtTime(isAccent ? 1200 : 800, t);
     osc.type = 'square';
     gain.gain.setValueAtTime(0.3, t);
     gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
     
     osc.connect(gain);
     gain.connect(ctx.destination);
     osc.start(t); osc.stop(t+0.1);
  },

  playTone: (freq: number, decay: number, type: OscillatorType='sine', vol=1, time?: number) => {
      if (!AudioEngine.ctx) AudioEngine.init();
      const ctx = AudioEngine.ctx!;
      const t = time || ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(vol * AudioEngine.volDrums, t + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, t + decay);
      osc.connect(gain); 
      AudioEngine.connectToOutput(gain);
      osc.start(t); osc.stop(t+decay);
  },

  playNoise: (filterFreq: number, decay: number, vol=1, q=1, time?: number) => {
      if (!AudioEngine.ctx) AudioEngine.init();
      const ctx = AudioEngine.ctx!;
      const t = time || ctx.currentTime;
      const bufferSize = ctx.sampleRate * decay;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass'; 
      filter.frequency.value = filterFreq;
      filter.Q.value = q;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(vol * AudioEngine.volDrums, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + decay);
      noise.connect(filter); filter.connect(gain); 
      AudioEngine.connectToOutput(gain);
      noise.start(t);
  },

  trigger: (type: Instrument, time?: number) => {
      switch(type) {
          case 'K': case 'K2': 
              AudioEngine.playTone(130, 0.3, 'sine', 1.2, time); 
              AudioEngine.playNoise(2000, 0.05, 0.5, 1, time); 
              break;
          case 'S': AudioEngine.playNoise(2000, 0.25, 1.0, 0.5, time); AudioEngine.playTone(180, 0.1, 'triangle', 0.6, time); break;
          case 'S_G': AudioEngine.playNoise(2000, 0.1, 0.3, 0.5, time); break;
          case 'S_R': AudioEngine.playTone(600, 0.05, 'square', 0.8, time); break; 
          case 'H': AudioEngine.playNoise(5000, 0.05, 0.7, 0.2, time); break;
          case 'O': AudioEngine.playNoise(5000, 0.4, 0.7, 0.2, time); break;
          case 'R': AudioEngine.playNoise(4000, 0.6, 0.5, 1, time); AudioEngine.playTone(500, 0.6, 'sine', 0.2, time); break;
          case 'C': AudioEngine.playNoise(3500, 1.5, 0.8, 0.5, time); break;
          case 'T1': AudioEngine.playTone(200, 0.35, 'sine', 0.9, time); break;
          case 'T2': AudioEngine.playTone(150, 0.45, 'sine', 0.9, time); break;
          case 'F': AudioEngine.playTone(100, 0.55, 'sine', 1.0, time); break;
          default: break;
      }
  }
};

// --- UI Components ---

const ControlPanel = ({ 
  isPlaying, togglePlay, bpm, setBpm,
  patternKey, changePattern, pendingPatternKey,
  preCount, setPreCount,
  showBeatIndicators, setShowBeatIndicators,
  speedRate, setSpeedRate,
  onRandom, onVariation,
  metronome, setMetronome
}: any) => {
  const effectiveBpm = Math.round(bpm * speedRate);

  return (
    <div className="h-full bg-slate-900 text-slate-100 flex flex-col p-4 relative font-sans border-r border-slate-700 select-none">
      <div className="flex-none mb-4">
            <div className="flex flex-col gap-2 mb-3">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <Music2 size={28} className="text-amber-500" />
                     <div className="flex items-baseline">
                        <span className="font-black text-2xl text-white tracking-wider leading-none">DrumMaster</span>
                        <span className="text-[10px] text-amber-500 font-bold uppercase tracking-[0.2em] ml-2">V30 Pro</span>
                     </div>
                  </div>
                  {pendingPatternKey && pendingPatternKey !== patternKey && (
                    <div className="text-xs text-amber-400 flex items-center gap-1 font-bold animate-pulse bg-amber-950/50 px-2 py-1 rounded border border-amber-900/50">
                        <ArrowRight size={12}/> NEXT: {DRUM_PATTERNS[pendingPatternKey].name}
                    </div>
                  )}
              </div>
            </div>
            
            <div className="flex gap-2 h-12">
              <div className="relative flex-1 h-full">
                <select 
                    value={patternKey}
                    onChange={(e) => changePattern(e.target.value)}
                    className="w-full h-full bg-slate-800 text-slate-100 border border-slate-600 rounded-l-lg px-4 text-lg font-bold focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer hover:bg-slate-750 appearance-none"
                >
                    {Object.keys(CATEGORIES).map(catKey => (
                        <optgroup key={catKey} label={CATEGORIES[catKey as keyof typeof CATEGORIES].label}>
                            {Object.entries(DRUM_PATTERNS)
                                .filter(([_, p]) => p.cat === catKey)
                                .sort((a, b) => a[1].lv - b[1].lv)
                                .map(([k, p]) => (
                                    <option key={k} value={k}>
                                        {p.name}
                                    </option>
                                ))}
                        </optgroup>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><ListFilter size={20}/></div>
              </div>
              
              <button onClick={onVariation} className="h-full bg-slate-700 hover:bg-purple-600 text-white px-3 border border-l-0 border-r border-slate-600 transition-colors" title="即興變奏 (Shift+Space)">
                  <Sparkles size={24}/>
              </button>
              
              <button onClick={onRandom} className="h-full bg-slate-700 hover:bg-amber-600 text-white px-3 rounded-r-lg border border-l-0 border-slate-600 transition-colors" title="隨機曲風 (Ctrl+Space)">
                  <Dices size={24}/>
              </button>
            </div>
      </div>

      <div className="flex-none bg-slate-800 rounded-xl p-4 border border-slate-700 mb-4 shadow-xl">
          <div className="flex justify-between items-end mb-3">
              <div className="flex items-baseline gap-2">
                  <div className="text-6xl font-black text-amber-400 leading-none tracking-tighter">{effectiveBpm}</div>
                  <div className="text-sm text-slate-400 font-bold uppercase tracking-widest">BPM</div>
              </div>
              <div className="flex flex-col items-end">
                   <input type="range" min="40" max="220" value={bpm} onChange={e=>setBpm(Number(e.target.value))} className="w-32 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-amber-500"/>
              </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-between">
              {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(rate => (
                  <button key={rate} onClick={() => setSpeedRate(rate)} className={`flex-1 min-w-[3rem] text-sm py-2 rounded-md font-black border transition-all transform hover:scale-105 ${speedRate === rate ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-900/50' : 'bg-slate-700 text-slate-400 border-slate-600 hover:bg-slate-600'}`}>{rate * 100}%</button>
              ))}
          </div>
      </div>

      <button onClick={togglePlay} className={`flex-none w-full py-5 rounded-xl font-black text-2xl flex items-center justify-center gap-3 shadow-xl transition-all mb-4 transform active:scale-[0.98] ${isPlaying ? 'bg-gradient-to-r from-red-600 to-red-500 text-white ring-2 ring-red-400' : 'bg-gradient-to-r from-amber-600 to-orange-500 text-white hover:from-amber-500 hover:to-orange-400'}`}>
        {isPlaying ? <Square fill="currentColor" size={28} /> : <Play fill="currentColor" size={28} />}
        {isPlaying ? 'STOP (SPACE)' : 'START (SPACE)'}
      </button>

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 content-start">
         <div className="flex w-full gap-2">
            <button onClick={() => setPreCount(preCount ? 0 : 4)} className={`flex-1 h-12 rounded-lg border flex items-center justify-center gap-2 transition-colors ${preCount ? 'bg-blue-900/30 border-blue-500 text-blue-200' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                <RotateCcw size={18}/>
                <span className="text-xs font-bold whitespace-nowrap">預備拍 (1)</span>
            </button>
            <button onClick={() => setShowBeatIndicators(!showBeatIndicators)} className={`flex-1 h-12 rounded-lg border flex items-center justify-center gap-2 transition-colors ${showBeatIndicators ? 'bg-teal-900/30 border-teal-500 text-teal-200' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                <Layers size={18}/>
                <span className="text-xs font-bold whitespace-nowrap">顯示拍子 (2)</span>
            </button>
            <button onClick={() => setMetronome(!metronome)} className={`flex-1 h-12 rounded-lg border flex items-center justify-center gap-2 transition-colors ${metronome ? 'bg-pink-900/30 border-pink-500 text-pink-200' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                <Mic2 size={18}/>
                <span className="text-xs font-bold whitespace-nowrap">節拍器 (3)</span>
            </button>
         </div>
      </div>
    </div>
  );
};

const UpperBodyView = ({ isPlaying, instruments }: any) => {
  const isRH = isPlaying && (instruments.H || instruments.O || instruments.R || instruments.C); 
  const isLH = isPlaying && (instruments.S || instruments.S_G || instruments.S_R || instruments.C); 
  const isK = isPlaying && (instruments.K || instruments.K2);
  
  const hit = (type: Instrument) => (e: any) => { e.stopPropagation(); AudioEngine.trigger(type); };

  const Legend = ({x, y, text}: {x: number, y: number, text: string}) => (
      <text x={x} y={y} fontSize="11" textAnchor="middle" fill="#94a3b8" fontWeight="bold">
          {text}
      </text>
  );

  return (
    <div className="relative w-full h-full bg-slate-50 flex items-center justify-center border-b border-r border-slate-300 overflow-hidden">
       <div className="absolute top-2 left-2 z-10 px-3 py-1 rounded-full text-xs font-black text-slate-600 border border-slate-300 bg-white/90 shadow-sm flex items-center gap-1">
           <Hand size={12}/> INTERACTIVE KIT
       </div>
       <svg viewBox="0 0 500 350" className="w-full h-full max-w-2xl select-none drop-shadow-xl z-10">
          
          <g transform="translate(250, 220)" onClick={hit('K')} className="cursor-pointer hover:brightness-110 active:scale-95">
              <g style={{ transform: isK ? 'scale(0.98)' : 'scale(1)', transition: 'transform 0.05s' }}>
                <circle cx="0" cy="0" r="80" fill={isK ? INST_COLOR.K : '#e2e8f0'} stroke={INST_COLOR.K} strokeWidth="4" />
                <text x="0" y="5" fontSize="12" textAnchor="middle" fill={isK ? 'white' : INST_COLOR.K} opacity="0.8">KICK</text>
                <Legend x={0} y={20} text="(●)" />
              </g>
          </g>

           <g transform="translate(340, 240)" onClick={hit('F')} className="cursor-pointer hover:brightness-110 active:scale-95">
              <g style={{ transform: instruments.F ? 'scale(0.98)' : 'scale(1)', transition: 'transform 0.05s' }}>
                <ellipse cx="0" cy="0" rx="50" ry="45" fill={instruments.F ? INST_COLOR.F : '#f0fdf4'} stroke={INST_COLOR.F} strokeWidth="4" />
                <text x="0" y="5" fontSize="10" textAnchor="middle" fill={instruments.F?'white':INST_COLOR.F} opacity="0.8">FLOOR</text>
                <Legend x={0} y={18} text="(●)" />
              </g>
          </g>

          <g transform="translate(210, 140)" onClick={hit('T1')} className="cursor-pointer hover:brightness-110 active:scale-95">
              <g style={{ transform: instruments.T1 ? 'scale(0.98)' : 'scale(1)', transition: 'transform 0.05s' }}>
                <ellipse cx="0" cy="0" rx="40" ry="35" fill={instruments.T1 ? INST_COLOR.T1 : '#eff6ff'} stroke={INST_COLOR.T1} strokeWidth="4" />
                <text x="0" y="5" fontSize="10" textAnchor="middle" fill={instruments.T1?'white':INST_COLOR.T1} opacity="0.8">T1</text>
                <Legend x={0} y={18} text="(●)" />
              </g>
          </g>
          
          <g transform="translate(290, 150)" onClick={hit('T2')} className="cursor-pointer hover:brightness-110 active:scale-95">
              <g style={{ transform: instruments.T2 ? 'scale(0.98)' : 'scale(1)', transition: 'transform 0.05s' }}>
                <ellipse cx="0" cy="0" rx="42" ry="38" fill={instruments.T2 ? INST_COLOR.T2 : '#faf5ff'} stroke={INST_COLOR.T2} strokeWidth="4" />
                <text x="0" y="5" fontSize="10" textAnchor="middle" fill={instruments.T2?'white':INST_COLOR.T2} opacity="0.8">T2</text>
                <Legend x={0} y={18} text="(●)" />
              </g>
          </g>

          <g transform="translate(160, 240)" onClick={hit('S')} className="cursor-pointer hover:brightness-110 active:scale-95">
              <g style={{ transform: isLH ? 'scale(0.98)' : 'scale(1)', transition: 'transform 0.05s' }}>
                <ellipse cx="0" cy="0" rx="48" ry="42" fill={isLH ? INST_COLOR.S : '#fef2f2'} stroke={INST_COLOR.S} strokeWidth="4" />
                <text x="0" y="5" fontSize="10" textAnchor="middle" fill={isLH?'white':INST_COLOR.S} opacity="0.8">SNARE</text>
                <Legend x={0} y={18} text="(●)" />
              </g>
          </g>

          <g transform="translate(90, 140)" onClick={hit('H')} className="cursor-pointer hover:brightness-110 active:scale-95">
              <line x1="0" y1="0" x2="0" y2="180" stroke="#333" strokeWidth="4" />
              <g style={{ transform: isRH ? 'rotate(5deg)' : 'rotate(0)', transition: 'transform 0.05s' }}>
                  <ellipse cx="0" cy="0" rx="55" ry="15" fill={instruments.H || instruments.O ? INST_COLOR.H : '#f1f5f9'} stroke={INST_COLOR.H} strokeWidth="3" />
                  <text x="0" y="5" fontSize="10" textAnchor="middle" fill={instruments.H || instruments.O?'white':'#475569'} opacity="0.8">HH(X)</text>
              </g>
          </g>
          
          <g transform="translate(140, 80)" onClick={hit('C')} className="cursor-pointer hover:brightness-110 active:scale-95">
              <g style={{ transform: instruments.C ? 'rotate(-8deg) scale(1.1)' : 'rotate(0)', transition: 'transform 0.1s' }}>
                  <ellipse cx="0" cy="0" rx="58" ry="16" fill={instruments.C ? INST_COLOR.C : '#fef2f2'} stroke={INST_COLOR.C} strokeWidth="3" />
                  <text x="0" y="5" fontSize="10" textAnchor="middle" fill={instruments.C?'white':INST_COLOR.C} opacity="0.8">CRASH(X)</text>
              </g>
          </g>
          
          <g transform="translate(390, 100)" onClick={hit('R')} className="cursor-pointer hover:brightness-110 active:scale-95">
              <g style={{ transform: (instruments.R) ? 'rotate(5deg)' : 'rotate(0)', transition: 'transform 0.05s' }}>
                  <ellipse cx="0" cy="0" rx="60" ry="18" fill={instruments.R ? INST_COLOR.R : '#eff6ff'} stroke={INST_COLOR.R} strokeWidth="3" />
                  <path d="M-50,0 L-40,0" stroke={instruments.R?'white':INST_COLOR.R} strokeWidth="1" /> 
                  <path d="M40,0 L50,0" stroke={instruments.R?'white':INST_COLOR.R} strokeWidth="1" />
                  <text x="0" y="5" fontSize="10" textAnchor="middle" fill={instruments.R?'white':INST_COLOR.R} opacity="0.8">RIDE(X)</text>
              </g>
          </g>
       </svg>
    </div>
  );
};

const PedalView = ({ isPlaying, instruments, pedalMode, setPedalMode, beaterColor, setBeaterColor }: any) => {
  const isK1 = isPlaying && (instruments.K || (pedalMode === 'single' && instruments.K2));
  const isK2 = isPlaying && instruments.K2; 
  const colorHex = BEATER_COLORS[beaterColor as keyof typeof BEATER_COLORS] || BEATER_COLORS.Red;
  
  return (
    <div className="relative w-full h-full bg-gray-200 flex flex-col items-center justify-center border-t border-r border-slate-300 overflow-hidden">
      <div className="absolute top-2 left-2 z-10 flex flex-col items-start gap-2">
         <div className="flex gap-2">
            <div className="px-3 py-1 rounded-full text-xs font-bold text-slate-600 border border-slate-300 bg-white/90 shadow">PRO PEDAL CAM</div>
            <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-600">
                <button onClick={() => setPedalMode('single')} className={`px-2 py-0.5 text-[10px] font-bold rounded ${pedalMode==='single' ? 'bg-amber-500 text-white' : 'text-slate-400'}`}>Single (`)</button>
                <button onClick={() => setPedalMode('double')} className={`px-2 py-0.5 text-[10px] font-bold rounded ${pedalMode==='double' ? 'bg-amber-500 text-white' : 'text-slate-400'}`}>Double (`)</button>
            </div>
         </div>
      </div>
      
      <svg viewBox="0 0 400 300" className="w-full h-full max-w-lg">
         <circle cx="200" cy="80" r="90" fill="#f8fafc" stroke="#334155" strokeWidth="6" />
         <g transform="translate(200, 80)">
             <rect x="-35" y="-15" width="70" height="30" fill="none" />
             {Object.keys(BEATER_COLORS).map((c, i) => {
                 const row = Math.floor(i / 4);
                 const col = i % 4;
                 const x = -30 + col * 20;
                 const y = -10 + row * 20;
                 return (
                     <circle 
                        key={c}
                        cx={x} cy={y} r="6" 
                        fill={BEATER_COLORS[c as keyof typeof BEATER_COLORS]}
                        stroke={beaterColor === c ? "#000" : "#cbd5e1"}
                        strokeWidth={beaterColor === c ? 2 : 1}
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => setBeaterColor(c)}
                     />
                 );
             })}
         </g>

         {pedalMode === 'double' && (
             <text x="60" y="60" fontSize="60" fontWeight="900" fill={isK2 ? "#ef4444" : "#cbd5e1"} opacity={isK2 ? "0.8" : "0.3"} textAnchor="middle">L</text>
         )}
         <text x="340" y="60" fontSize="60" fontWeight="900" fill={isK1 ? "#3b82f6" : "#cbd5e1"} opacity={isK1 ? "0.8" : "0.3"} textAnchor="middle">{pedalMode === 'single' ? 'R' : 'R'}</text>

         <defs>
             <linearGradient id="plateGrad" x1="0" y1="0" x2="1" y2="1">
                 <stop offset="0%" stopColor="#334155"/>
                 <stop offset="100%" stopColor="#0f172a"/>
             </linearGradient>
             <linearGradient id="metalGradient" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="0%" stopColor="#94a3b8"/>
                 <stop offset="50%" stopColor="#e2e8f0"/>
                 <stop offset="100%" stopColor="#64748b"/>
             </linearGradient>
         </defs>

         <path d="M70 280 L130 280 L120 230 L80 230 Z" fill="url(#plateGrad)" stroke="#1e293b" strokeWidth="2" /> 
         <path d="M270 280 L330 280 L320 230 L280 230 Z" fill="url(#plateGrad)" stroke="#1e293b" strokeWidth="2" /> 
         
         <rect x="120" y="240" width="160" height="10" fill="url(#metalGradient)" rx="2" stroke="#1e293b" />
         <path d="M60 230 L60 260" stroke="#64748b" strokeWidth="3" strokeDasharray="2,1"/>
         <path d="M340 230 L340 260" stroke="#64748b" strokeWidth="3" strokeDasharray="2,1"/>

         {pedalMode === 'double' && (
             <g transform={`translate(180, 240) rotate(${isK2 ? -5 : -30}) translate(0, -140)`} style={{transition: 'transform 0.05s cubic-bezier(0.1, 0.7, 1.0, 0.1)'}}> 
                 <rect x="-4" y="0" width="8" height="150" fill="#94a3b8" stroke="#475569" rx="2" /> 
                 <circle cx="0" cy="0" r="16" fill={colorHex} stroke="black" strokeWidth="2"/> 
                 <rect x="-16" y="-6" width="32" height="12" fill="white" opacity="0.4" rx="2"/> 
             </g>
         )}
         <g transform={`translate(${pedalMode === 'single' ? 200 : 220}, 240) rotate(${isK1 ? 5 : 30}) translate(0, -140)`} style={{transition: 'transform 0.05s cubic-bezier(0.1, 0.7, 1.0, 0.1)'}}>
             <rect x="-4" y="0" width="8" height="150" fill="#94a3b8" stroke="#475569" rx="2" />
             <circle cx="0" cy="0" r="16" fill={colorHex} stroke="black" strokeWidth="2"/>
             <rect x="-16" y="-6" width="32" height="12" fill="white" opacity="0.4" rx="2"/>
         </g>
         
         <path d="M100 230 L100 270" stroke="#475569" strokeWidth="5" strokeDasharray="3,1"/>
         <path d="M300 230 L300 270" stroke="#475569" strokeWidth="5" strokeDasharray="3,1"/>
      </svg>
    </div>
  );
};

const SheetMusicView = React.memo(({ patternData, meter, showBeatIndicators, pedalMode, currentStep, isPlaying }: any) => {
  if (!patternData || !patternData.meter) return null; 
  const { steps, gridSize } = patternData;
  const START_X = 80;
  const END_X = 410;
  const CONTENT_WIDTH = END_X - START_X;
  const STEP_WIDTH = CONTENT_WIDTH / gridSize;
  
  const isCompound = meter[1] === 8;
  const stepsPerBeat = isCompound ? 3 : (gridSize / meter[0]);
  const elements = [];
  
  const BEAT_IND_Y = 15;
  const STICKING_Y = 32;
  const ACCENT_Y = 42; 
  const STEM_TOP_Y = 50; 
  const STAFF_TOP = 80; 
  const STEM_BOT_Y = STAFF_TOP + 60; 
  
  const yCrash = STAFF_TOP - 20; 
  const yHiHat = STAFF_TOP - 7; 
  const yRide = STAFF_TOP; 
  const yTom1 = STAFF_TOP + 5; 
  const yTom2 = STAFF_TOP + 10; 
  const ySnarePos = STAFF_TOP + 15; 
  const yFloor = STAFF_TOP + 25; 
  const yKick = STAFF_TOP + 35; 

  // --- Beat Highlighter (Orange Box) ---
  if (showBeatIndicators) {
    const numBeats = isCompound ? gridSize / 3 : meter[0];
    for (let b = 0; b < numBeats; b++) {
        const beatX = START_X + (b * stepsPerBeat * STEP_WIDTH);
        const nextBeatX = START_X + ((b+1) * stepsPerBeat * STEP_WIDTH);
        
        // Highlight active beat
        const currentBeatIndex = Math.floor(currentStep / stepsPerBeat);
        const isActiveBeat = isPlaying && currentBeatIndex === b;

        if (isActiveBeat) {
             elements.push(<rect key={`beat_hl_${b}`} x={beatX} y={10} width={nextBeatX - beatX} height={140} fill="#fb923c" opacity="0.15" rx="4" />);
        }

        elements.push(<text key={`bi${b}`} x={beatX} y={BEAT_IND_Y} fontSize="20" fontWeight="900" fill="#ef4444" textAnchor="start">{b + 1}</text>);
        elements.push(<line key={`bl_${b}`} x1={beatX} y1={BEAT_IND_Y + 10} x2={beatX} y2={STAFF_TOP + 50} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4,2" />);
    }
  }

  for(let i=0; i<5; i++) elements.push(<line key={`l${i}`} x1={10} y1={STAFF_TOP + i*10} x2={END_X} y2={STAFF_TOP+i*10} stroke="#000" strokeWidth="1"/>);
  elements.push(<rect key="clef1" x={20} y={STAFF_TOP+10} width={4} height={20} fill="#000" />);
  elements.push(<rect key="clef2" x={28} y={STAFF_TOP+10} width={4} height={20} fill="#000" />);
  elements.push(<text key="ts-top" x={50} y={STAFF_TOP+18} fontSize="22" fontWeight="bold" fontFamily="serif" textAnchor="middle">{meter[0]}</text>);
  elements.push(<text key="ts-bot" x={50} y={STAFF_TOP+38} fontSize="22" fontWeight="bold" fontFamily="serif" textAnchor="middle">{meter[1]}</text>);
  elements.push(<line key="barEnd" x1={END_X} y1={STAFF_TOP} x2={END_X} y2={STAFF_TOP+40} stroke="#000" strokeWidth="3" />);

  const showSticking = gridSize === 16;
  
  steps.forEach((inst: Instrument[], i: number) => {
      const x = START_X + i * STEP_WIDTH + (STEP_WIDTH/2);
      const isCurrent = isPlaying && currentStep === i;
      const noteColor = isCurrent ? "#ef4444" : "black"; // Highlight active note

      const notes = [];
      const hasHands = inst.includes('H') || inst.includes('O') || inst.includes('R') || inst.includes('S') || inst.includes('S_G') || inst.includes('S_R') || inst.includes('T1') || inst.includes('T2') || inst.includes('F') || inst.includes('C');
      const hasFeet = inst.includes('K') || inst.includes('K2');
      
      let hasDot = false;
      if (gridSize === 16 && (hasHands || hasFeet)) {
          if (i + 2 < gridSize) {
              const next1 = steps[i+1];
              const next2 = steps[i+2];
              const next1Empty = !next1.some((k: Instrument) => k!=='S_G' && k!=='.');
              const next2Empty = !next2.some((k: Instrument) => k!=='S_G' && k!=='.');
              if (next1Empty && next2Empty) hasDot = true;
          }
      }

      if (hasHands) {
          let stemStartY = -1;
          let hasAccent = false;

          if (inst.includes('F')) stemStartY = Math.max(stemStartY, yFloor);
          if (inst.includes('S') || inst.includes('S_G')) stemStartY = Math.max(stemStartY, ySnarePos);
          if (inst.includes('T2')) stemStartY = Math.max(stemStartY, yTom2);
          if (inst.includes('T1')) stemStartY = Math.max(stemStartY, yTom1);
          if (inst.includes('R')) stemStartY = Math.max(stemStartY, yRide);
          if (inst.includes('H') || inst.includes('O')) stemStartY = Math.max(stemStartY, yHiHat);
          if (inst.includes('C')) stemStartY = Math.max(stemStartY, yCrash);

          if (inst.includes('C') || inst.includes('O')) hasAccent = true;
          
          if (stemStartY !== -1) {
             notes.push(<line key={`stem_up_${i}`} x1={x+3.5} y1={stemStartY} x2={x+3.5} y2={STEM_TOP_Y} stroke={noteColor} strokeWidth="1.5" />);
          }

          if (hasAccent) {
              notes.push(<path key={`acc_${i}`} d={`M ${x},${ACCENT_Y} L ${x+6},${ACCENT_Y+3} L ${x},${ACCENT_Y+6}`} stroke={noteColor} strokeWidth="2" fill="none" transform={`rotate(0, ${x}, ${ACCENT_Y})`} />); 
          }
          
          if (hasDot) notes.push(<circle key={`dot_${i}`} cx={x+8} cy={stemStartY} r={2} fill={noteColor} />);

          const hasRide = inst.includes('R');
          const hasHH = inst.includes('H') || inst.includes('O');
          const rideX = hasHH ? x + 4 : x;
          const hhX = hasRide ? x - 4 : x;

          if (inst.includes('H')) {
             notes.push(<g key={`nh_h_${i}`} transform={`translate(${hhX}, ${yHiHat})`}><line x1="-4" y1="-4" x2="4" y2="4" stroke={isCurrent ? INST_COLOR.H : noteColor} strokeWidth="2"/><line x1="4" y1="-4" x2="-4" y2="4" stroke={isCurrent ? INST_COLOR.H : noteColor} strokeWidth="2"/></g>);
             if (showSticking) {
                 const stick = i % 2 === 0 ? 'R' : 'L';
                 notes.push(<text key={`stk_${i}`} x={hhX} y={STICKING_Y} fontSize="10" textAnchor="middle" fill="#64748b" fontWeight="bold">{stick}</text>);
             }
          }
          if (inst.includes('O')) {
             notes.push(<g key={`nh_o_${i}`} transform={`translate(${hhX}, ${yHiHat})`}>
                 <line x1="-4" y1="-4" x2="4" y2="4" stroke={isCurrent ? INST_COLOR.H : noteColor} strokeWidth="2"/><line x1="4" y1="-4" x2="-4" y2="4" stroke={isCurrent ? INST_COLOR.H : noteColor} strokeWidth="2"/>
                 <circle cx="0" cy="-8" r="3" fill="none" stroke={isCurrent ? INST_COLOR.H : noteColor} strokeWidth="1.5"/>
             </g>);
             if (showSticking) {
                 const stick = i % 2 === 0 ? 'R' : 'L';
                 notes.push(<text key={`stk_${i}`} x={hhX} y={STICKING_Y} fontSize="10" textAnchor="middle" fill="#64748b" fontWeight="bold">{stick}</text>);
             }
          }
          if (inst.includes('R')) {
             notes.push(<g key={`nh_r_${i}`} transform={`translate(${rideX}, ${yRide})`}><path d="M0,-5 L5,0 L0,5 L-5,0 Z" fill="white" stroke={isCurrent ? INST_COLOR.R : noteColor} strokeWidth="2"/></g>);
          }
          if (inst.includes('C')) {
             notes.push(<line key={`led_c_${i}`} x1={x-8} y1={yCrash} x2={x+8} y2={yCrash} stroke={noteColor} strokeWidth="1"/>);
             notes.push(<g key={`nh_c_${i}`} transform={`translate(${x}, ${yCrash})`}><path d="M-6,0 L6,0 M0,-6 L0,6 M-4,-4 L4,4 M-4,4 L4,-4" stroke={isCurrent ? INST_COLOR.C : noteColor} strokeWidth="2" /></g>);
          }
          if (inst.includes('S')) notes.push(<circle key={`nh_s_${i}`} cx={x} cy={ySnarePos} r={5} fill={isCurrent ? INST_COLOR.S : noteColor} />);
          if (inst.includes('S_G')) {
             notes.push(<text key={`gh_${i}`} x={x-6} y={ySnarePos+4} fontSize="14" fontWeight="bold" fill={INST_COLOR.Ghost} textAnchor="end">(</text>);
             notes.push(<circle key={`nh_sg_${i}`} cx={x} cy={ySnarePos} r={4} fill={isCurrent ? INST_COLOR.S : noteColor} />);
             notes.push(<text key={`gh2_${i}`} x={x+6} y={ySnarePos+4} fontSize="14" fontWeight="bold" fill={INST_COLOR.Ghost} textAnchor="start">)</text>);
          }
          if (inst.includes('T1')) notes.push(<circle key={`nh_t1_${i}`} cx={x} cy={yTom1} r={5} fill={isCurrent ? INST_COLOR.T1 : noteColor} />);
          if (inst.includes('T2')) notes.push(<circle key={`nh_t2_${i}`} cx={x} cy={yTom2} r={5} fill={isCurrent ? INST_COLOR.T2 : noteColor} />);
          if (inst.includes('F')) notes.push(<circle key={`nh_f_${i}`} cx={x} cy={yFloor} r={5} fill={isCurrent ? INST_COLOR.F : noteColor} />);
      }

      if (hasFeet) {
          let stemStartY = 999;
          if (inst.includes('K') || inst.includes('K2')) stemStartY = Math.min(stemStartY, yKick);
          
          notes.push(<line key={`stem_down_${i}`} x1={x-3.5} y1={stemStartY} x2={x-3.5} y2={STEM_BOT_Y} stroke={isCurrent ? INST_COLOR.K : noteColor} strokeWidth="1.5" />);
          notes.push(<circle key={`nh_k_${i}`} cx={x} cy={yKick} r={5} fill={isCurrent ? INST_COLOR.K : noteColor} />);
          
          const lineY1 = STEM_BOT_Y + 5;
          const lineY2 = STEM_BOT_Y + 10;
          const lineW = STEP_WIDTH * 0.8;
          
          notes.push(<line key={`jp_1_${i}`} x1={x-lineW/2} y1={lineY1} x2={x+lineW/2} y2={lineY1} stroke={isCurrent ? INST_COLOR.K : noteColor} strokeWidth="2" />);
          
          if (gridSize === 16 && !hasDot) {
              notes.push(<line key={`jp_2_${i}`} x1={x-lineW/2} y1={lineY2} x2={x+lineW/2} y2={lineY2} stroke={isCurrent ? INST_COLOR.K : noteColor} strokeWidth="2" />);
          }
          
          if (hasDot) notes.push(<circle key={`dot_k_${i}`} cx={x+8} cy={yKick} r={2} fill={noteColor} />);

          let footStick = '';
          if (pedalMode === 'double') footStick = inst.includes('K2') ? 'L' : 'R';
          else if (inst.includes('K2') || inst.includes('K')) footStick = 'R'; 
          
          if (footStick) notes.push(<text key={`fstk_${i}`} x={x} y={STEM_BOT_Y + 22} fontSize="11" textAnchor="middle" fill="#64748b" fontWeight="bold">{footStick}</text>);
      }

      if (notes.length > 0) elements.push(<g key={`note_grp_${i}`}>{notes}</g>);
  });

  const drawBeams = (voice: string, stemTipY: number, direction: number) => {
      const numGroups = meter[0] === 12 || meter[0] === 6 || meter[0] === 9 ? meter[0] / 3 : meter[0];
      for (let b = 0; b < numGroups; b++) {
          const beatStart = b * stepsPerBeat;
          const beatEnd = (b + 1) * stepsPerBeat;
          const activeIndices = [];
          
          for(let i = beatStart; i < beatEnd; i++) {
              if (i >= gridSize) break;
              const inst = steps[i];
              const isActive = (voice === 'hands') 
                  ? (inst.includes('H') || inst.includes('O') || inst.includes('R') || inst.includes('S') || inst.includes('S_G') || inst.includes('T1') || inst.includes('T2') || inst.includes('F') || inst.includes('C'))
                  : (inst.includes('K') || inst.includes('K2'));
              if(isActive) activeIndices.push(i);
          }

          if (activeIndices.length > 1) {
              const firstIdx = activeIndices[0];
              const lastIdx = activeIndices[activeIndices.length - 1];
              let xOffset = voice === 'hands' ? 3.5 : -3.5;
              const x1 = START_X + firstIdx * STEP_WIDTH + (STEP_WIDTH/2) + xOffset;
              const x2 = START_X + lastIdx * STEP_WIDTH + (STEP_WIDTH/2) + xOffset;
              
              elements.push(<line key={`bm_1_${voice}_${b}`} x1={x1} y1={stemTipY} x2={x2} y2={stemTipY} stroke="black" strokeWidth="4.5" />);

              if (gridSize === 16) {
                  for(let k=0; k<activeIndices.length-1; k++) {
                      const curr = activeIndices[k];
                      const next = activeIndices[k+1];
                      if (next - curr === 1) { 
                         const subX1 = START_X + curr * STEP_WIDTH + (STEP_WIDTH/2) + xOffset;
                         const subX2 = START_X + next * STEP_WIDTH + (STEP_WIDTH/2) + xOffset;
                         const yOffset = direction === 1 ? 8 : -8;
                         elements.push(<line key={`bm_2_${voice}_${curr}`} x1={subX1} y1={stemTipY+yOffset} x2={subX2} y2={stemTipY+yOffset} stroke="black" strokeWidth="4.5" />);
                      } else if (next - curr > 1) {
                          const subX2 = START_X + next * STEP_WIDTH + (STEP_WIDTH/2) + xOffset;
                          const subX1 = subX2 - 8; 
                          const yOffset = direction === 1 ? 8 : -8;
                          elements.push(<line key={`bm_stub_${voice}_${next}`} x1={subX1} y1={stemTipY+yOffset} x2={subX2} y2={stemTipY+yOffset} stroke="black" strokeWidth="4.5" />);
                      }
                  }
              }
          }
      }
  };
  drawBeams('hands', STEM_TOP_Y, 1);
  
  // --- Playhead Cursor (Red Line) ---
  if (isPlaying) {
      const cursorX = START_X + currentStep * STEP_WIDTH + (STEP_WIDTH/2);
      // Smooth transition animation logic is tricky in SVG with pure React state without Framer Motion
      // But we can simply move the group
      elements.push(
          <g key="cursor" transform={`translate(${cursorX}, 0)`} style={{ transition: 'transform 0.05s linear' }}>
              <line x1="0" y1="20" x2="0" y2="150" stroke="#ef4444" strokeWidth="2" strokeOpacity="0.8" />
              <path d="M0,20 L5,15 L-5,15 Z" fill="#ef4444" />
          </g>
      );
  }

  return <g>{elements}</g>;
});

const App = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [bpm, setBpm] = useState(100);
    const [patternKey, setPatternKey] = useState('p_1');
    const [pendingPatternKey, setPendingPatternKey] = useState<string | null>(null);
    const [metronome, setMetronome] = useState(false);
    const [preCount, setPreCount] = useState(0);
    const [speedRate, setSpeedRate] = useState(1.0);
    const [showBeatIndicators, setShowBeatIndicators] = useState(true);
    const [pedalMode, setPedalMode] = useState<'single' | 'double'>('double');
    const [beaterColor, setBeaterColor] = useState('Red');
    const [instruments, setInstruments] = useState<Record<string, boolean>>({});
    const [currentStep, setCurrentStep] = useState(0);

    const nextNoteTimeRef = useRef(0);
    const currentStepRef = useRef(0);
    const timerIDRef = useRef<number | null>(null);
    const stateRef = useRef({ isPlaying, bpm, speedRate, patternKey, pendingPatternKey, metronome, preCount });

    useEffect(() => {
        stateRef.current = { isPlaying, bpm, speedRate, patternKey, pendingPatternKey, metronome, preCount };
    }, [isPlaying, bpm, speedRate, patternKey, pendingPatternKey, metronome, preCount]);

    const togglePlay = useCallback(() => setIsPlaying(prev => !prev), []);
    const changePattern = (k: string) => isPlaying ? setPendingPatternKey(k) : setPatternKey(k);

    useEffect(() => {
        if (isPlaying) {
            AudioEngine.init();
            const lookahead = 25.0; 
            const scheduleAheadTime = 0.1; 
            if (nextNoteTimeRef.current < AudioEngine.ctx!.currentTime) nextNoteTimeRef.current = AudioEngine.ctx!.currentTime + 0.05;
            
            const nextNote = () => {
                const { bpm, speedRate, patternKey, pendingPatternKey } = stateRef.current;
                const pattern = DRUM_PATTERNS[patternKey];
                const secondsPerBeat = 60.0 / (bpm * speedRate);
                const stepsPerBeat = (pattern.meter[1] === 8) ? 3 : 4; 
                nextNoteTimeRef.current += secondsPerBeat / stepsPerBeat;
                currentStepRef.current++;
                if (currentStepRef.current === pattern.gridSize) {
                    currentStepRef.current = 0;
                    if (pendingPatternKey) {
                        setPatternKey(pendingPatternKey);
                        setPendingPatternKey(null);
                    }
                }
            };

            const scheduleNote = (stepNumber: number, time: number) => {
                const { patternKey, metronome } = stateRef.current;
                const pattern = DRUM_PATTERNS[patternKey];
                const step = pattern.steps[stepNumber];

                if (metronome) {
                    const stepsPerBeat = (pattern.meter[1] === 8) ? 3 : 4;
                    if (stepNumber % stepsPerBeat === 0) AudioEngine.playClick(stepNumber === 0, time);
                }

                if (step) {
                    step.forEach(inst => { if (inst !== '.') AudioEngine.trigger(inst, time); });
                    const timeToVisual = (time - AudioEngine.ctx!.currentTime) * 1000;
                    
                    // Visual Sync
                    setTimeout(() => {
                        const active: Record<string, boolean> = {};
                        step.forEach(inst => { if(inst!=='.') active[inst] = true; });
                        setInstruments(active);
                        setCurrentStep(stepNumber); // Update cursor position
                        setTimeout(() => setInstruments({}), 100);
                    }, Math.max(0, timeToVisual));
                }
            };

            const scheduler = () => {
                while (nextNoteTimeRef.current < AudioEngine.ctx!.currentTime + scheduleAheadTime) {
                    scheduleNote(currentStepRef.current, nextNoteTimeRef.current);
                    nextNote();
                }
                timerIDRef.current = window.setTimeout(scheduler, lookahead);
            };
            scheduler();
        } else {
            if (timerIDRef.current) window.clearTimeout(timerIDRef.current);
            setInstruments({});
            currentStepRef.current = 0; 
            setCurrentStep(0);
        }
        return () => { if (timerIDRef.current) window.clearTimeout(timerIDRef.current); };
    }, [isPlaying]);

    const onVariation = () => {
        const currentPattern = DRUM_PATTERNS[patternKey];
        const newKey = `var_${Date.now()}`;
        const newSteps = currentPattern.steps.map(step => [...step]);
        const is16Grid = currentPattern.gridSize === 16;
        for (let i = 0; i < currentPattern.gridSize; i++) {
            const isDownbeat = i % 4 === 0;
            const isBackbeat = (i === 4 || i === 12) && is16Grid;
            if (!isDownbeat && newSteps[i].length === 0) { if (Math.random() < 0.3) newSteps[i].push('S_G'); }
            else if (!isDownbeat && newSteps[i].includes('H') && !newSteps[i].includes('S') && !newSteps[i].includes('K')) { if (Math.random() < 0.2) newSteps[i].push('S_G'); }

            if (i !== 0 && newSteps[i].includes('K')) {
                if (Math.random() < 0.2) {
                     newSteps[i] = newSteps[i].filter(inst => inst !== 'K');
                     if (i + 1 < currentPattern.gridSize && !newSteps[i+1].includes('K')) newSteps[i+1].push('K');
                }
            } else if (i !== 0 && !newSteps[i].includes('K') && !isBackbeat) {
                if (Math.random() < 0.1) newSteps[i].push('K');
            }
            if (newSteps[i].includes('H') && !isDownbeat) {
                 if (Math.random() < 0.05) { newSteps[i] = newSteps[i].filter(inst => inst !== 'H'); newSteps[i].push('O'); }
            }
        }
        DRUM_PATTERNS[newKey] = { ...currentPattern, name: `${currentPattern.name} (Var)`, steps: newSteps, isVariation: true };
        changePattern(newKey);
    };
    
    const onRandom = () => {
        const keys = Object.keys(DRUM_PATTERNS).filter(k => !DRUM_PATTERNS[k].isVariation);
        changePattern(keys[Math.floor(Math.random() * keys.length)]);
    };

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.code === 'Space') {
                e.preventDefault();
                if (e.ctrlKey) onRandom(); 
                else if (e.shiftKey) onVariation(); 
                else togglePlay(); 
            }

            const RATES = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
            if (e.key === '+' || e.key === '=' || e.code === 'ArrowRight') {
                setSpeedRate(prev => { const idx = RATES.indexOf(prev); return idx < RATES.length - 1 ? RATES[idx + 1] : prev; });
            }
            if (e.key === '-' || e.key === '_' || e.code === 'ArrowLeft') {
                setSpeedRate(prev => { const idx = RATES.indexOf(prev); return idx > 0 ? RATES[idx - 1] : prev; });
            }

            if (e.key === '1') setPreCount(prev => prev ? 0 : 4);
            if (e.key === '2') setShowBeatIndicators(prev => !prev);
            if (e.key === '3') setMetronome(prev => !prev);
            if (e.key === '`') setPedalMode(prev => prev === 'single' ? 'double' : 'single');
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [togglePlay, patternKey]); 

    return (
        <div className="w-full h-screen bg-slate-900 flex flex-col md:grid md:grid-cols-2 md:grid-rows-2 overflow-hidden select-none font-sans">
            <div className="order-1 md:row-span-1 md:col-span-1 h-[25vh] md:h-auto border-r border-b border-slate-700 overflow-hidden relative z-20 shadow-xl">
                 <ControlPanel isPlaying={isPlaying} togglePlay={togglePlay} bpm={bpm} setBpm={setBpm} patternKey={patternKey} changePattern={changePattern} pendingPatternKey={pendingPatternKey} preCount={preCount} setPreCount={setPreCount} showBeatIndicators={showBeatIndicators} setShowBeatIndicators={setShowBeatIndicators} speedRate={speedRate} setSpeedRate={setSpeedRate} onRandom={onRandom} onVariation={onVariation} metronome={metronome} setMetronome={setMetronome} />
            </div>
            <div className="order-2 md:row-span-1 md:col-span-1 h-[25vh] md:h-auto relative border-b border-slate-300 bg-slate-50">
                 <UpperBodyView isPlaying={isPlaying} instruments={instruments} />
            </div>
            <div className="order-3 md:row-span-1 md:col-span-1 h-[25vh] md:h-auto relative border-r border-slate-300 bg-gray-200 shadow-inner">
                <PedalView isPlaying={isPlaying} instruments={instruments} pedalMode={pedalMode} setPedalMode={setPedalMode} beaterColor={beaterColor} setBeaterColor={setBeaterColor} />
            </div>
            <div className="order-4 md:row-span-1 md:col-span-1 h-[25vh] md:h-auto bg-white relative flex items-center justify-center p-4">
                  <svg width="100%" height="100%" viewBox="0 0 500 150" preserveAspectRatio="xMidYMid meet">
                      <SheetMusicView patternData={DRUM_PATTERNS[patternKey]} meter={DRUM_PATTERNS[patternKey].meter} showBeatIndicators={showBeatIndicators} pedalMode={pedalMode} currentStep={currentStep} isPlaying={isPlaying} />
                  </svg>
            </div>
        </div>
    );
};
export default App;