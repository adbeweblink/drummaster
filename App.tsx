import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Music2, RotateCcw, Layers, ListFilter, ArrowRight, Dices, Hand, Mic2, Sparkles, Volume2, Sliders, Ear, EarOff, Zap, Globe, Info, X } from 'lucide-react';

// --- 0. Color System ---
const INST_COLOR: Record<string, string> = {
    K: '#000000',   // Kick
    S: '#ef4444',   // Snare
    T1: '#3b82f6',  // Tom1
    T2: '#a855f7',  // Tom2
    F: '#22c55e',   // Floor
    H: '#000000',   // HH
    C: '#fbbf24',   // Crash
    R: '#3b82f6',   // Ride
    Sp: '#8b4513',  // Splash (SaddleBrown)
    Ghost: '#94a3b8',
    L: '#ef4444'
};

const BEATER_COLORS = {
    Red: '#ef4444', Blue: '#3b82f6', Green: '#22c55e', Purple: '#a855f7',
    Gray: '#64748b', Pink: '#ec4899', Orange: '#f97316', White: '#cbd5e1' 
};

// --- 1. Localization System ---
type LangKey = 'zh-TW' | 'zh-CN' | 'en' | 'ja' | 'ko' | 'th';

const TRANSLATIONS: Record<LangKey, any> = {
    'zh-TW': {
        play: '播放', stop: '停止', bpm: 'BPM', next: '下一首',
        variation: '變奏', random: '隨機', swing: '搖擺感',
        precount: '預備拍', grid: '格線', click: '節拍器',
        pedalCam: '踏板攝影機', single: '單踏', double: '雙踏',
        interactive: '互動式鼓組 (點擊靜音)',
        infoTitle: '功能介紹',
        info: [
            '1. 專業節奏庫：內建 15 級難度，涵蓋 Pop, Funk, Metal, Odd Time。',
            '2. 互動式靜音：直接點擊鼓面可靜音/開啟，適合分軌練習。',
            '3. 視覺化回饋：動態鼓譜(支援連音符)、擊打動畫與雙踏攝影機。',
            '4. 智能過門：播放時切換節奏，系統會自動在第4拍生成過門銜接。',
            '5. 快捷鍵：空白鍵(播放), +/- (速度), 1/2/3 (輔助功能)。'
        ]
    },
    'zh-CN': {
        play: '播放', stop: '停止', bpm: 'BPM', next: '下一首',
        variation: '变奏', random: '随机', swing: '摇摆感',
        precount: '预备拍', grid: '网格', click: '节拍器',
        pedalCam: '踏板运镜', single: '单踏', double: '双踏',
        interactive: '互动鼓组 (点击静音)',
        infoTitle: '功能介绍',
        info: [
            '1. 专业节奏库：涵盖 15 级难度，包含 Pop, Funk, Metal 等。',
            '2. 互动静音：直接点击鼓面可静音，方便分轨练习。',
            '3. 可视化反馈：动态鼓谱(含连音符)、击打动画与踏板视角。',
            '4. 智能过门：播放时切换节奏，系统会自动在第4拍生成过门衔接。',
            '5. 快捷键：空格(播放), +/- (速度), 1/2/3 (辅助功能)。'
        ]
    },
    'en': {
        play: 'PLAY', stop: 'STOP', bpm: 'BPM', next: 'NEXT',
        variation: 'Var', random: 'Rand', swing: 'Swing',
        precount: 'Pre-Roll', grid: 'Grid', click: 'Click',
        pedalCam: 'Pedal Cam', single: 'Single', double: 'Double',
        interactive: 'Interactive Kit (Tap to Mute)',
        infoTitle: 'Features',
        info: [
            '1. Pro Groove Library: 15 Levels covering Pop, Funk, Metal, Odd Time.',
            '2. Interactive Mute: Tap any drum to mute/unmute for practice.',
            '3. Visual Feedback: Real-time sheet music (w/ tuplets) and pedal animation.',
            '4. Smart Transition: Changing patterns mid-bar auto-injects a fill on beat 4.',
            '5. Hotkeys: Space (Play), +/- (Tempo), 1/2/3 (Tools).'
        ]
    },
    'ja': {
        play: '再生', stop: '停止', bpm: 'BPM', next: '次へ',
        variation: '変奏', random: 'ランダム', swing: 'スイング',
        precount: 'プリカウント', grid: 'グリッド', click: 'メトロノーム',
        pedalCam: 'ペダルカメラ', single: 'シングル', double: 'ツーバス',
        interactive: 'インタラクティブ (タップでミュート)',
        infoTitle: '機能紹介',
        info: [
            '1. プロリズム庫：Pop, Funk, Metalなど15レベルのリズム。',
            '2. ミュート機能：ドラムをタップして個別ミュート可能。',
            '3. 視覚フィードバック：リアルタイム譜面(連符対応)とペダル動画。',
            '4. スマートフィル：再生中に切り替えると、4拍目に自動でフィルが入ります。',
            '5. ショートカット：Space (再生), +/- (速度), 1/2/3 (ツール)。'
        ]
    },
    'ko': {
        play: '재생', stop: '정지', bpm: 'BPM', next: '다음',
        variation: '변주', random: '무작위', swing: '스윙',
        precount: '예비박', grid: '그리드', click: '메트로놈',
        pedalCam: '페달 카메라', single: '싱글', double: '더블',
        interactive: '인터랙티브 드럼 (터치하여 음소거)',
        infoTitle: '기능 소개',
        info: [
            '1. 프로 그루브: 팝, 펑크, 메탈 등 15단계 난이도.',
            '2. 인터랙티브 뮤트: 드럼을 탭하여 개별 음소거 가능.',
            '3. 시각적 피드백: 실시간 악보(잇단음표) 및 페달 애니메이션.',
            '4. 스마트 필인: 재생 중 패턴 변경 시 4박자에 자동으로 필인을 추가합니다.',
            '5. 단축키: Space (재생), +/- (속도), 1/2/3 (도구).'
        ]
    },
    'th': {
        play: 'เล่น', stop: 'หยุด', bpm: 'BPM', next: 'ต่อไป',
        variation: 'ตัวแปร', random: 'สุ่ม', swing: 'สวิง',
        precount: 'นับจังหวะ', grid: 'เส้นตาราง', click: 'เมโทรนอม',
        pedalCam: 'กล้องกระเดื่อง', single: 'กระเดื่องเดี่ยว', double: 'กระเดื่องคู่',
        interactive: 'กลองแบบโต้ตอบ (แตะเพื่อปิดเสียง)',
        infoTitle: 'คุณสมบัติ',
        info: [
            '1. คลังจังหวะมืออาชีพ: 15 ระดับ ครอบคลุม Pop, Funk, Metal.',
            '2. ปิดเสียงแบบโต้ตอบ: แตะที่กลองเพื่อปิด/เปิดเสียง.',
            '3. การตอบสนองทางภาพ: โน้ตเพลงและภาพเคลื่อนไหวแบบเรียลไทม์.',
            '4. Smart Transition: สร้างลูกส่งอัตโนมัติในจังหวะที่ 4 เมื่อเปลี่ยนแพทเทิร์น.',
            '5. คีย์ลัด: Space (เล่น), +/- (ความเร็ว), 1/2/3 (เครื่องมือ).'
        ]
    }
};

// --- 2. Groove Data ---

const CATEGORIES: Record<string, { label: string; color: string }> = {
  'Lv1': { label: 'Lv.1｜8 Beat Basic', color: 'text-cyan-400' },
  'Lv2': { label: 'Lv.2｜8 Beat Variations', color: 'text-cyan-500' },
  'Lv3': { label: 'Lv.3｜16 Beat Basic', color: 'text-blue-400' },
  'Lv4': { label: 'Lv.4｜16 Beat Variations', color: 'text-blue-500' },
  'Lv5': { label: 'Lv.5｜Funk Basic', color: 'text-purple-400' },
  'Lv6': { label: 'Lv.6｜Funk Advanced', color: 'text-purple-500' },
  'Lv7': { label: 'Lv.7｜Linear Groove', color: 'text-pink-400' },
  'Lv8': { label: 'Lv.8｜Shuffle & Blues', color: 'text-indigo-400' },
  'Lv9': { label: 'Lv.9｜Jazz & Odd Time', color: 'text-yellow-400' },
  'Lv10': { label: 'Lv.10｜J-POP & Fast Rock', color: 'text-orange-500' },
  'Lv11': { label: 'Lv.11｜Double Pedal', color: 'text-red-600' },
  'Lv12': { label: 'Lv.12｜Master Class', color: 'text-emerald-400' },
  'Lv13': { label: 'Lv.13｜Dream Theater Challenge', color: 'text-yellow-500' },
  'Lv14': { label: 'Lv.14｜God Mode', color: 'text-rose-500' },
  'Lv15': { label: 'Lv.15｜Diabolic God', color: 'text-fuchsia-600' },
};

type Instrument = 'K' | 'K2' | 'S' | 'S_G' | 'S_R' | 'H' | 'O' | 'R' | 'C' | 'Sp' | 'T1' | 'T2' | 'F' | '.' | 'L';
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
    const fillTom = (s: Instrument[][]) => {
        const len = s.length;
        if (len >= 16) {
            s[len-4] = ['T1']; s[len-3] = ['T2']; s[len-2] = ['F']; s[len-1] = ['K', 'Sp'];
        }
    };

    // --- LV.1: 8 Beat Basic ---
    add('Lv1', 'Money Beat (Michael Jackson)', 117, 16, [4,4], s => {
        hh8(s); sn44(s); s[0].push('K'); s[8].push('K'); 
        s[15].push('Sp'); 
    });
    add('Lv1', 'We Will Rock You (Queen)', 82, 16, [4,4], s => {
        s[0].push('K'); s[2].push('K'); s[4].push('S'); 
        s[8].push('K'); s[10].push('K'); s[12].push('S');
        s[15].push('T2'); s[14].push('Sp');
    });
    add('Lv1', 'Slow Rock Ballad', 87, 16, [4,4], s => {
        for(let i=0; i<16; i+=2) s[i].push('O'); 
        sn44(s); s[0].push('K'); s[8].push('K'); s[10].push('K');
        s[14].push('T1'); s[15].push('F');
    });

    // --- LV.2: 8 Beat Variations ---
    add('Lv2', 'Smells Like Teen Spirit', 110, 16, [4,4], s => {
        s[0].push('K'); s[0].push('C'); s[2].push('K'); s[4].push('S'); s[4].push('H');
        s[6].push('K'); s[7].push('K'); s[8].push('C'); s[8].push('K'); 
        s[12].push('S'); s[12].push('H'); s[14].push('K');
        s[15].push('Sp');
    });
    add('Lv2', 'Offbeat Kick', 120, 16, [4,4], s => {
        hh8(s); sn44(s); s[0].push('K'); s[6].push('K'); s[10].push('K');
        s[15].push('O'); s[14].push('Sp');
    });
    add('Lv2', 'Anticipation', 100, 16, [4,4], s => {
        hh8(s); sn44(s); s[0].push('K'); s[8].push('K'); s[14].push('K');
        s[15].push('T1');
    });

    // --- LV.3: 16 Beat Basic ---
    add('Lv3', '16 Beat Ballad', 75, 16, [4,4], s => {
        hh16(s); sn44(s); s[0].push('K'); s[3].push('K'); s[8].push('K');
        s[14].push('F'); s[15].push('F');
    });
    add('Lv3', 'Tom Sawyer', 88, 16, [4,4], s => {
        hh16(s); sn44(s); s[0].push('K'); s[2].push('K'); s[6].push('K'); s[11].push('K'); s[15].push('O');
        s[12].push('C'); s[13].push('Sp');
    });
    add('Lv3', 'Two-Handed 16th', 95, 16, [4,4], s => {
        for(let i=0; i<16; i++) s[i].push('H');
        s[4].push('S'); s[12].push('S'); s[0].push('K'); s[8].push('K');
        fillTom(s);
    });

    // --- LV.4: 16 Beat Variations ---
    add('Lv4', 'Funk Rock', 105, 16, [4,4], s => {
        hh16(s); sn44(s); s[0].push('K'); s[8].push('K'); s[11].push('K'); s[14].push('K');
        s[15].push('Sp');
    });
    add('Lv4', 'Rosanna Ghost Notes', 86, 16, [4,4], s => {
        hh16(s); s[4].push('S'); s[12].push('S');
        s[0].push('K'); s[10].push('K');
        [1,3,5,9,13].forEach(i=>s[i].push('S_G'));
        s[15].push('T2');
    });
    add('Lv4', 'Jungle/DnB', 170, 16, [4,4], s => {
        s[0].push('C'); s[0].push('K'); s[4].push('S'); 
        s[7].push('S_G'); s[9].push('S_G'); s[10].push('K'); s[12].push('S');
        for(let i=0; i<16; i+=2) s[i].push('R');
        s[14].push('Sp');
    });

    // --- LV.5: Funk Basic ---
    add('Lv5', 'Funky Drummer', 98, 16, [4,4], s => {
        hh16(s); s[0].push('K'); s[2].push('K'); s[4].push('S'); s[10].push('K'); s[12].push('S');
        [1,5,6,9,13,15].forEach(i=>s[i].push('S_G'));
    });
    add('Lv5', 'Chameleon', 95, 16, [4,4], s => {
        hh16(s); s[0].push('K'); s[4].push('S'); s[11].push('K'); s[12].push('S');
        s[1].push('S_G'); s[15].push('S_G');
    });
    add('Lv5', 'Superstition', 100, 16, [4,4], s => {
        hh16(s); s[0].push('K'); s[4].push('S'); s[8].push('K'); s[12].push('S');
        s[2].push('K'); s[14].push('K');
        s[15].push('O');
    });

    // --- LV.6: Funk Advanced ---
    add('Lv6', 'Linear Funk', 106, 16, [4,4], s => {
        s[0].push('K'); s[1].push('S'); s[3].push('S'); s[4].push('K');
        s[6].push('K'); s[7].push('S'); s[9].push('S'); s[10].push('K');
        s[12].push('K'); s[13].push('S'); s[15].push('S');
        s[8].push('Sp');
    });
    add('Lv6', 'Paradiddle Funk', 95, 16, [4,4], s => {
        // R L R R L R L L (Paradiddle Sticking)
        for(let i=0; i<16; i++) {
            const p = i % 8;
            const isR = p===0 || p===2 || p===3 || p===5;
            if(isR) s[i].push('H'); else if (i !== 4 && i !== 12) s[i].push('S_G');
        }
        s[4].push('S'); s[12].push('S'); s[0].push('K'); s[10].push('K'); s[0].push('C');
    });
    add('Lv6', '50 Ways', 90, 16, [4,4], s => {
        s[0].push('K'); s[0].push('H'); s[1].push('S_G'); s[2].push('H'); s[3].push('O');
        s[4].push('S'); s[6].push('K'); s[7].push('S_G'); 
        s[8].push('K'); s[8].push('H'); s[9].push('S_G'); s[10].push('H'); s[11].push('O');
        s[12].push('S'); s[14].push('K'); s[15].push('S_G');
    });

    // --- LV.7: Linear Groove ---
    add('Lv7', 'Gospel Chops Basic', 110, 12, [12,8], s => {
        [0,3,6,9].forEach(i=>s[i].push('R'));
        [1,4,7,10].forEach(i=>s[i].push('S'));
        [2,5,8,11].forEach(i=>s[i].push('K'));
        s[0].push('C'); s[6].push('Sp');
    });
    add('Lv7', 'Linear Fill Application', 120, 16, [4,4], s => {
        s[0].push('R'); s[1].push('K'); s[2].push('S'); s[3].push('K');
        s[4].push('R'); s[5].push('K'); s[6].push('S'); s[7].push('K');
        s[8].push('C'); s[12].push('S');
        s[13].push('T1'); s[14].push('T2'); s[15].push('F');
    });

    // --- LV.8: Shuffle & Blues ---
    add('Lv8', 'Rosanna Shuffle', 130, 12, [12,8], s => {
        for(let i=0; i<12; i++) s[i].push('H');
        s[6].push('S'); 
        s[0].push('K'); s[8].push('K');
        [0,2,3,5,8,9,11].forEach(i=>s[i].push('S_G')); 
    });
    add('Lv8', 'La Grange', 160, 12, [12,8], s => {
        for(let i=0; i<12; i+=3) { s[i].push('R'); s[i+2].push('R'); }
        s[3].push('S'); s[9].push('S'); s[3].push('R'); s[9].push('R');
        s[0].push('K'); s[6].push('K');
        s[11].push('Sp');
    });

    // --- LV.9: Jazz & Odd Time ---
    add('Lv9', 'Take Five (5/4)', 160, 20, [5,4], s => {
        [0,3,4,6,9,12,15,16,18].forEach(i=>s[i].push('R'));
        s[6].push('S'); s[18].push('S'); 
        s[0].push('K'); s[12].push('K');
        [3,9,15].forEach(i=>s[i].push('H')); 
    });
    add('Lv9', 'Jazz Swing', 140, 12, [12,8], s => {
        [0,3,4,6,9,10].forEach(i=>s[i].push('R'));
        s[3].push('H'); s[9].push('H'); 
        s[11].push('T1'); 
    });

    // --- LV.10: J-POP & Fast Rock ---
    add('Lv10', 'IDOL (YOASOBI)', 166, 16, [4,4], s => {
        [0,4,8,12].forEach(i=>s[i].push('K'));
        s[4].push('S'); s[12].push('S');
        for(let i=0; i<16; i+=2) s[i].push('H');
        s[2].push('O'); s[10].push('O'); 
        s[7].push('S_G'); s[15].push('S_G'); 
        s[14].push('Sp');
    });
    add('Lv10', 'Yoru ni Kakeru', 130, 16, [4,4], s => {
        hh8(s); sn44(s);
        s[0].push('K'); s[3].push('K'); s[6].push('K'); s[10].push('K'); s[11].push('K');
        s[15].push('O');
    });
    add('Lv10', 'Double Stroke Groove', 120, 16, [4,4], s => {
        // RR LL RR LL
        for(let i=0; i<16; i++) {
            const p = i % 4;
            if (p < 2) s[i].push('H'); else s[i].push('S_G'); 
        }
        s[4].push('S'); s[12].push('S'); s[0].push('K'); s[6].push('K'); s[10].push('K');
    });

    // --- LV.11: Double Pedal ---
    add('Lv11', 'Painkiller Intro', 100, 16, [4,4], s => {
        s[0].push('C'); s[4].push('S'); s[8].push('C'); s[12].push('S');
        for(let i=0; i<16; i++) s[i].push(i%2===0?'K':'K2');
        s[14].push('T1'); s[15].push('T2');
    });
    add('Lv11', 'Bleed (Meshuggah)', 115, 16, [4,4], s => {
        s[0].push('K'); s[1].push('K2'); s[2].push('K'); 
        s[4].push('S'); s[4].push('C');
        s[6].push('K'); s[7].push('K2'); s[8].push('K');
        s[12].push('S'); s[12].push('C');
        for(let i=0; i<16; i+=2) s[i].push('H');
    });

    // --- LV.12: Master Class ---
    add('Lv12', 'Seven Days (5/4)', 100, 20, [5,4], s => {
        s[0].push('H'); s[0].push('K'); 
        s[4].push('H'); s[4].push('S'); 
        s[8].push('H'); s[8].push('K'); 
        s[10].push('K'); 
        s[12].push('H'); s[14].push('S'); 
        s[16].push('H'); 
        s[19].push('Sp');
    });
    add('Lv12', 'Schism (12/8)', 105, 12, [12,8], s => {
        s[0].push('K'); s[2].push('K'); s[4].push('S');
        s[5].push('K'); s[7].push('K'); s[9].push('S'); s[10].push('K');
        for(let i=0; i<12; i++) s[i].push('H');
        s[11].push('T1');
    });

    // --- LV.13: Dream Theater Challenge ---
    add('Lv13', '6:00 Intro', 100, 16, [4,4], s => {
        [0,2,4,6,8,10,12,14].forEach(i => s[i].push('R')); 
        s[4].push('S'); s[12].push('S'); 
        s[0].push('K'); s[3].push('K'); s[10].push('K'); 
        s[7].push('S_G'); s[9].push('S_G'); s[15].push('S_G');
    });

    add('Lv13', 'Inverted Paradiddle', 110, 16, [4,4], s => {
        // R L L R L R R L
        for(let i=0; i<16; i++) {
            const p = i % 8;
            if (p===0 || p===3 || p===5 || p===6) s[i].push('R'); else s[i].push('S_G');
        }
        s[0].push('K'); s[4].push('S'); s[8].push('K'); s[12].push('S'); 
    });

    add('Lv13', 'Metropolis Pt. 1 (7/8)', 130, 14, [7,8], s => {
        s[0].push('C'); s[0].push('K');
        s[2].push('S'); 
        s[4].push('K'); s[6].push('K');
        s[8].push('S');
        s[10].push('K');
        s[12].push('S_G');
        for(let i=0; i<14; i+=2) s[i].push('H');
    });

    add('Lv13', 'Under a Glass Moon', 106, 16, [4,4], s => {
        s[0].push('K'); s[3].push('K'); s[8].push('K'); s[11].push('K');
        s[4].push('S'); s[12].push('S');
        for(let i=0; i<16; i+=2) s[i].push('R');
        s[1].push('S_G'); s[5].push('S_G'); s[9].push('S_G'); s[13].push('S_G');
        s[15].push('Sp');
    });

    add('Lv13', 'Pull Me Under', 102, 16, [4,4], s => {
        s[0].push('K'); s[3].push('K'); s[8].push('K'); s[10].push('K');
        s[4].push('S'); s[12].push('S');
        for(let i=0; i<16; i+=2) s[i].push('H');
        s[15].push('O');
    });

    add('Lv13', 'The Dance of Eternity', 140, 14, [7,8], s => {
        s[0].push('K'); s[0].push('C');
        s[2].push('S'); s[4].push('K'); s[6].push('K');
        s[8].push('S'); s[10].push('T1'); s[12].push('T2');
    });

    add('Lv13', 'Panic Attack', 140, 20, [5,4], s => {
        for(let i=0; i<20; i++) s[i].push(i%2===0 ? 'K' : 'K2');
        s[4].push('S'); s[12].push('S'); 
        s[16].push('C'); 
        s[0].push('C');
    });

    add('Lv13', 'Constant Motion', 150, 16, [4,4], s => {
        s[0].push('K'); s[2].push('K'); s[4].push('S');
        s[6].push('K'); s[8].push('K'); s[10].push('K'); s[12].push('S');
        s[0].push('C'); s[8].push('C');
    });

    add('Lv13', 'The Glass Prison', 145, 16, [4,4], s => {
        for(let i=0; i<16; i++) s[i].push(i%2===0 ? 'K' : 'K2');
        s[4].push('S'); s[12].push('S');
        s[0].push('R'); s[2].push('R'); s[4].push('R'); s[6].push('R');
        s[8].push('C'); s[10].push('R'); s[12].push('R'); s[14].push('R');
    });

    add('Lv13', 'Erotomania', 140, 20, [5,4], s => {
        s[0].push('K'); s[4].push('S'); s[8].push('K'); s[10].push('K');
        s[12].push('S'); s[16].push('K'); s[18].push('S_G');
        for(let i=0; i<20; i+=2) s[i].push('H');
        s[19].push('O');
    });

    add('Lv13', 'Finally Free', 100, 16, [4,4], s => {
        s[0].push('S'); s[1].push('T1'); s[2].push('K'); s[3].push('K');
        s[4].push('S'); s[5].push('T2'); s[6].push('K'); s[7].push('K');
        s[8].push('S'); s[9].push('F'); s[10].push('K'); s[11].push('K');
        s[12].push('C'); s[12].push('K');
    });

    // --- LV.14: God Mode (Show off & Gospel) ---
    add('Lv14', 'Gospel Chops', 110, 16, [4,4], s => {
        s[0].push('K'); s[0].push('C'); s[1].push('R'); s[2].push('S'); 
        s[3].push('K'); s[4].push('R'); s[5].push('S');
        s[6].push('K'); s[7].push('R'); s[8].push('S');
        s[9].push('K'); s[10].push('R'); s[11].push('S');
        s[12].push('R'); s[13].push('L'); s[14].push('R'); s[15].push('L');
    });
    
    add('Lv14', 'Sextuplet Shred', 100, 24, [4,4], s => {
        for(let i=0; i<24; i+=6) {
            s[i].push('R'); s[i+1].push('L'); s[i+2].push('R'); s[i+3].push('L');
            s[i+4].push('K'); s[i+5].push('K');
        }
        s[0].push('C'); s[12].push('S'); 
        s[6].push('T1'); s[18].push('F');
    });
    
    add('Lv14', 'Linear Fill', 110, 24, [4,4], s => {
        // R L L R R L
        for(let i=0; i<24; i+=6) {
            s[i].push('K'); s[i+1].push('S_G'); s[i+2].push('S_G'); 
            s[i+3].push('T1'); s[i+4].push('T2'); s[i+5].push('K');
        }
        s[0].push('C'); s[12].push('C');
    });

    add('Lv14', 'Quintuplets (5s)', 100, 20, [4,4], s => {
        for(let i=0; i<20; i+=5) {
            s[i].push('R'); s[i+1].push('L'); s[i+2].push('R'); s[i+3].push('L'); s[i+4].push('K');
        }
        s[0].push('C'); s[0].push('K');
    });

    add('Lv14', 'Hand-Foot Quads', 120, 16, [4,4], s => {
        for(let i=0; i<16; i+=4) {
            s[i].push(i%8===0 ? 'C' : 'S'); 
            s[i+1].push('S');
            s[i+2].push('K');
            s[i+3].push('K');
        }
    });

    add('Lv14', 'Crossover Toms', 115, 16, [4,4], s => {
        s[0].push('F'); s[1].push('T1'); s[2].push('K'); s[3].push('K');
        s[4].push('T2'); s[5].push('S'); s[6].push('K'); s[7].push('K');
        s[8].push('F'); s[9].push('T1'); s[10].push('K'); s[11].push('K');
        s[12].push('S'); s[13].push('T2'); s[14].push('K'); s[15].push('K');
        s[0].push('C');
    });

    add('Lv14', 'Linear Stacks', 125, 16, [4,4], s => {
        s[0].push('C'); s[1].push('S'); s[2].push('R'); s[3].push('S'); s[4].push('R'); s[5].push('S'); s[6].push('K');
        s[7].push('C'); s[8].push('S'); s[9].push('R'); s[10].push('S'); s[11].push('R'); s[12].push('S'); s[13].push('K');
        s[14].push('S'); s[15].push('S');
    });

    add('Lv14', 'The Helicopter', 140, 12, [12,8], s => {
        s[0].push('C'); s[0].push('K'); s[1].push('L'); s[2].push('R'); 
        s[3].push('L'); s[4].push('R'); s[5].push('L');
        s[6].push('K'); s[7].push('L'); s[8].push('R'); 
        s[9].push('L'); s[10].push('R'); s[11].push('L');
        [1,3,5,7,9,11].forEach(i=>s[i].push('S_G'));
    });

    add('Lv14', '32nd Herta Sim', 110, 16, [4,4], s => {
        for(let i=0; i<16; i++) {
             if(i%4===0) { s[i].push('R'); s[i].push('K'); }
             else if (i%4===2) { s[i].push('L'); s[i].push('K'); }
             else { s[i].push('K2'); }
        }
        s[4].push('S'); s[12].push('S');
        s[15].push('Sp');
    });

    add('Lv14', 'Polyrhythmic Linear', 110, 20, [4,4], s => {
        for(let i=0; i<20; i++) {
            const patternIdx = i % 5;
            if(patternIdx === 0) s[i].push('R');
            if(patternIdx === 1) s[i].push('L');
            if(patternIdx === 2) s[i].push('K');
            if(patternIdx === 3) s[i].push('R');
            if(patternIdx === 4) s[i].push('L');
        }
        s[0].push('C'); s[5].push('T1'); s[10].push('T2'); s[15].push('F');
    });

    // --- LV.15: Diabolic God (Final Graduation) ---
    add('Lv15', 'The Herta', 100, 24, [4,4], s => {
        for(let i=0; i<24; i+=6) {
            s[i].push('T1'); s[i+1].push('T1'); s[i+2].push('T2'); s[i+4].push('F');
            s[i].push('K'); 
        }
        s[0].push('C'); s[12].push('C');
    });

    add('Lv15', 'The Blushda', 95, 24, [4,4], s => {
        for(let i=0; i<24; i+=6) {
            s[i].push('S'); s[i].push('S_G'); 
            s[i].push('K'); 
            s[i+2].push('R'); s[i+3].push('S'); s[i+4].push('R'); s[i+5].push('S');
        }
    });

    add('Lv15', 'Metric Modulation', 140, 12, [12,8], s => {
        s[0].push('C'); s[0].push('K');
        s[4].push('S'); 
        s[8].push('K'); s[8].push('C');
        for(let i=0; i<12; i++) s[i].push('R');
        s[11].push('Sp');
    });

    add('Lv15', 'Double Bass Heel-Toe', 130, 24, [4,4], s => {
         for(let i=0; i<24; i+=6) {
             s[i].push('T1'); s[i+1].push('T1'); 
             s[i+2].push('T2'); s[i+3].push('T2');
             s[i+4].push('K'); s[i+5].push('K2');
         }
         s[0].push('C'); s[12].push('C');
    });

    add('Lv15', 'Double Bass Swivel', 180, 16, [4,4], s => {
        for(let i=0; i<16; i++) {
            s[i].push(i%2===0 ? 'K' : 'K2');
            if (i%2===0) s[i].push('R'); 
        }
        [0,2,4,6,8,10,12,14].forEach(i => s[i].push('S'));
        s[0].push('C');
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
  volDrums: 0.35, 
  
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
      
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -24; compressor.knee.value = 0; compressor.ratio.value = 20; compressor.attack.value = 0.001; compressor.release.value = 0.1; 
      AudioEngine.masterGain.connect(compressor);
      compressor.connect(ctx.destination);
      
      AudioEngine.reverbNode = ctx.createConvolver();
      AudioEngine.reverbGain = ctx.createGain();
      AudioEngine.reverbGain.gain.value = 0.2; 
      const len = ctx.sampleRate * 1.5; const buf = ctx.createBuffer(2, len, ctx.sampleRate);
      for(let i=0; i<len; i++) { const d = Math.pow(1-i/len,3); buf.getChannelData(0)[i]=(Math.random()*2-1)*d; buf.getChannelData(1)[i]=(Math.random()*2-1)*d; }
      AudioEngine.reverbNode.buffer = buf;
      AudioEngine.reverbNode.connect(AudioEngine.reverbGain); AudioEngine.reverbGain.connect(AudioEngine.masterGain);
  },

  connectToOutput: (node: AudioNode, pan: number = 0) => {
      if (!AudioEngine.ctx) return;
      const panner = AudioEngine.ctx.createStereoPanner();
      panner.pan.value = pan;
      node.connect(panner);
      if(AudioEngine.masterGain) { panner.connect(AudioEngine.masterGain); panner.connect(AudioEngine.reverbNode!); }
      else panner.connect(AudioEngine.ctx.destination);
  },

  playTone: (freq: number, decay: number, type: OscillatorType, vol=1, pan=0, time?: number, pitchDrop=false) => {
      if (!AudioEngine.ctx) AudioEngine.init();
      const t = time || AudioEngine.ctx!.currentTime;
      const osc = AudioEngine.ctx!.createOscillator();
      const gain = AudioEngine.ctx!.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      if (pitchDrop) osc.frequency.exponentialRampToValueAtTime(freq*0.1, t+decay); 
      gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(vol*AudioEngine.volDrums, t+0.002); gain.gain.exponentialRampToValueAtTime(0.001, t+decay);
      osc.connect(gain); AudioEngine.connectToOutput(gain, pan);
      osc.start(t); osc.stop(t+decay);
  },

  playNoise: (freq: number, decay: number, vol=1, q=1, pan=0, time?: number, highpass=false) => {
      if (!AudioEngine.ctx) AudioEngine.init();
      const t = time || AudioEngine.ctx!.currentTime;
      const bSize = AudioEngine.ctx!.sampleRate * decay;
      const buf = AudioEngine.ctx!.createBuffer(1, bSize, AudioEngine.ctx!.sampleRate);
      const data = buf.getChannelData(0); for(let i=0;i<bSize;i++) data[i]=Math.random()*2-1;
      const src = AudioEngine.ctx!.createBufferSource(); src.buffer = buf;
      const filt = AudioEngine.ctx!.createBiquadFilter(); filt.type = highpass ? 'highpass' : 'bandpass'; filt.frequency.value = freq; filt.Q.value = q;
      const gain = AudioEngine.ctx!.createGain(); gain.gain.setValueAtTime(vol*AudioEngine.volDrums, t); gain.gain.exponentialRampToValueAtTime(0.001, t+decay);
      src.connect(filt); filt.connect(gain); AudioEngine.connectToOutput(gain, pan);
      src.start(t);
  },
  
  playClick: (accent: boolean, time?: number) => {
      AudioEngine.playTone(accent?1200:800, 0.05, 'sine', 0.5, 0, time);
  },

  trigger: (type: Instrument, muted: Record<string, boolean>, time?: number) => {
      if (muted['K'] && (type.startsWith('K'))) return;
      if (muted['S'] && (type.startsWith('S') || type==='L')) return;
      if (muted['H'] && (type==='H' || type==='O' || type==='C' || type==='R' || type==='Sp')) return;
      if (muted['T'] && (type.startsWith('T') || type==='F')) return;
      
      switch(type) {
          case 'K': case 'K2': 
              AudioEngine.playTone(60, 0.3, 'sine', 1.0, 0, time, true); 
              AudioEngine.playNoise(3000, 0.05, 0.5, 1, 0, time);
              break;
          case 'S': case 'L': 
              AudioEngine.playTone(200, 0.15, 'triangle', 0.6, -0.15, time, true); 
              AudioEngine.playNoise(4000, 0.25, 0.7, 0.5, -0.15, time, true); 
              break;
          case 'S_G': 
              AudioEngine.playTone(180, 0.05, 'sine', 0.2, -0.15, time); 
              AudioEngine.playNoise(2000, 0.05, 0.2, 1, -0.15, time); 
              break;
          case 'H': AudioEngine.playNoise(8000, 0.05, 1.2, 0.5, -0.4, time, true); break;
          case 'O': AudioEngine.playNoise(7000, 0.5, 1.2, 0.5, -0.4, time, true); break;
          case 'R': 
              AudioEngine.playTone(800, 1.5, 'sine', 0.15, 0.4, time); 
              AudioEngine.playNoise(5000, 1.2, 0.25, 2, 0.4, time);
              break;
          case 'C': AudioEngine.playNoise(4000, 1.8, 0.6, 0.5, -0.3, time, true); break;
          case 'Sp': AudioEngine.playNoise(8000, 0.3, 1.5, 1, -0.1, time, true); break;
          case 'T1': 
              AudioEngine.playTone(200, 0.35, 'sine', 0.8, -0.2, time, true); 
              AudioEngine.playNoise(150, 0.1, 0.3, 1, -0.2, time);
              break;
          case 'T2': 
              AudioEngine.playTone(150, 0.45, 'sine', 0.8, 0.2, time, true);
              AudioEngine.playNoise(120, 0.1, 0.3, 1, 0.2, time);
              break;
          case 'F': 
              AudioEngine.playTone(100, 0.55, 'sine', 0.9, 0.4, time, true);
              AudioEngine.playNoise(80, 0.1, 0.3, 1, 0.4, time);
              break;
      }
  }
};

const InfoModal = ({ show, onClose, t }: any) => {
    if (!show) return null;
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-2xl max-w-md w-full relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-white"><X size={20}/></button>
                <div className="flex items-center gap-2 mb-4">
                    <div className="bg-amber-500/20 p-2 rounded-lg"><Info size={24} className="text-amber-500"/></div>
                    <h2 className="text-xl font-bold text-white">{t.infoTitle}</h2>
                </div>
                <ul className="space-y-3">
                    {t.info.map((line: string, i: number) => (
                        <li key={i} className="text-sm text-slate-300 leading-relaxed border-b border-slate-800 pb-2 last:border-0">{line}</li>
                    ))}
                </ul>
                <div className="mt-6 text-center text-[10px] text-slate-500 uppercase font-bold tracking-widest">DrumMaster Pro V41</div>
            </div>
        </div>
    );
};

const ControlPanel = ({ 
  isPlaying, togglePlay, bpm, setBpm,
  patternKey, handleTransition, pendingPatternKey,
  preCount, setPreCount,
  showBeatIndicators, setShowBeatIndicators,
  speedRate, setSpeedRate,
  onRandom, onVariation,
  metronome, setMetronome,
  swing, setSwing,
  t, setShowInfo
}: any) => {
  const effectiveBpm = Math.round(bpm * speedRate);
  const togglePreCount = () => {
      setPreCount((prev: number) => {
          if (prev === 0) return 4;
          if (prev === 4) return 2;
          return 0;
      });
  };

  return (
    <div className="h-full bg-slate-900 text-slate-100 flex flex-col p-2 relative font-sans border-r border-slate-700 select-none overflow-hidden">
      <div className="flex-none flex flex-col gap-1.5 mb-2">
            <div className="flex items-center justify-between px-1">
                 <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setShowInfo(true)} title={t.infoTitle}>
                     <div className="bg-amber-500/10 p-1 rounded-md"><Music2 size={18} className="text-amber-500" /></div>
                     <div className="flex flex-col">
                        <span className="font-black text-sm text-white leading-none tracking-wide">DrumMaster</span>
                        <span className="text-[8px] text-amber-500 font-bold uppercase tracking-widest opacity-80">V41 Pro</span>
                     </div>
                 </div>
                 {pendingPatternKey && pendingPatternKey !== patternKey && (
                    <div className="text-[9px] text-amber-400 flex items-center gap-1 font-bold animate-pulse bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-900/30">
                        <ArrowRight size={8}/> {t.next}
                    </div>
                 )}
            </div>
            <div className="flex gap-1 h-8">
              <div className="relative flex-1 h-full min-w-0 group">
                <select 
                    value={patternKey}
                    onChange={(e) => handleTransition(e.target.value)}
                    className="w-full h-full bg-slate-800 text-slate-200 border border-slate-700 rounded-l-md pl-2 pr-6 text-xs font-bold focus:ring-1 focus:ring-amber-500 outline-none cursor-pointer hover:bg-slate-750 appearance-none truncate transition-colors"
                >
                    {Object.keys(CATEGORIES).map(catKey => (
                        <optgroup key={catKey} label={CATEGORIES[catKey as keyof typeof CATEGORIES].label}>
                            {Object.entries(DRUM_PATTERNS)
                                .filter(([_, p]) => p.cat === catKey)
                                .sort((a, b) => a[1].lv - b[1].lv)
                                .map(([k, p]) => (
                                    <option key={k} value={k}>{p.name}</option>
                                ))}
                        </optgroup>
                    ))}
                </select>
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-slate-300 transition-colors"><ListFilter size={12}/></div>
              </div>
              <button onClick={() => handleTransition(null, 'variation')} className="w-8 h-full bg-slate-800 hover:bg-purple-600/80 text-purple-200 hover:text-white border-y border-r border-slate-700 transition-all flex items-center justify-center" title={t.variation}><Sparkles size={14}/></button>
              <button onClick={() => handleTransition(null, 'random')} className="w-8 h-full bg-slate-800 hover:bg-amber-600/80 text-amber-200 hover:text-white rounded-r-md border-y border-r border-slate-700 transition-all flex items-center justify-center" title={t.random}><Dices size={14}/></button>
            </div>
      </div>
      <div className="flex-none bg-slate-800/60 rounded-lg p-2 border border-slate-700/50 mb-2">
          <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-end gap-1.5">
                  <div className="text-2xl font-black text-amber-400 leading-none tabular-nums tracking-tight">{effectiveBpm}</div>
                  <div className="text-[8px] text-slate-500 font-bold uppercase mb-0.5">{t.bpm}</div>
              </div>
              <input type="range" min="40" max="220" value={bpm} onChange={e=>setBpm(Number(e.target.value))} className="w-20 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400"/>
          </div>
          <div className="grid grid-cols-6 gap-0.5 bg-slate-900/50 p-0.5 rounded">
              {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(rate => (
                  <button key={rate} onClick={() => setSpeedRate(rate)} className={`text-[9px] py-1 rounded-sm font-bold transition-all ${speedRate === rate ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/50'}`}>x{rate}</button>
              ))}
          </div>
      </div>
      <button onClick={togglePlay} className={`flex-none w-full h-10 rounded-lg font-black text-sm tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all mb-2 transform active:scale-[0.98] ${isPlaying ? 'bg-gradient-to-br from-red-600 to-red-700 text-white ring-1 ring-red-400 shadow-red-900/20' : 'bg-gradient-to-br from-amber-500 to-orange-600 text-white hover:from-amber-400 hover:to-orange-500 shadow-amber-900/20'}`}>
        {isPlaying ? <Square fill="currentColor" size={14} /> : <Play fill="currentColor" size={14} />}
        {isPlaying ? t.stop : t.play}
      </button>
      <div className="flex-1 flex flex-col gap-2 min-h-0">
         <div className="flex-none bg-slate-800/40 rounded-lg p-2 border border-slate-700/50 flex flex-col justify-center">
             <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                    <Music2 size={10} className="text-slate-400"/>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t.swing}</span>
                </div>
                <span className="text-[9px] font-mono text-amber-400">{swing}%</span>
             </div>
             <input type="range" min="0" max="50" step="5" value={swing} onChange={e=>setSwing(Number(e.target.value))} className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400"/>
         </div>
         <div className="flex-1 grid grid-cols-3 gap-1.5">
            <button onClick={togglePreCount} className={`rounded border flex flex-col items-center justify-center gap-1 transition-all ${preCount ? 'bg-blue-500/20 border-blue-500/50 text-blue-200' : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-750'}`}>
                <RotateCcw size={14} className="mb-0.5"/>
                <span className="text-[9px] font-bold uppercase">{t.precount}</span>
                <span className="text-xs font-black">{preCount ? preCount : 'OFF'}</span>
            </button>
            <button onClick={() => setShowBeatIndicators(!showBeatIndicators)} className={`rounded border flex flex-col items-center justify-center gap-1 transition-all ${showBeatIndicators ? 'bg-teal-500/20 border-teal-500/50 text-teal-200' : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-750'}`}>
                <Layers size={14} className="mb-0.5"/>
                <span className="text-[9px] font-bold uppercase">{t.grid}</span>
                <span className="text-xs font-black">{showBeatIndicators ? 'ON' : 'OFF'}</span>
            </button>
            <button onClick={() => setMetronome(!metronome)} className={`rounded border flex flex-col items-center justify-center gap-1 transition-all ${metronome ? 'bg-pink-500/20 border-pink-500/50 text-pink-200' : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-750'}`}>
                <Mic2 size={14} className="mb-0.5"/>
                <span className="text-[9px] font-bold uppercase">{t.click}</span>
                <span className="text-xs font-black">{metronome ? 'ON' : 'OFF'}</span>
            </button>
         </div>
      </div>
    </div>
  );
};

const UpperBodyView = ({ isPlaying, instruments, shakeIntensity, muted, toggleMute, lang, setLang, t }: any) => {
  const isRH = isPlaying && (instruments.H || instruments.O || instruments.R || instruments.C || instruments.Sp); 
  const isLH = isPlaying && (instruments.S || instruments.S_G || instruments.S_R || instruments.C || instruments.L || instruments.Sp); 
  const isK = isPlaying && (instruments.K || instruments.K2);
  const handleInteraction = (muteId: string, instType: Instrument) => (e: any) => {
      e.preventDefault(); e.stopPropagation();
      const nextMutedState = !muted[muteId];
      toggleMute(muteId);
      if (!nextMutedState) AudioEngine.trigger(instType, {}); 
  };
  const Legend = ({x, y, text}: {x: number, y: number, text: string}) => ( <text x={x} y={y} fontSize="11" textAnchor="middle" fill="#94a3b8" fontWeight="bold">{text}</text> );
  const shakeX = shakeIntensity > 0 ? Math.random() * shakeIntensity - shakeIntensity/2 : 0;
  const shakeY = shakeIntensity > 0 ? Math.random() * shakeIntensity - shakeIntensity/2 : 0;
  const getStyle = (isHit: boolean, muteId: string) => ({
      transform: isHit ? 'scale(0.96)' : 'scale(1)', transition: 'transform 0.05s', opacity: muted[muteId] ? 0.3 : 1, filter: muted[muteId] ? 'grayscale(100%)' : 'none', cursor: 'pointer'
  });

  return (
    <div className="relative w-full h-full bg-slate-50 flex items-center justify-center border-b border-r border-slate-300 overflow-hidden">
       <div className="absolute top-2 left-2 z-10 px-3 py-1 rounded-full text-xs font-black text-slate-600 border border-slate-300 bg-white/90 shadow-sm flex items-center gap-1 pointer-events-none"><Hand size={12}/> {t.interactive}</div>
       <div className="absolute top-2 right-2 z-20"><div className="relative group"><button className="flex items-center gap-1 bg-white/90 border border-slate-300 rounded-md px-2 py-1 shadow-sm text-xs font-bold text-slate-600 hover:bg-slate-100"><Globe size={12} /> {lang.toUpperCase()}</button><div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg hidden group-hover:block w-24 z-30">{Object.keys(TRANSLATIONS).map(l => (<button key={l} onClick={() => setLang(l)} className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-amber-600">{l === 'zh-TW' ? '繁體中文' : l === 'zh-CN' ? '简体中文' : l === 'en' ? 'English' : l === 'ja' ? '日本語' : l === 'ko' ? '한국어' : 'ไทย'}</button>))}</div></div></div>
       <svg viewBox="0 0 500 350" className="w-full h-full max-w-2xl select-none drop-shadow-xl z-10" preserveAspectRatio="xMidYMid meet">
          <g transform={`translate(${shakeX}, ${shakeY})`}>
              <line transform="translate(90, 140)" x1="0" y1="0" x2="0" y2="180" stroke="#333" strokeWidth="4" opacity={muted['H'] ? 0.3 : 1} />
              <line transform="translate(140, 80)" x1="0" y1="0" x2="20" y2="200" stroke="#333" strokeWidth="4" opacity={muted['H'] ? 0.3 : 1} />
              <line transform="translate(390, 100)" x1="0" y1="0" x2="-20" y2="200" stroke="#333" strokeWidth="4" opacity={muted['H'] ? 0.3 : 1} />
              <line transform="translate(180, 100)" x1="0" y1="0" x2="-10" y2="150" stroke="#333" strokeWidth="3" opacity={muted['H'] ? 0.3 : 1} />
              <g transform="translate(250, 220)" onClick={handleInteraction('K', 'K')}><g style={getStyle(isK, 'K')}><circle cx="0" cy="0" r="80" fill={isK ? '#262626' : '#e2e8f0'} stroke={INST_COLOR.K} strokeWidth={isK ? 6 : 4} /><text x="0" y="5" fontSize="12" textAnchor="middle" fill={isK ? 'white' : INST_COLOR.K} opacity="0.8">KICK</text><Legend x={0} y={20} text="(●)" /></g></g>
              <g transform="translate(340, 240)" onClick={handleInteraction('T', 'F')}><g style={getStyle(instruments.F, 'T')}><ellipse cx="0" cy="0" rx="50" ry="45" fill={instruments.F ? INST_COLOR.F : '#f0fdf4'} stroke={INST_COLOR.F} strokeWidth="4" /><text x="0" y="5" fontSize="10" textAnchor="middle" fill={instruments.F?'white':INST_COLOR.F} opacity="0.8">FLOOR</text><Legend x={0} y={18} text="(●)" /></g></g>
              <g transform="translate(210, 140)" onClick={handleInteraction('T', 'T1')}><g style={getStyle(instruments.T1, 'T')}><ellipse cx="0" cy="0" rx="40" ry="35" fill={instruments.T1 ? INST_COLOR.T1 : '#eff6ff'} stroke={INST_COLOR.T1} strokeWidth="4" /><text x="0" y="5" fontSize="10" textAnchor="middle" fill={instruments.T1?'white':INST_COLOR.T1} opacity="0.8">T1</text><Legend x={0} y={18} text="(●)" /></g></g>
              <g transform="translate(290, 150)" onClick={handleInteraction('T', 'T2')}><g style={getStyle(instruments.T2, 'T')}><ellipse cx="0" cy="0" rx="42" ry="38" fill={instruments.T2 ? INST_COLOR.T2 : '#faf5ff'} stroke={INST_COLOR.T2} strokeWidth="4" /><text x="0" y="5" fontSize="10" textAnchor="middle" fill={instruments.T2?'white':INST_COLOR.T2} opacity="0.8">T2</text><Legend x={0} y={18} text="(●)" /></g></g>
              <g transform="translate(160, 240)" onClick={handleInteraction('S', 'S')}><g style={getStyle(isLH, 'S')}><ellipse cx="0" cy="0" rx="48" ry="42" fill={isLH ? INST_COLOR.S : '#fef2f2'} stroke={INST_COLOR.S} strokeWidth="4" /><text x="0" y="5" fontSize="10" textAnchor="middle" fill={isLH?'white':INST_COLOR.S} opacity="0.8">SNARE</text><Legend x={0} y={18} text="(●)" /></g></g>
              <g transform="translate(90, 140)" onClick={handleInteraction('H', 'H')}><g style={{...getStyle(false, 'H'), transform: isRH ? 'rotate(5deg)' : 'rotate(0)'}}><ellipse cx="0" cy="0" rx="55" ry="15" fill={instruments.H || instruments.O ? INST_COLOR.H : '#f1f5f9'} stroke={INST_COLOR.H} strokeWidth="3" /><text x="0" y="5" fontSize="10" textAnchor="middle" fill={instruments.H || instruments.O?'white':'#475569'} opacity="0.8">HH(X)</text></g></g>
              <g transform="translate(140, 80)" onClick={handleInteraction('H', 'C')}><g style={{...getStyle(false, 'H'), transform: instruments.C ? 'rotate(-8deg) scale(1.15)' : 'rotate(0)'}}><ellipse cx="0" cy="0" rx="58" ry="16" fill={instruments.C ? '#fef08a' : '#fef2f2'} stroke={INST_COLOR.C} strokeWidth="3" />{instruments.C && <circle cx="0" cy="0" r="20" fill="white" opacity="0.5" className="animate-ping" />}<text x="0" y="5" fontSize="10" textAnchor="middle" fill={instruments.C?'#78350f':INST_COLOR.C} opacity="0.8">CRASH(X)</text></g></g>
              <g transform="translate(180, 100)" onClick={handleInteraction('H', 'Sp')}><g style={{...getStyle(false, 'H'), transform: instruments.Sp ? 'rotate(-10deg) scale(1.2)' : 'rotate(0)'}}><ellipse cx="0" cy="0" rx="35" ry="10" fill={instruments.Sp ? '#fcd34d' : '#fff7ed'} stroke={INST_COLOR.Sp} strokeWidth="3" />{instruments.Sp && <circle cx="0" cy="0" r="15" fill="white" opacity="0.6" className="animate-ping" />}<text x="0" y="4" fontSize="8" textAnchor="middle" fill={instruments.Sp?'#451a03':INST_COLOR.Sp} opacity="0.9" fontWeight="bold">SP</text></g></g>
              <g transform="translate(390, 100)" onClick={handleInteraction('H', 'R')}><g style={{...getStyle(false, 'H'), transform: instruments.R ? 'rotate(5deg)' : 'rotate(0)'}}><ellipse cx="0" cy="0" rx="60" ry="18" fill={instruments.R ? INST_COLOR.R : '#eff6ff'} stroke={INST_COLOR.R} strokeWidth="3" /><path d="M-50,0 L-40,0" stroke={instruments.R?'white':INST_COLOR.R} strokeWidth="1" /><path d="M40,0 L50,0" stroke={instruments.R?'white':INST_COLOR.R} strokeWidth="1" /><text x="0" y="5" fontSize="10" textAnchor="middle" fill={instruments.R?'white':INST_COLOR.R} opacity="0.8">RIDE(X)</text></g></g>
          </g>
       </svg>
    </div>
  );
};

const PedalView = ({ isPlaying, instruments, pedalMode, setPedalMode, beaterColor, setBeaterColor, t, shakeIntensity }: any) => {
  const isK1 = isPlaying && (instruments.K || (pedalMode === 'single' && instruments.K2));
  const isK2 = isPlaying && instruments.K2; 
  const colorHex = BEATER_COLORS[beaterColor as keyof typeof BEATER_COLORS] || BEATER_COLORS.Red;
  const flashRight = isK1;
  const flashLeft = pedalMode === 'double' && isK2;
  const shakeX = shakeIntensity > 0 ? Math.random() * shakeIntensity - shakeIntensity/2 : 0;
  const shakeY = shakeIntensity > 0 ? Math.random() * shakeIntensity - shakeIntensity/2 : 0;
  
  return (
    <div className="relative w-full h-full bg-gray-200 flex flex-col items-center justify-center border-t border-r border-slate-300 overflow-hidden">
      <div className="absolute inset-0 flex w-full h-full pointer-events-none z-0">
          <div className={`flex-1 transition-colors duration-75 border-r border-slate-300/30 ${flashLeft ? 'bg-red-500/30' : 'bg-transparent'}`}></div>
          <div className={`flex-1 transition-colors duration-75 ${flashRight ? 'bg-red-500/30' : 'bg-transparent'}`}></div>
      </div>
      <div className="absolute top-2 left-2 z-20 flex flex-col items-start gap-2"><div className="flex gap-2"><div className="px-3 py-1 rounded-full text-xs font-bold text-slate-600 border border-slate-300 bg-white/90 shadow">{t.pedalCam}</div></div></div>
      <div className="absolute top-2 right-2 z-20"><div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-600"><button onClick={() => setPedalMode('single')} className={`px-2 py-0.5 text-[10px] font-bold rounded ${pedalMode==='single' ? 'bg-amber-500 text-white' : 'text-slate-400'}`}>{t.single} (`)</button><button onClick={() => setPedalMode('double')} className={`px-2 py-0.5 text-[10px] font-bold rounded ${pedalMode==='double' ? 'bg-amber-500 text-white' : 'text-slate-400'}`}>{t.double} (`)</button></div></div>
      <svg viewBox="0 0 400 300" className="w-full h-full max-w-lg relative z-10" preserveAspectRatio="xMidYMid meet">
         <g transform={`translate(${shakeX}, ${shakeY})`}>
             <circle cx="200" cy="80" r="90" fill="#f8fafc" stroke="#334155" strokeWidth="6" />
             <g transform="translate(200, 80)">
                 <rect x="-35" y="-15" width="70" height="30" fill="none" />
                 {Object.keys(BEATER_COLORS).map((c, i) => { const row = Math.floor(i / 4); const col = i % 4; const x = -30 + col * 20; const y = -10 + row * 20; return ( <circle key={c} cx={x} cy={y} r="6" fill={BEATER_COLORS[c as keyof typeof BEATER_COLORS]} stroke={beaterColor === c ? "#000" : "#cbd5e1"} strokeWidth={beaterColor === c ? 2 : 1} className="cursor-pointer hover:opacity-80" onClick={() => setBeaterColor(c)} /> ); })}
             </g>
             {pedalMode === 'double' && ( <text x="50" y="180" fontSize="100" fontWeight="900" fill={isK2 ? "#ef4444" : "#94a3b8"} opacity={isK2 ? "0.8" : "0.15"} textAnchor="middle">L</text> )}
             <text x="350" y="180" fontSize="100" fontWeight="900" fill={isK1 ? "#3b82f6" : "#94a3b8"} opacity={isK1 ? "0.8" : "0.15"} textAnchor="middle">R</text>
             <defs><linearGradient id="plateGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#334155"/><stop offset="100%" stopColor="#0f172a"/></linearGradient><linearGradient id="metalGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#94a3b8"/><stop offset="50%" stopColor="#e2e8f0"/><stop offset="100%" stopColor="#64748b"/></linearGradient></defs>
             <path d="M70 280 L130 280 L120 230 L80 230 Z" fill="url(#plateGrad)" stroke="#1e293b" strokeWidth="2" /> 
             <path d="M270 280 L330 280 L320 230 L280 230 Z" fill="url(#plateGrad)" stroke="#1e293b" strokeWidth="2" /> 
             <rect x="120" y="240" width="160" height="10" fill="url(#metalGradient)" rx="2" stroke="#1e293b" />
             <path d="M60 230 L60 260" stroke="#64748b" strokeWidth="3" strokeDasharray="2,1"/>
             <path d="M340 230 L340 260" stroke="#64748b" strokeWidth="3" strokeDasharray="2,1"/>
             {pedalMode === 'double' && ( <g transform={`translate(180, 240) rotate(${isK2 ? -5 : -30}) translate(0, -140)`} style={{transition: 'transform 0.02s cubic-bezier(0.1, 0.7, 1.0, 0.1)'}}> <rect x="-4" y="0" width="8" height="150" fill="#94a3b8" stroke="#475569" rx="2" /> <circle cx="0" cy="0" r="16" fill={colorHex} stroke="black" strokeWidth="2"/> {isK2 && <circle cx="0" cy="0" r="20" fill="white" opacity="0.3" className="animate-ping" />} <rect x="-16" y="-6" width="32" height="12" fill="white" opacity="0.4" rx="2"/> </g> )}
             <g transform={`translate(${pedalMode === 'single' ? 200 : 220}, 240) rotate(${isK1 ? 5 : 30}) translate(0, -140)`} style={{transition: 'transform 0.02s cubic-bezier(0.1, 0.7, 1.0, 0.1)'}}> <rect x="-4" y="0" width="8" height="150" fill="#94a3b8" stroke="#475569" rx="2" /> <circle cx="0" cy="0" r="16" fill={colorHex} stroke="black" strokeWidth="2"/> {isK1 && <circle cx="0" cy="0" r="20" fill="white" opacity="0.3" className="animate-ping" />} <rect x="-16" y="-6" width="32" height="12" fill="white" opacity="0.4" rx="2"/> </g>
             <path d="M100 230 L100 270" stroke="#475569" strokeWidth="5" strokeDasharray="3,1"/>
             <path d="M300 230 L300 270" stroke="#475569" strokeWidth="5" strokeDasharray="3,1"/>
         </g>
      </svg>
    </div>
  );
};

const SheetMusicView = React.memo(({ patternData, meter, showBeatIndicators, pedalMode, currentStep, isPlaying, onBeatRepeat }: any) => {
  if (!patternData || !patternData.meter) return null; 
  const { steps, gridSize } = patternData;
  const START_X = 80; const END_X = 410; const CONTENT_WIDTH = END_X - START_X; const STEP_WIDTH = CONTENT_WIDTH / gridSize;
  const isCompound = meter[1] === 8; const stepsPerBeat = isCompound ? 3 : (gridSize / meter[0]);
  const elements = [];
  const BEAT_IND_Y = 15; const STICKING_Y = 32; const ACCENT_Y = 42; const STEM_TOP_Y = 50; const STAFF_TOP = 80; const STEM_BOT_Y = STAFF_TOP + 60; 
  const yCrash = STAFF_TOP - 20; const yHiHat = STAFF_TOP - 7; const yRide = STAFF_TOP; const yTom1 = STAFF_TOP + 5; const yTom2 = STAFF_TOP + 10; const ySnarePos = STAFF_TOP + 15; const yFloor = STAFF_TOP + 25; const yKick = STAFF_TOP + 35; 

  const checkEmpty = (start: number, count: number) => {
    if (start + count > gridSize) return false;
    for (let k = 0; k < count; k++) {
        if (steps[start + k].some((n: string) => n !== '.')) return false;
    }
    return true;
  };

  if (showBeatIndicators) {
    const numBeats = isCompound ? gridSize / 3 : meter[0];
    for (let b = 0; b < numBeats; b++) {
        const beatX = START_X + (b * stepsPerBeat * STEP_WIDTH); const nextBeatX = START_X + ((b+1) * stepsPerBeat * STEP_WIDTH);
        const currentBeatIndex = Math.floor(currentStep / stepsPerBeat); const isActiveBeat = isPlaying && currentBeatIndex === b;
        if (isActiveBeat) elements.push(<rect key={`beat_hl_${b}`} x={beatX} y={10} width={nextBeatX - beatX} height={140} fill="#fb923c" opacity="0.15" rx="4" />);
        elements.push( <text key={`bi${b}`} x={beatX} y={BEAT_IND_Y} fontSize="20" fontWeight="900" fill="#ef4444" textAnchor="start" className="cursor-pointer hover:fill-amber-500 hover:font-black transition-colors" onClick={(e) => { e.stopPropagation(); if(onBeatRepeat) onBeatRepeat(b); }} > {b + 1} </text> );
        elements.push(<line key={`bl_${b}`} x1={beatX} y1={BEAT_IND_Y + 10} x2={beatX} y2={STAFF_TOP + 50} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4,2" />);
    }
  }

  for(let i=0; i<5; i++) elements.push(<line key={`l${i}`} x1={10} y1={STAFF_TOP + i*10} x2={END_X} y2={STAFF_TOP+i*10} stroke="#000" strokeWidth="1"/>);
  elements.push(<rect key="clef1" x={20} y={STAFF_TOP+10} width={4} height={20} fill="#000" />); elements.push(<rect key="clef2" x={28} y={STAFF_TOP+10} width={4} height={20} fill="#000" />);
  elements.push(<text key="ts-top" x={50} y={STAFF_TOP+18} fontSize="22" fontWeight="bold" fontFamily="serif" textAnchor="middle">{meter[0]}</text>);
  elements.push(<text key="ts-bot" x={50} y={STAFF_TOP+38} fontSize="22" fontWeight="bold" fontFamily="serif" textAnchor="middle">{meter[1]}</text>);
  elements.push(<line key="barEnd" x1={END_X} y1={STAFF_TOP} x2={END_X} y2={STAFF_TOP+40} stroke="#000" strokeWidth="3" />);

  const Rest = ({ type, x, y, color }: any) => {
      if (type === 'quarter') return ( <path d={`M ${x-3},${y-10} L ${x+3},${y-4} L ${x-2},${y+1} L ${x+3},${y+6} Q ${x+5},${y+10} ${x+2},${y+14} Q ${x-1},${y+16} ${x-3},${y+12} Q ${x-1},${y+10} ${x+1},${y+8} L ${x-2},${y+4} L ${x+3},${y-2} L ${x-3},${y-8} Z`} fill={color} /> );
      if (type === '8th') return ( <g> <circle cx={x-2} cy={y-3} r={3} fill={color} /> <path d={`M ${x-2},${y-3} Q ${x+4},${y+2} ${x+1},${y+12} L ${x},${y+12} Q ${x+2},${y+2} ${x-2},${y-1}`} fill={color} /> </g> );
      if (type === '16th') return ( <g> <circle cx={x-2} cy={y-6} r={2.5} fill={color} /> <path d={`M ${x-2},${y-6} Q ${x+4},${y-1} ${x+1},${y+8} L ${x},${y+8} Q ${x+2},${y-1} ${x-2},${y-4}`} fill={color} /> <circle cx={x-2} cy={y+2} r={2.5} fill={color} /> <path d={`M ${x-2},${y+2} Q ${x+4},${y+7} ${x+1},${y+16} L ${x},${y+16} Q ${x+2},${y+7} ${x-2},${y+4}`} fill={color} /> </g> );
      return null;
  };
  
  let skipCount = 0;
  for (let i = 0; i < gridSize; i++) {
      if (skipCount > 0) { skipCount--; continue; }
      const inst = steps[i]; const hasNotes = inst.some((k: string) => k !== '.');
      const x = START_X + i * STEP_WIDTH + (STEP_WIDTH/2); const isCurrent = isPlaying && currentStep === i; const noteColor = isCurrent ? "#ef4444" : "black"; 
      if (hasNotes) {
          const notes = [];
          const hasHands = inst.includes('H') || inst.includes('O') || inst.includes('R') || inst.includes('S') || inst.includes('S_G') || inst.includes('S_R') || inst.includes('T1') || inst.includes('T2') || inst.includes('F') || inst.includes('C') || inst.includes('L') || inst.includes('Sp');
          const hasFeet = inst.includes('K') || inst.includes('K2');
          let hasDot = false;
          if (gridSize === 16 && (hasHands || hasFeet)) { if (i + 2 < gridSize) { const next1 = steps[i+1]; const next2 = steps[i+2]; const next1Empty = !next1.some((k: Instrument) => k!=='S_G' && k!=='.'); const next2Empty = !next2.some((k: Instrument) => k!=='S_G' && k!=='.'); if (next1Empty && next2Empty) hasDot = true; } }
          if (hasDot) skipCount = 2;
          if (hasHands) {
              let stemStartY = -1; let hasAccent = false;
              if (inst.includes('F')) stemStartY = Math.max(stemStartY, yFloor); if (inst.includes('S') || inst.includes('S_G') || inst.includes('L')) stemStartY = Math.max(stemStartY, ySnarePos); if (inst.includes('T2')) stemStartY = Math.max(stemStartY, yTom2); if (inst.includes('T1')) stemStartY = Math.max(stemStartY, yTom1); if (inst.includes('R')) stemStartY = Math.max(stemStartY, yRide); if (inst.includes('H') || inst.includes('O')) stemStartY = Math.max(stemStartY, yHiHat); if (inst.includes('C') || inst.includes('Sp')) stemStartY = Math.max(stemStartY, yCrash);
              if (inst.includes('C') || inst.includes('O')) hasAccent = true;
              if (stemStartY !== -1) notes.push(<line key={`stem_up_${i}`} x1={x+3.5} y1={stemStartY} x2={x+3.5} y2={STEM_TOP_Y} stroke={noteColor} strokeWidth="1.5" />);
              if (hasAccent) notes.push(<path key={`acc_${i}`} d={`M ${x},${ACCENT_Y} L ${x+6},${ACCENT_Y+3} L ${x},${ACCENT_Y+6}`} stroke={noteColor} strokeWidth="2" fill="none" transform={`rotate(0, ${x}, ${ACCENT_Y})`} />); 
              if (hasDot) notes.push(<circle key={`dot_${i}`} cx={x+8} cy={stemStartY} r={2} fill={noteColor} />);
              const hasRide = inst.includes('R'); const hasHH = inst.includes('H') || inst.includes('O'); const rideX = hasHH ? x + 4 : x; const hhX = hasRide ? x - 4 : x;
              if (inst.includes('H')) { notes.push(<g key={`nh_h_${i}`} transform={`translate(${hhX}, ${yHiHat})`}><line x1="-4" y1="-4" x2="4" y2="4" stroke={INST_COLOR.H} strokeWidth="2"/><line x1="4" y1="-4" x2="-4" y2="4" stroke={INST_COLOR.H} strokeWidth="2"/></g>); if (gridSize===16) notes.push(<text key={`stk_${i}`} x={hhX} y={STICKING_Y} fontSize="10" textAnchor="middle" fill="#64748b" fontWeight="bold">{i%2===0?'R':'L'}</text>); }
              if (inst.includes('O')) { notes.push(<g key={`nh_o_${i}`} transform={`translate(${hhX}, ${yHiHat})`}> <line x1="-4" y1="-4" x2="4" y2="4" stroke={INST_COLOR.H} strokeWidth="2"/><line x1="4" y1="-4" x2="-4" y2="4" stroke={INST_COLOR.H} strokeWidth="2"/> <circle cx="0" cy="-8" r="3" fill="none" stroke={INST_COLOR.H} strokeWidth="1.5"/> </g>); if(gridSize===16) notes.push(<text key={`stk_${i}`} x={hhX} y={STICKING_Y} fontSize="10" textAnchor="middle" fill="#64748b" fontWeight="bold">{i%2===0?'R':'L'}</text>); }
              if (inst.includes('R')) notes.push(<g key={`nh_r_${i}`} transform={`translate(${rideX}, ${yRide})`}><path d="M0,-5 L5,0 L0,5 L-5,0 Z" fill="white" stroke={INST_COLOR.R} strokeWidth="2"/></g>);
              if (inst.includes('C')) { notes.push(<line key={`led_c_${i}`} x1={x-8} y1={yCrash} x2={x+8} y2={yCrash} stroke={INST_COLOR.C} strokeWidth="1"/>); notes.push(<g key={`nh_c_${i}`} transform={`translate(${x}, ${yCrash})`}><path d="M-6,0 L6,0 M0,-6 L0,6 M-4,-4 L4,4 M-4,4 L4,-4" stroke={INST_COLOR.C} strokeWidth="2" /></g>); }
              if (inst.includes('Sp')) { notes.push(<line key={`led_sp_${i}`} x1={x-8} y1={yCrash} x2={x+8} y2={yCrash} stroke={INST_COLOR.Sp} strokeWidth="1"/>); notes.push(<g key={`nh_sp_${i}`} transform={`translate(${x}, ${yCrash})`}><path d="M0,-5 L4,0 L0,5 L-4,0 Z" fill={INST_COLOR.Sp} stroke="none" /></g>); }
              if (inst.includes('S')) notes.push(<circle key={`nh_s_${i}`} cx={x} cy={ySnarePos} r={5} fill={INST_COLOR.S} />);
              if (inst.includes('L')) notes.push(<circle key={`nh_l_${i}`} cx={x} cy={ySnarePos} r={5} fill={INST_COLOR.S} />);
              if (inst.includes('S_G')) { notes.push(<text key={`gh_${i}`} x={x-6} y={ySnarePos+4} fontSize="14" fontWeight="bold" fill={INST_COLOR.Ghost} textAnchor="end">(</text>); notes.push(<circle key={`nh_sg_${i}`} cx={x} cy={ySnarePos} r={4} fill={INST_COLOR.S} />); notes.push(<text key={`gh2_${i}`} x={x+6} y={ySnarePos+4} fontSize="14" fontWeight="bold" fill={INST_COLOR.Ghost} textAnchor="start">)</text>); }
              if (inst.includes('T1')) notes.push(<circle key={`nh_t1_${i}`} cx={x} cy={yTom1} r={5} fill={INST_COLOR.T1} />);
              if (inst.includes('T2')) notes.push(<circle key={`nh_t2_${i}`} cx={x} cy={yTom2} r={5} fill={INST_COLOR.T2} />);
              if (inst.includes('F')) notes.push(<circle key={`nh_f_${i}`} cx={x} cy={yFloor} r={5} fill={INST_COLOR.F} />);
          }
          if (hasFeet) {
              let stemStartY = 999; if (inst.includes('K') || inst.includes('K2')) stemStartY = Math.min(stemStartY, yKick);
              notes.push(<line key={`stem_down_${i}`} x1={x-3.5} y1={stemStartY} x2={x-3.5} y2={STEM_BOT_Y} stroke={noteColor} strokeWidth="1.5" />);
              notes.push(<circle key={`nh_k_${i}`} cx={x} cy={yKick} r={5} fill={INST_COLOR.K} />);
              const lineY1 = STEM_BOT_Y + 5; const lineY2 = STEM_BOT_Y + 10; const lineW = STEP_WIDTH * 0.8;
              notes.push(<line key={`jp_1_${i}`} x1={x-lineW/2} y1={lineY1} x2={x+lineW/2} y2={lineY1} stroke={INST_COLOR.K} strokeWidth="2" />);
              if (gridSize === 16 && !hasDot) notes.push(<line key={`jp_2_${i}`} x1={x-lineW/2} y1={lineY2} x2={x+lineW/2} y2={lineY2} stroke={INST_COLOR.K} strokeWidth="2" />);
              if (hasDot) notes.push(<circle key={`dot_k_${i}`} cx={x+8} cy={yKick} r={2} fill={INST_COLOR.K} />);
              let footStick = ''; if (pedalMode === 'double') footStick = inst.includes('K2') ? 'L' : 'R'; else if (inst.includes('K2') || inst.includes('K')) footStick = 'R'; 
              if (footStick) notes.push(<text key={`fstk_${i}`} x={x} y={STEM_BOT_Y + 22} fontSize="11" textAnchor="middle" fill="#64748b" fontWeight="bold">{footStick}</text>);
          }
          if (notes.length > 0) elements.push(<g key={`note_grp_${i}`}>{notes}</g>);
      } else {
          let duration = 1; let rType = '16th';
          if (gridSize % 4 === 0) { if (i % 4 === 0 && checkEmpty(i, 4)) { duration = 4; rType = 'quarter'; } else if (i % 2 === 0 && checkEmpty(i, 2)) { duration = 2; rType = '8th'; } else { duration = 1; rType = '16th'; } } else if (gridSize % 3 === 0) { rType = '8th'; }
          const rX = START_X + (i + (duration/2) - 0.5) * STEP_WIDTH + (STEP_WIDTH/2);
          elements.push(<Rest key={`r_${i}`} type={rType} x={rX} y={STAFF_TOP + 20} color="#475569" />); skipCount = duration - 1;
      }
  }

  const drawBeams = (voice: string, stemTipY: number, direction: number) => {
      const numGroups = meter[0] === 12 || meter[0] === 6 || meter[0] === 9 ? meter[0] / 3 : meter[0];
      for (let b = 0; b < numGroups; b++) {
          const beatStart = b * stepsPerBeat; const beatEnd = (b + 1) * stepsPerBeat; const activeIndices = [];
          for(let i = beatStart; i < beatEnd; i++) { if (i >= gridSize) break; const inst = steps[i]; const isActive = (voice === 'hands') ? (inst.includes('H') || inst.includes('O') || inst.includes('R') || inst.includes('S') || inst.includes('S_G') || inst.includes('T1') || inst.includes('T2') || inst.includes('F') || inst.includes('C') || inst.includes('Sp') || inst.includes('L')) : (inst.includes('K') || inst.includes('K2')); if(isActive) activeIndices.push(i); }
          if (activeIndices.length > 1) {
              const firstIdx = activeIndices[0]; const lastIdx = activeIndices[activeIndices.length - 1]; let xOffset = voice === 'hands' ? 3.5 : -3.5;
              const x1 = START_X + firstIdx * STEP_WIDTH + (STEP_WIDTH/2) + xOffset; const x2 = START_X + lastIdx * STEP_WIDTH + (STEP_WIDTH/2) + xOffset;
              elements.push(<line key={`bm_1_${voice}_${b}`} x1={x1} y1={stemTipY} x2={x2} y2={stemTipY} stroke="black" strokeWidth="4.5" strokeLinecap="butt" />);
              
              if (voice === 'hands' && (stepsPerBeat === 3 || stepsPerBeat === 6)) {
                  const tupletNumber = stepsPerBeat; 
                  // Calculate FULL BEAT WIDTH for bracket, regardless of note position
                  const beatStartX = START_X + (b * stepsPerBeat * STEP_WIDTH) + 2; 
                  const beatEndX = START_X + ((b + 1) * stepsPerBeat * STEP_WIDTH) - 2;
                  const centerX = (beatStartX + beatEndX) / 2;
                  const bracketY = stemTipY - 12;
                  // Standard bracket shape spanning the whole beat
                  elements.push(<polyline key={`tup_br_${b}`} points={`${beatStartX} ${stemTipY-8} ${beatStartX} ${bracketY} ${centerX-8} ${bracketY}`} fill="none" stroke="#0f172a" strokeWidth="1" />);
                  elements.push(<polyline key={`tup_br2_${b}`} points={`${centerX+8} ${bracketY} ${beatEndX} ${bracketY} ${beatEndX} ${stemTipY-8}`} fill="none" stroke="#0f172a" strokeWidth="1" />);
                  elements.push(<text key={`tup_${b}`} x={centerX} y={bracketY+4} fontSize="11" fontWeight="bold" textAnchor="middle" fill="#0f172a">{tupletNumber}</text>);
              }

              if (gridSize === 16) { 
                  for(let k=0; k<activeIndices.length-1; k++) { 
                      const curr = activeIndices[k]; const next = activeIndices[k+1]; 
                      const subX1 = START_X + curr * STEP_WIDTH + (STEP_WIDTH/2) + xOffset;
                      const subX2 = START_X + next * STEP_WIDTH + (STEP_WIDTH/2) + xOffset;
                      const yOffset = direction === 1 ? 8 : -8;
                      
                      if (next - curr === 1) { 
                          elements.push(<line key={`bm_2_${voice}_${curr}`} x1={subX1} y1={stemTipY+yOffset} x2={subX2} y2={stemTipY+yOffset} stroke="black" strokeWidth="4.5" strokeLinecap="butt" />); 
                      } else if (next - curr > 1) {
                          // Fix for hanging beams - don't draw if not consecutive 16ths in the sub-beat context
                          // Simplified: only draw short stubs if needed, but for now standard notation prefers connected beams within beat groups
                      } 
                  } 
              }
          }
      }
  };
  drawBeams('hands', STEM_TOP_Y, 1);
  if (isPlaying && currentStep >= 0) { const cursorX = START_X + currentStep * STEP_WIDTH + (STEP_WIDTH/2); elements.push( <g key="cursor" transform={`translate(${cursorX}, 0)`} style={{ transition: 'transform 0.05s linear' }}> <line x1="0" y1="20" x2="0" y2="150" stroke="#ef4444" strokeWidth="2" strokeOpacity="0.8" /> <path d="M0,20 L5,15 L-5,15 Z" fill="#ef4444" /> </g> ); }

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
    const [variationData, setVariationData] = useState<Pattern | null>(null);
    const [muted, setMuted] = useState<Record<string, boolean>>({ K: false, S: false, H: false, T: false });
    const [swing, setSwing] = useState(0);
    const [shakeIntensity, setShakeIntensity] = useState(0); 
    const [lang, setLang] = useState<LangKey>('zh-TW');
    const [showInfo, setShowInfo] = useState(false);

    const nextNoteTimeRef = useRef(0);
    const currentStepRef = useRef(0);
    const timerIDRef = useRef<number | null>(null);
    const stateRef = useRef({ isPlaying, bpm, speedRate, patternKey, pendingPatternKey, metronome, preCount, variationData, muted, swing });

    useEffect(() => { stateRef.current = { isPlaying, bpm, speedRate, patternKey, pendingPatternKey, metronome, preCount, variationData, muted, swing }; }, [isPlaying, bpm, speedRate, patternKey, pendingPatternKey, metronome, preCount, variationData, muted, swing]);

    const togglePlay = useCallback(() => setIsPlaying(prev => !prev), []);
    const changePattern = (k: string) => { if (isPlaying) setPendingPatternKey(k); else { setPatternKey(k); setVariationData(null); } };
    const toggleMute = (id: string) => { setMuted(prev => ({ ...prev, [id]: !prev[id] })); };
    const onBeatRepeat = (beatIndex: number) => { const pattern = variationData || DRUM_PATTERNS[patternKey]; const { steps, gridSize, meter } = pattern; const isCompound = meter[1] === 8; let stepsPerBeat = isCompound ? 3 : gridSize / meter[0]; const start = beatIndex * stepsPerBeat; if (start >= gridSize) return; const slice = steps.slice(start, start + stepsPerBeat); if (slice.length === 0) return; const newSteps: Instrument[][] = []; for(let i = 0; i < gridSize; i++) { newSteps.push([...slice[i % slice.length]]); } setVariationData({ ...pattern, name: `${pattern.name} (Loop)`, steps: newSteps, isVariation: true }); };

    const activePattern = variationData || DRUM_PATTERNS[patternKey];

    // Smart Transition Logic
    const handleTransition = (targetPatternKey: string | null = null, transitionType?: 'variation' | 'random') => {
        if (!isPlaying) {
            if (targetPatternKey) changePattern(targetPatternKey);
            else if (transitionType === 'variation') onVariation();
            else if (transitionType === 'random') {
                 const keys = Object.keys(DRUM_PATTERNS).filter(k => !DRUM_PATTERNS[k].isVariation); 
                 changePattern(keys[Math.floor(Math.random() * keys.length)]);
            }
            return;
        }

        // Logic: If playing and within first 3 beats (of 4), inject a fill in the last beat
        const currentStep = currentStepRef.current;
        const grid = activePattern.gridSize;
        const stepsPerBeat = grid / activePattern.meter[0];
        const lastBeatStart = grid - stepsPerBeat; // e.g., 12 in 16 grid

        if (currentStep < lastBeatStart) {
            // INJECT FILL
            const currentSteps = activePattern.steps.map(s => [...s]);
            // Clear last beat
            for(let i = lastBeatStart; i < grid; i++) { currentSteps[i] = []; }
            
            // Generate Fill (Simple Snare/Tom run)
            if (stepsPerBeat === 4) {
                // 16th note fill
                currentSteps[lastBeatStart].push('S'); 
                currentSteps[lastBeatStart+1].push('S');
                currentSteps[lastBeatStart+2].push('T1');
                currentSteps[lastBeatStart+3].push('F');
                currentSteps[lastBeatStart].push('C'); // Accent start of fill
            } else if (stepsPerBeat === 3) {
                // Triplet fill
                currentSteps[lastBeatStart].push('S');
                currentSteps[lastBeatStart+1].push('T1');
                currentSteps[lastBeatStart+2].push('F');
            } else if (stepsPerBeat === 6) {
                currentSteps[lastBeatStart].push('S'); currentSteps[lastBeatStart+1].push('S');
                currentSteps[lastBeatStart+2].push('T1'); currentSteps[lastBeatStart+3].push('T1');
                currentSteps[lastBeatStart+4].push('F'); currentSteps[lastBeatStart+5].push('F');
            }

            // Apply modification immediately
            setVariationData({...activePattern, steps: currentSteps, name: activePattern.name}); // Keep name same
            
            // Queue next
            if (targetPatternKey) setPendingPatternKey(targetPatternKey);
            else if (transitionType === 'variation') {
                 setPendingPatternKey(patternKey);
            }
            else if (transitionType === 'random') {
                 const keys = Object.keys(DRUM_PATTERNS).filter(k => !DRUM_PATTERNS[k].isVariation);
                 const nextKey = keys[Math.floor(Math.random() * keys.length)];
                 setPendingPatternKey(nextKey);
            }
        } else {
            // Too late for fill, just queue
            if (targetPatternKey) changePattern(targetPatternKey);
            else if (transitionType === 'variation') onVariation();
            else if (transitionType === 'random') {
                 const keys = Object.keys(DRUM_PATTERNS).filter(k => !DRUM_PATTERNS[k].isVariation); 
                 changePattern(keys[Math.floor(Math.random() * keys.length)]);
            }
        }
    };

    const generateVariation = (currentPattern: Pattern) => {
        const newSteps = currentPattern.steps.map(step => [...step]); 
        // ... (Variation logic is normally inside onVariation) ...
        return { ...currentPattern, name: `${currentPattern.name} (Var)`, steps: newSteps, isVariation: true };
    };

    useEffect(() => {
        if (isPlaying) {
            AudioEngine.init(); const lookahead = 25.0; const scheduleAheadTime = 0.1; 
            if (nextNoteTimeRef.current < AudioEngine.ctx!.currentTime) nextNoteTimeRef.current = AudioEngine.ctx!.currentTime + 0.05;
            
            const { preCount, patternKey, variationData } = stateRef.current;
            const pattern = variationData || DRUM_PATTERNS[patternKey];
            const stepsPerBeat = (pattern.meter[1] === 8) ? 3 : 4;
            if (preCount > 0) { currentStepRef.current = -(preCount * stepsPerBeat); } else { currentStepRef.current = 0; }

            const nextNote = () => {
                const { bpm, speedRate, patternKey, variationData, swing } = stateRef.current;
                const pattern = variationData || DRUM_PATTERNS[patternKey];
                const secondsPerBeat = 60.0 / (bpm * speedRate); const stepsPerBeat = (pattern.meter[1] === 8) ? 3 : 4; const baseStepTime = secondsPerBeat / stepsPerBeat;
                let duration = baseStepTime;
                if (pattern.gridSize === 16 && currentStepRef.current >= 0) { if (currentStepRef.current % 2 === 0) { duration = baseStepTime * (1 + (swing/100)); } else { duration = baseStepTime * (1 - (swing/100)); } }
                nextNoteTimeRef.current += duration; currentStepRef.current++;
                if (currentStepRef.current === pattern.gridSize) { currentStepRef.current = 0; if (stateRef.current.pendingPatternKey) { setPatternKey(stateRef.current.pendingPatternKey); setVariationData(null); setPendingPatternKey(null); } }
            };
            const scheduleNote = (stepNumber: number, time: number) => {
                const { patternKey, metronome, variationData, muted } = stateRef.current;
                const pattern = variationData || DRUM_PATTERNS[patternKey]; 
                const stepsPerBeat = (pattern.meter[1] === 8) ? 3 : 4;
                if (stepNumber < 0) { if (Math.abs(stepNumber) % stepsPerBeat === 0) AudioEngine.playClick(true, time); return; }
                const step = pattern.steps[stepNumber];
                if (metronome) { if (stepNumber % stepsPerBeat === 0) AudioEngine.playClick(stepNumber === 0, time); }
                if (step) {
                    let hasShake = false; step.forEach(inst => { if (inst !== '.') AudioEngine.trigger(inst, muted, time); if (inst === 'C' || inst === 'K') hasShake = true; });
                    const timeToVisual = (time - AudioEngine.ctx!.currentTime) * 1000;
                    setTimeout(() => { const active: Record<string, boolean> = {}; step.forEach(inst => { if(inst!=='.') active[inst] = true; }); setInstruments(active); setCurrentStep(stepNumber); if (hasShake) { setShakeIntensity(5); setTimeout(() => setShakeIntensity(0), 100); } setTimeout(() => setInstruments({}), 50); }, Math.max(0, timeToVisual));
                }
            };
            const scheduler = () => { let loops = 0; while (nextNoteTimeRef.current < AudioEngine.ctx!.currentTime + scheduleAheadTime && loops < 100) { scheduleNote(currentStepRef.current, nextNoteTimeRef.current); nextNote(); loops++; } timerIDRef.current = window.setTimeout(scheduler, lookahead); };
            scheduler();
        } else { if (timerIDRef.current) window.clearTimeout(timerIDRef.current); setInstruments({}); currentStepRef.current = 0; setCurrentStep(0); }
        return () => { if (timerIDRef.current) window.clearTimeout(timerIDRef.current); };
    }, [isPlaying]);

    const onVariation = () => { 
        const currentPattern = activePattern; const newSteps = currentPattern.steps.map(step => [...step]); const is16Grid = currentPattern.gridSize === 16; 
        for (let i = 0; i < currentPattern.gridSize; i++) { 
            const isDownbeat = i % 4 === 0; const isBackbeat = (i === 4 || i === 12) && is16Grid; 
            if (!isDownbeat && newSteps[i].length === 0) { if (Math.random() < 0.3) newSteps[i].push('S_G'); } 
            else if (!isDownbeat && newSteps[i].includes('H') && !newSteps[i].includes('S') && !newSteps[i].includes('K')) { if (Math.random() < 0.2) newSteps[i].push('S_G'); } 
            if (i !== 0 && newSteps[i].includes('K')) { if (Math.random() < 0.2) { newSteps[i] = newSteps[i].filter(inst => inst !== 'K'); if (i + 1 < currentPattern.gridSize && !newSteps[i+1].includes('K')) newSteps[i+1].push('K'); } } 
            else if (i !== 0 && !newSteps[i].includes('K') && !isBackbeat) { if (Math.random() < 0.1) newSteps[i].push('K'); } 
            if (newSteps[i].includes('H') && !isDownbeat) { 
                if (Math.random() < 0.05) { newSteps[i] = newSteps[i].filter(inst => inst !== 'H'); newSteps[i].push('O'); } 
                if (Math.random() < 0.03) { newSteps[i].push('Sp'); }
            } 
        } 
        setVariationData({ ...currentPattern, name: `${currentPattern.name} (Var)`, steps: newSteps, isVariation: true }); 
    };
    const t = TRANSLATIONS[lang];

    useEffect(() => { const handleKey = (e: KeyboardEvent) => { if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return; if (e.code === 'Space') { e.preventDefault(); if (e.ctrlKey) handleTransition(null, 'random'); else if (e.shiftKey) handleTransition(null, 'variation'); else togglePlay(); } if (e.key === '+' || e.key === '=' || e.code === 'ArrowRight') setSpeedRate((p: number) => {const R=[0.5,0.75,1,1.25,1.5,2]; const i=R.indexOf(p); return i<R.length-1?R[i+1]:p}); if (e.key === '-' || e.key === '_' || e.code === 'ArrowLeft') setSpeedRate((p: number) => {const R=[0.5,0.75,1,1.25,1.5,2]; const i=R.indexOf(p); return i>0?R[i-1]:p}); if (e.key === '1') setPreCount((p: number) => p===0?4:p===4?2:0); if (e.key === '2') setShowBeatIndicators((p: boolean) => !p); if (e.key === '3') setMetronome((p: boolean) => !p); if (e.key === '`') setPedalMode((p: string) => p==='single'?'double':'single'); }; window.addEventListener('keydown', handleKey); return () => window.removeEventListener('keydown', handleKey); }, [togglePlay, patternKey]);

    return (
        <div className="w-full h-[100dvh] bg-slate-900 flex flex-col md:grid md:grid-cols-2 md:grid-rows-2 overflow-hidden select-none font-sans touch-none">
            <InfoModal show={showInfo} onClose={() => setShowInfo(false)} t={t} />
            <div className="order-1 md:row-span-1 md:col-span-1 flex-1 md:h-auto min-h-0 border-r border-b border-slate-700 relative z-20 shadow-xl overflow-y-auto">
                 <ControlPanel isPlaying={isPlaying} togglePlay={togglePlay} bpm={bpm} setBpm={setBpm} patternKey={patternKey} handleTransition={handleTransition} changePattern={changePattern} pendingPatternKey={pendingPatternKey} preCount={preCount} setPreCount={setPreCount} showBeatIndicators={showBeatIndicators} setShowBeatIndicators={setShowBeatIndicators} speedRate={speedRate} setSpeedRate={setSpeedRate} onRandom={() => handleTransition(null, 'random')} onVariation={onVariation} metronome={metronome} setMetronome={setMetronome} muted={muted} toggleMute={toggleMute} swing={swing} setSwing={setSwing} t={t} setShowInfo={setShowInfo} />
            </div>
            <div className="order-2 md:row-span-1 md:col-span-1 flex-1 md:h-auto min-h-0 relative border-b border-slate-300 bg-slate-50">
                 <UpperBodyView isPlaying={isPlaying} instruments={instruments} shakeIntensity={shakeIntensity} muted={muted} toggleMute={toggleMute} lang={lang} setLang={setLang} t={t} />
            </div>
            <div className="order-3 md:row-span-1 md:col-span-1 flex-1 md:h-auto min-h-0 relative border-r border-slate-300 bg-gray-200 shadow-inner">
                <PedalView isPlaying={isPlaying} instruments={instruments} pedalMode={pedalMode} setPedalMode={setPedalMode} beaterColor={beaterColor} setBeaterColor={setBeaterColor} t={t} shakeIntensity={shakeIntensity} />
            </div>
            <div className="order-4 md:row-span-1 md:col-span-1 flex-1 md:h-auto min-h-0 bg-white relative flex items-center justify-center p-2 md:p-4">
                  <div className="absolute top-2 left-2 text-xs font-bold text-slate-500 pointer-events-none z-10 bg-white/80 px-2 py-1 rounded">
                      {activePattern.name.replace(' (Var)', '')}
                  </div>
                  <svg width="100%" height="100%" viewBox="0 0 500 150" preserveAspectRatio="xMidYMid meet">
                      <SheetMusicView patternData={activePattern} meter={activePattern.meter} showBeatIndicators={showBeatIndicators} pedalMode={pedalMode} currentStep={currentStep} isPlaying={isPlaying} onBeatRepeat={onBeatRepeat} />
                  </svg>
            </div>
        </div>
    );
};
export default App;