import { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  ResponsiveContainer, ReferenceLine, Tooltip,
} from "recharts";

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════════
const C = {
  bg:          "#0F1117",
  surface:     "#1C1F2E",
  surfaceHigh: "#252940",
  accent:      "#39D98A",
  accentDim:   "#1a6640",
  amber:       "#F5A623",
  red:         "#E05252",
  blue:        "#5B9CF6",
  textPrimary: "#F0F0F5",
  textMuted:   "#8A8FA8",
  border:      "#2A2D3E",
};

// ═══════════════════════════════════════════════════════════════════════════════
// LOGO — inline SVG version of the FitTrack 56 app icon
// ═══════════════════════════════════════════════════════════════════════════════
function Logo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 1024 1024" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="ftBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#141828" />
          <stop offset="100%" stopColor="#0A0D14" />
        </linearGradient>
        <linearGradient id="ftArc" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#25C472" />
          <stop offset="100%" stopColor="#39D98A" />
        </linearGradient>
        <clipPath id="ftClip">
          <rect width="1024" height="1024" rx="224" ry="224" />
        </clipPath>
      </defs>
      <g clipPath="url(#ftClip)">
        <rect width="1024" height="1024" fill="url(#ftBg)" />
        {/* Track ring */}
        <circle cx="512" cy="500" r="320" fill="none" stroke="#1C2030" strokeWidth="36" />
        {/* Progress arc ~215° */}
        <path d="M 512 180 A 320 320 0 1 1 186 660" fill="none" stroke="url(#ftArc)" strokeWidth="36" strokeLinecap="round" />
        <circle cx="186" cy="660" r="20" fill="#39D98A" />
        <circle cx="512" cy="180" r="14" fill="#25C472" opacity="0.6" />
        {/* Barbell */}
        <rect x="222" y="485" width="580" height="30" rx="15" fill="#2A2F45" />
        <rect x="202" y="418" width="52" height="164" rx="10" fill="#39D98A" />
        <rect x="268" y="440" width="28" height="120" rx="7" fill="#2FC87A" />
        <rect x="728" y="440" width="28" height="120" rx="7" fill="#2FC87A" />
        <rect x="770" y="418" width="52" height="164" rx="10" fill="#39D98A" />
        <rect x="316" y="468" width="22" height="64" rx="5" fill="#8A8FA8" />
        <rect x="686" y="468" width="22" height="64" rx="5" fill="#8A8FA8" />
        {/* Text */}
        <text x="512" y="720" fontFamily="-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif" fontSize="148" fontWeight="800" fill="#F0F0F5" textAnchor="middle" letterSpacing="-4">56</text>
        <text x="512" y="415" fontFamily="-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif" fontSize="58" fontWeight="700" fill="#39D98A" textAnchor="middle" letterSpacing="18">FT</text>
        {/* Week dots */}
        <circle cx="442" cy="830" r="12" fill="#39D98A" />
        <circle cx="512" cy="830" r="12" fill="#39D98A" />
        <circle cx="582" cy="830" r="12" fill="#2A2F45" stroke="#39D98A" strokeWidth="3" />
      </g>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATIC DATA
// ═══════════════════════════════════════════════════════════════════════════════
const WORKOUT_DATA = {
  monday: {
    label: "Monday", name: "Full Body Strength", color: C.accent,
    exercises: [
      { name: "Leg Press",       machine: "Watson 45° Leg Press",         sets: 3, reps: "10–12", muscles: "Quads, glutes, hamstrings",                   tips: "Feet shoulder-width. Don't lock knees at top. Push through heels for more glute activation.", video: "https://www.youtube.com/watch?v=xFvmc42YfMQ", videoLabel: "45° Leg Press Tutorial" },
      { name: "Chest Press",     machine: "Hammer Strength Chest Press",  sets: 3, reps: "10–12", muscles: "Pectorals, anterior deltoid, triceps",          tips: "Adjust seat so handles align with mid-chest. Control the return — don't let it snap back.", video: "https://www.youtube.com/watch?v=r00LjkVp5sw", videoLabel: "Hammer Strength Chest Press" },
      { name: "Lat Pulldown",    machine: "Cable Lat Pulldown",            sets: 3, reps: "10–12", muscles: "Latissimus dorsi, biceps, rear delts",          tips: "Lean back slightly. Pull bar to upper chest. Squeeze lats at bottom, don't use momentum.", video: "https://www.youtube.com/watch?v=Z_3xHwuO8Tk", videoLabel: "Lat Pulldowns with Perfect Form" },
      { name: "Shoulder Press",  machine: "Plate-Loaded Shoulder Press",  sets: 3, reps: "10–12", muscles: "Deltoids, triceps, upper traps",                tips: "Keep core braced. Press directly overhead. Don't flare elbows excessively.", video: "https://www.youtube.com/watch?v=nnH63icHYXY", videoLabel: "Shoulder Press Tutorial" },
      { name: "Seated Row",      machine: "Cable Seated Row",             sets: 3, reps: "10–12", muscles: "Middle back, rhomboids, biceps, lats",          tips: "Sit upright. Pull to lower chest. Squeeze shoulder blades together. Don't hunch on the return.", video: "https://www.youtube.com/watch?v=7BkgqzC6WsM", videoLabel: "How to PROPERLY Seated Cable Row" },
      { name: "Leg Curl",        machine: "Lying Leg Curl Machine",       sets: 3, reps: "12",    muscles: "Hamstrings, calves",                            tips: "Adjust pad just above ankles. Keep hips flat on bench. Curl slowly and squeeze at the top.", video: "https://www.youtube.com/watch?v=vl5nUdE9mWM", videoLabel: "Lying Leg Curl Proper Technique" },
      { name: "Tricep Pushdown", machine: "Cable Pushdown (rope)",        sets: 3, reps: "12–15", muscles: "Triceps (all three heads)",                     tips: "Elbows pinned to sides. Split the rope at the bottom. Don't swing shoulders into it.", video: "https://www.youtube.com/watch?v=d-ySLTHUgQA", videoLabel: "Rope Tricep Pushdowns Tutorial" },
      { name: "Bicep Curl",      machine: "EZ Bar or Dumbbell",           sets: 3, reps: "12",    muscles: "Biceps, brachialis",                            tips: "Keep elbows at sides. Curl to shoulder height. Lower slowly — don't drop the weight.", video: "https://www.youtube.com/watch?v=SDFZBaJcTsU", videoLabel: "EZ Bar Bicep Curl Tutorial" },
      { name: "Core — Plank",    machine: "Bodyweight",                   sets: 3, reps: "30–45 sec", muscles: "Core, transverse abdominis, glutes",        tips: "Elbows under shoulders. Body in a straight line. Don't let hips sag or pike up. Breathe steadily.", video: "https://www.youtube.com/watch?v=mwlp75MS6Rg", videoLabel: "How to do a Plank — NASM", isBodyweight: true },
    ],
  },
  wednesday: {
    label: "Wednesday", name: "Muscle & Metabolism", color: C.amber,
    exercises: [
      { name: "Hack Squat",          machine: "Hack Squat Machine",        sets: 4, reps: "10–12", muscles: "Quads (primary), glutes, hamstrings",         tips: "Feet hip-width on platform. Lower until thighs parallel or below. Don't let knees cave inward.", video: "https://www.youtube.com/watch?v=hglQExHCM9Q", videoLabel: "Hack Squat Machine Tutorial" },
      { name: "Incline Chest Press", machine: "Incline Hammer Strength",   sets: 3, reps: "10–12", muscles: "Upper pectorals, anterior deltoid, triceps",   tips: "Set handles to align with upper chest. Press up and slightly inward. Control the negative.", video: "https://www.youtube.com/watch?v=ig0NyNlSce4", videoLabel: "Incline Chest Press — Hammer Strength" },
      { name: "Wide Grip Pulldown",  machine: "Cable Machine",             sets: 3, reps: "10–12", muscles: "Lats (width), teres major, rear delts",        tips: "Grip wider than shoulder-width. Chest up, slight lean back. Pull bar to top of chest — not behind neck.", video: "https://www.youtube.com/watch?v=Z_3xHwuO8Tk", videoLabel: "Lat Pulldowns with Perfect Form" },
      { name: "Lateral Raise",       machine: "Dumbbells",                 sets: 3, reps: "15",    muscles: "Lateral deltoids (side shoulder)",              tips: "Slight bend in elbows. Raise to shoulder height only. Lead with elbows, not wrists. Use lighter weight than you think.", video: "https://www.youtube.com/watch?v=Y29xKcze8Ik", videoLabel: "Dumbbell Lateral Raise Form Tutorial" },
      { name: "Leg Press (narrow)",  machine: "Watson 45° Leg Press",      sets: 3, reps: "12–15", muscles: "Quads (outer emphasis), glutes",               tips: "Feet closer together (6–8 inches apart). Same technique as Monday but higher reps.", video: "https://www.youtube.com/watch?v=xFvmc42YfMQ", videoLabel: "45° Leg Press Tutorial" },
      { name: "Chest Flye",          machine: "Pec Deck Machine",          sets: 3, reps: "12–15", muscles: "Pectorals (inner and outer chest)",             tips: "Slight bend in elbows throughout. Squeeze chest at close position. Feel the stretch, not the strain.", video: "https://www.youtube.com/watch?v=Dbly77Jgbo8", videoLabel: "Pec Deck Chest Fly Tutorial" },
      { name: "Face Pulls",          machine: "Cable Machine (rope)",      sets: 3, reps: "15",    muscles: "Rear deltoids, external rotators, upper traps", tips: "Set cable at head height. Pull rope to forehead, externally rotating wrists (thumbs back). Essential for shoulder health.", video: "https://www.youtube.com/watch?v=0Po47vvj9g4", videoLabel: "How To Do Cable Face Pulls" },
      { name: "Dips",                machine: "Dip Station / Assisted",    sets: 3, reps: "10–12", muscles: "Triceps, lower chest, anterior deltoid",        tips: "For tricep focus: stay upright, elbows close to body. Use counterweight as needed.", video: "https://www.youtube.com/watch?v=P9CkuhCc0TE", videoLabel: "Assisted Dip Machine Tutorial" },
      { name: "Cable Crunch",        machine: "Cable Machine",             sets: 3, reps: "15–20", muscles: "Rectus abdominis, obliques",                    tips: "Kneel facing cable. Lock hips in place — they should NOT move. Crunch by rounding the spine, not pulling with arms.", video: "https://www.youtube.com/watch?v=AV5PmZJIrrw", videoLabel: "How to PROPERLY Cable Crunch", isBodyweight: true },
    ],
  },
  friday: {
    label: "Friday", name: "Full Body Fat Loss Circuit", color: C.red,
    exercises: [
      { name: "Leg Press",       machine: "Watson 45° Leg Press",        sets: 3, reps: "15",          muscles: "Quads, glutes, hamstrings",          tips: "Same form as Monday. Higher reps so reduce weight slightly. Keep rest shorter — this is circuit day.", video: "https://www.youtube.com/watch?v=xFvmc42YfMQ", videoLabel: "45° Leg Press Tutorial" },
      { name: "Chest Press",     machine: "Hammer Strength Chest Press", sets: 3, reps: "15",          muscles: "Pectorals, anterior deltoid, triceps", tips: "Same setup as Monday. Keep tempo controlled even at higher reps.", video: "https://www.youtube.com/watch?v=r00LjkVp5sw", videoLabel: "Hammer Strength Chest Press" },
      { name: "Lat Pulldown",    machine: "Cable Lat Pulldown",          sets: 3, reps: "15",          muscles: "Latissimus dorsi, biceps",            tips: "Reduce weight to maintain full form for all 15 reps.", video: "https://www.youtube.com/watch?v=Z_3xHwuO8Tk", videoLabel: "Lat Pulldowns with Perfect Form" },
      { name: "Goblet Squat",    machine: "Dumbbell",                    sets: 3, reps: "15",          muscles: "Quads, glutes, core",                 tips: "Hold dumbbell at chest. Feet shoulder-width, toes slightly out. Sit between your knees. Keep chest tall throughout.", video: "https://www.youtube.com/watch?v=lQmwjyiVy8M", videoLabel: "Dumbbell Goblet Squats Tutorial" },
      { name: "Seated Row",      machine: "Cable Seated Row",            sets: 3, reps: "15",          muscles: "Middle back, rhomboids, biceps",      tips: "Focus on the squeeze at the back position. At 15 reps the pump will be real.", video: "https://www.youtube.com/watch?v=7BkgqzC6WsM", videoLabel: "How to PROPERLY Seated Cable Row" },
      { name: "Step-Ups",        machine: "Box / Bench",                 sets: 3, reps: "12 each leg", muscles: "Glutes, quads, hamstrings, balance",  tips: "Place full foot on box. Drive through the heel to stand. Don't push off the trailing leg. 12 reps each side.", video: "https://www.youtube.com/watch?v=vs87hPGdnCc", videoLabel: "How To Do Box Step-Ups", isBodyweight: true },
      { name: "Tricep Pushdown", machine: "Cable (rope)",                sets: 3, reps: "15–20",       muscles: "Triceps",                             tips: "Same as Monday. Squeeze and hold briefly at the bottom. Higher reps on Friday.", video: "https://www.youtube.com/watch?v=d-ySLTHUgQA", videoLabel: "Rope Tricep Pushdowns Tutorial" },
      { name: "Hammer Curl",     machine: "Dumbbells",                   sets: 3, reps: "15",          muscles: "Biceps, brachialis, forearm",         tips: "Neutral grip (palms inward). Curl to shoulder. Develops forearm thickness as well as bicep peak.", video: "https://www.youtube.com/watch?v=FNvndC4Ov04", videoLabel: "Dumbbell Hammer Curl Form Tutorial" },
      { name: "Core — Dead Bug", machine: "Bodyweight",                  sets: 3, reps: "10 each side", muscles: "Deep core, transverse abdominis",    tips: "Lower back pressed into floor throughout. Extend opposite arm and leg slowly. Breathe out as you extend.", video: "https://www.youtube.com/watch?v=bxn9FBrt4-A", videoLabel: "Dead Bug Proper Form — NASM", isBodyweight: true },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// LOCAL STORAGE
// ═══════════════════════════════════════════════════════════════════════════════
const KEYS = { sessions: "ft56_sessions", measurements: "ft56_measurements", settings: "ft56_settings" };
function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
const DEFAULT_SETTINGS = {
  targetStone: 13, targetLbs: 9,
  startStone: 16, startLbs: 0,
  startDate: new Date().toISOString().split("T")[0],
  weeks: 12,
};

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════
const stLbs  = (s, l) => s * 14 + l;
const lbsSt  = (t)    => ({ stone: Math.floor(t / 14), lbs: t % 14 });
const fmtW   = (s, l) => `${s} st ${l} lb`;
const fmtD   = (iso)  => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function weekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  d.setHours(0, 0, 0, 0);
  return d;
}
function dayKey() {
  const d = new Date().getDay();
  return d === 1 ? "monday" : d === 3 ? "wednesday" : d === 5 ? "friday" : null;
}
function nextWorkout() {
  const day = new Date().getDay();
  const sched = [{ type: "monday", n: 1 }, { type: "wednesday", n: 3 }, { type: "friday", n: 5 }];
  for (let i = 0; i < 7; i++) {
    const m = sched.find(s => s.n === (day + i) % 7);
    if (m) return { type: m.type, daysAway: i };
  }
  return { type: "monday", daysAway: 1 };
}
function progressiveOverload(name, sessions) {
  const logs = sessions
    .flatMap(s => s.exercises.filter(e => e.name === name).map(e => ({ ...e, date: s.date })))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  if (!logs.length) return null;
  const last = logs[0];
  const ws = [last.set1Weight, last.set2Weight, last.set3Weight].filter(Boolean);
  const rs = [last.set1Reps, last.set2Reps, last.set3Reps].filter(Boolean);
  if (!ws.length) return null;
  const mw = Math.max(...ws);
  const mr = rs[ws.indexOf(mw)] || 0;
  const sug = mr >= 12 ? mw + 2.5 : mw;
  return {
    lastWeight: mw, lastReps: mr, suggested: sug,
    message: mr >= 12
      ? `Last time: ${mw} kg × ${mr} reps. Try ${sug} kg today.`
      : `Last time: ${mw} kg × ${mr} reps. Match that weight — push for 12.`,
  };
}
function exportCSV(sessions, measurements) {
  const rows = [["Date","Workout","Exercise","Set1kg","Set1reps","Set2kg","Set2reps","Set3kg","Set3reps","Difficulty","Rating"]];
  sessions.forEach(s => {
    s.exercises.forEach(e => {
      rows.push([s.date, s.workoutType, e.name, e.set1Weight||"", e.set1Reps||"", e.set2Weight||"", e.set2Reps||"", e.set3Weight||"", e.set3Reps||"", e.difficulty||"", s.sessionRating||""]);
    });
  });
  rows.push([]);
  rows.push(["Date","StoneWeight","LbsWeight","WaistCm","ChestCm","HipsCm","Sleep","AlcoholUnits","Notes"]);
  measurements.forEach(m => {
    rows.push([m.date, m.weightStone, m.weightLbs, m.waistCm||"", m.chestCm||"", m.hipsCm||"", m.sleepQuality||"", m.alcoholUnits||"", m.notes||""]);
  });
  const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = "fittrack56_data.csv";
  a.click();
}

// ═══════════════════════════════════════════════════════════════════════════════
// WEIGHT DIAL  10 – 150 kg in 2.5 kg steps
// ═══════════════════════════════════════════════════════════════════════════════
const WEIGHTS = [];
for (let w = 10; w <= 150; w += 2.5) WEIGHTS.push(w);
const REPS = Array.from({ length: 30 }, (_, i) => i + 1);

function Dial({ values, value, onChange, color = C.accent, unit = "" }) {
  const IH = 44, VIS = 5;
  const isDrag = useRef(false), startY = useRef(0), startOff = useRef(0);
  const offRef = useRef(0), initd = useRef(false);
  const [dispOff, setDispOff] = useState(0);

  const idx = value != null ? values.findIndex(v => Math.abs(v - value) < 0.01) : 0;
  const si = idx >= 0 ? idx : 0;

  useEffect(() => {
    if (!initd.current) {
      initd.current = true;
      const off = -si * IH;
      offRef.current = off;
      setDispOff(off);
      onChange(values[si]);
    }
  }, []);

  const clamp = off => Math.max(-(values.length - 1) * IH, Math.min(0, off));
  const toIdx = off => Math.round(-off / IH);
  const snap = off => {
    const i = Math.max(0, Math.min(values.length - 1, toIdx(off)));
    return -i * IH;
  };

  const onDown = e => {
    isDrag.current = true;
    startY.current = e.touches ? e.touches[0].clientY : e.clientY;
    startOff.current = offRef.current;
  };
  const onMove = e => {
    if (!isDrag.current) return;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const noff = clamp(startOff.current + (cy - startY.current));
    offRef.current = noff;
    setDispOff(noff);
    const i = Math.max(0, Math.min(values.length - 1, toIdx(noff)));
    onChange(values[i]);
  };
  const onUp = () => {
    if (!isDrag.current) return;
    isDrag.current = false;
    const s = snap(offRef.current);
    offRef.current = s;
    setDispOff(s);
    onChange(values[toIdx(s)]);
  };

  const ci = toIdx(dispOff);
  const items = [];
  for (let i = Math.max(0, ci - 4); i <= Math.min(values.length - 1, ci + 4); i++) {
    const top = dispOff + i * IH + IH * Math.floor(VIS / 2);
    const dist = Math.abs(i - ci);
    const sel = i === ci;
    items.push(
      <div key={i} style={{
        position: "absolute", top, left: 0, right: 0, height: IH,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: sel ? 21 : 16, fontWeight: sel ? 800 : 400,
        fontFamily: "monospace",
        color: sel ? color : C.textPrimary,
        opacity: dist === 0 ? 1 : dist === 1 ? 0.5 : 0.2,
        transform: `scale(${sel ? 1.08 : 1})`,
        userSelect: "none", pointerEvents: "none",
      }}>
        {typeof values[i] === "number" && values[i] % 1 !== 0 ? values[i].toFixed(1) : values[i]}
      </div>
    );
  }

  const displayed = value != null ? (typeof value === "number" && value % 1 !== 0 ? value.toFixed(1) : value) : "—";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <div
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
        style={{
          position: "relative", width: unit === "kg" ? 92 : 76, height: IH * VIS,
          overflow: "hidden", cursor: "grab", background: C.surfaceHigh,
          borderRadius: 12, border: `1px solid ${C.border}`, touchAction: "none", userSelect: "none",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: IH * 1.8, background: `linear-gradient(to bottom, ${C.surfaceHigh}, transparent)`, zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: IH * 1.8, background: `linear-gradient(to top, ${C.surfaceHigh}, transparent)`, zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: IH * Math.floor(VIS / 2), left: 6, right: 6, height: IH, background: color + "18", borderRadius: 8, border: `1px solid ${color}44`, zIndex: 1, pointerEvents: "none" }} />
        {items}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "monospace" }}>
        {displayed}{unit ? ` ${unit}` : ""}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
const Card = ({ children, style = {} }) => (
  <div style={{ background: C.surface, borderRadius: 14, padding: 16, marginBottom: 12, border: `1px solid ${C.border}`, ...style }}>
    {children}
  </div>
);
const SectionLabel = ({ children }) => (
  <div style={{ color: C.textMuted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 6 }}>
    {children}
  </div>
);
const Badge = ({ children, color = C.accent }) => (
  <span style={{ background: color + "22", color, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>
    {children}
  </span>
);
const Btn = ({ children, onClick, color = C.accent, disabled = false, style = {} }) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: disabled ? C.border : color, color: disabled ? C.textMuted : "#0F1117",
    border: "none", borderRadius: 12, padding: "14px 18px", fontSize: 15, fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer", width: "100%", ...style,
  }}>
    {children}
  </button>
);
const Input = ({ value, onChange, placeholder = "", min = 0, max = 9999, step = 1, style = {} }) => (
  <input type="number" value={value} onChange={e => onChange(e.target.value)}
    placeholder={placeholder} min={min} max={max} step={step}
    style={{
      background: C.surfaceHigh, color: C.textPrimary, border: `1px solid ${C.border}`,
      borderRadius: 9, padding: "9px 11px", fontSize: 15, fontFamily: "monospace",
      width: "100%", boxSizing: "border-box", ...style,
    }}
  />
);
const axisProps = { fill: C.textMuted, fontSize: 10 };
const tooltipStyle = { contentStyle: { background: C.surface, border: `1px solid ${C.border}`, color: C.textPrimary, fontSize: 12, borderRadius: 10 } };

// ═══════════════════════════════════════════════════════════════════════════════
// BOTTOM TAB BAR
// ═══════════════════════════════════════════════════════════════════════════════
const TABS = [
  { id: "dashboard",   label: "Home",    icon: "⊞" },
  { id: "workout",     label: "Workout", icon: "◉" },
  { id: "progress",    label: "Progress",icon: "↗" },
  { id: "measurements",label: "Measure", icon: "◎" },
  { id: "guide",       label: "Guide",   icon: "▶" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function Dashboard({ sessions, measurements, settings, onNavigate, onOpenSettings }) {
  const latest = measurements[measurements.length - 1];
  const curLbs = latest ? stLbs(latest.weightStone, latest.weightLbs) : stLbs(settings.startStone, settings.startLbs);
  const startLbs = stLbs(settings.startStone, settings.startLbs);
  const tgtLbs  = stLbs(settings.targetStone, settings.targetLbs);
  const lost     = startLbs - curLbs;
  const remain   = curLbs - tgtLbs;
  const prog     = Math.max(0, Math.min(1, lost / Math.max(1, startLbs - tgtLbs)));

  const ws = weekStart();
  const done = { monday: false, wednesday: false, friday: false };
  sessions.filter(s => new Date(s.date) >= ws).forEach(s => { done[s.workoutType] = true; });
  const doneCount = Object.values(done).filter(Boolean).length;

  const { type: nxt, daysAway } = nextWorkout();
  const nxtW = WORKOUT_DATA[nxt];
  const daysLabel = daysAway === 0 ? "Today" : daysAway === 1 ? "Tomorrow" : `In ${daysAway} days`;

  const sevenAgo = new Date(Date.now() - 7 * 86400000);
  const nudge = progressiveOverload("Leg Press", sessions.filter(s => new Date(s.date) >= sevenAgo));

  const lastSession = sessions[sessions.length - 1];
  const cw = latest ? { stone: latest.weightStone, lbs: latest.weightLbs } : lbsSt(startLbs);

  // Programme week counter
  const progStart = new Date(settings.startDate);
  const progWeek  = Math.min(settings.weeks, Math.max(1, Math.ceil((Date.now() - progStart) / (7 * 86400000))));

  return (
    <div style={{ padding: "0 0 16px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 16px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Logo size={44} />
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.textPrimary, letterSpacing: "-0.5px" }}>FitTrack 56</div>
            <div style={{ fontSize: 12, color: C.textMuted }}>
              Week {progWeek} of {settings.weeks} · Fat Loss Programme
            </div>
          </div>
        </div>
        <button onClick={onOpenSettings}
          style={{ background: C.surfaceHigh, border: `1px solid ${C.border}`, color: C.textMuted, fontSize: 18, padding: "9px 11px", borderRadius: 10, cursor: "pointer", lineHeight: 1 }}>
          ⚙
        </button>
      </div>

      <div style={{ padding: "0 16px" }}>
        {/* Weight goal */}
        <Card>
          <SectionLabel>Weight Goal</SectionLabel>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 30, fontWeight: 900, color: C.textPrimary, fontFamily: "monospace", letterSpacing: "-1px" }}>
                {fmtW(cw.stone, cw.lbs)}
              </div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Current</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.textMuted }}>{fmtW(settings.targetStone, settings.targetLbs)}</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Target</div>
            </div>
          </div>
          <div style={{ background: C.border, borderRadius: 6, height: 8, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ background: `linear-gradient(90deg, ${C.accentDim}, ${C.accent})`, width: `${prog * 100}%`, height: "100%", borderRadius: 6, transition: "width 0.6s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ color: lost > 0 ? C.accent : C.textMuted }}>
              {lost > 0 ? `▼ ${lost.toFixed(1)} lb lost` : "Starting point"}
            </span>
            <span style={{ color: C.textMuted }}>
              {remain > 0 ? `${remain.toFixed(1)} lb to go` : "🎯 Goal reached!"}
            </span>
          </div>
        </Card>

        {/* This week */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <SectionLabel>This Week</SectionLabel>
            <Badge color={doneCount === 3 ? C.accent : C.amber}>{doneCount} / 3 sessions</Badge>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {[["MON", "monday"], ["WED", "wednesday"], ["FRI", "friday"]].map(([label, key]) => (
              <div key={key} style={{ flex: 1, textAlign: "center" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", margin: "0 auto 6px",
                  background: done[key] ? C.accent : C.surfaceHigh,
                  border: `2px solid ${done[key] ? C.accent : C.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, color: done[key] ? "#0F1117" : C.textMuted, fontWeight: 700,
                }}>
                  {done[key] ? "✓" : ""}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: done[key] ? C.accent : C.textMuted }}>{label}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <Card style={{ marginBottom: 0 }}>
            <SectionLabel>Last Waist</SectionLabel>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.textPrimary, fontFamily: "monospace" }}>
              {latest?.waistCm ? `${latest.waistCm} cm` : "—"}
            </div>
          </Card>
          <Card style={{ marginBottom: 0 }}>
            <SectionLabel>Last Session</SectionLabel>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>
              {lastSession ? fmtD(lastSession.date) : "None yet"}
            </div>
            {lastSession && (
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                {WORKOUT_DATA[lastSession.workoutType]?.name}
              </div>
            )}
          </Card>
        </div>

        {/* Next workout */}
        <Card style={{ background: C.surfaceHigh }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <SectionLabel>Next Workout</SectionLabel>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.textPrimary }}>{nxtW.name}</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
                {daysLabel} · {nxtW.exercises.length} exercises
              </div>
            </div>
            <Badge color={daysAway === 0 ? C.accent : C.amber}>{nxtW.label}</Badge>
          </div>
          <Btn onClick={() => onNavigate("workout", nxt)}>Start Workout →</Btn>
        </Card>

        {/* Progressive overload nudge */}
        {nudge && (
          <Card style={{ borderColor: C.accentDim, background: "#0a2016" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 24 }}>💪</span>
              <div>
                <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Progressive Overload — Leg Press
                </div>
                <div style={{ fontSize: 13, color: C.textPrimary, lineHeight: 1.4 }}>{nudge.message}</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — WORKOUT LOG
// ═══════════════════════════════════════════════════════════════════════════════
function WorkoutScreen({ sessions, onSaveSession, initialDay }) {
  const [selDay, setSelDay]     = useState(initialDay || dayKey() || "monday");
  const [exData, setExData]     = useState({});
  const [cardio, setCardio]     = useState({ type: "treadmill", duration: 20, speed: "", incline: "", calories: "" });
  const [rating, setRating]     = useState(null);
  const [notes, setNotes]       = useState("");
  const [saved, setSaved]       = useState(false);
  const [restTimer, setRest]    = useState(null);
  const [restSec, setRestSec]   = useState(0);
  const timerRef                = useRef(null);

  useEffect(() => { if (initialDay) setSelDay(initialDay); }, [initialDay]);

  const workout = WORKOUT_DATA[selDay];

  function setEx(name, field, val) {
    setExData(p => ({ ...p, [name]: { ...p[name], [field]: val } }));
  }
  function getEx(name, field, def = null) {
    return exData[name]?.[field] ?? def;
  }

  function startRest(secs = 90) {
    clearInterval(timerRef.current);
    setRest(secs);
    setRestSec(secs);
    timerRef.current = setInterval(() => {
      setRestSec(s => {
        if (s <= 1) { clearInterval(timerRef.current); setRest(null); return 0; }
        return s - 1;
      });
    }, 1000);
  }
  useEffect(() => () => clearInterval(timerRef.current), []);

  function handleSave() {
    const exercises = workout.exercises.map(ex => {
      const d = exData[ex.name] || {};
      return {
        name: ex.name, machine: ex.machine,
        set1Weight: d.s1w ?? null, set1Reps: d.s1r ?? null,
        set2Weight: d.s2w ?? null, set2Reps: d.s2r ?? null,
        set3Weight: d.s3w ?? null, set3Reps: d.s3r ?? null,
        set4Weight: d.s4w ?? null, set4Reps: d.s4r ?? null,
        difficulty: d.diff || "good", notes: d.notes || "",
      };
    });
    onSaveSession({
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      workoutType: selDay, exercises,
      cardioType: cardio.type,
      cardioDurationMinutes: parseInt(cardio.duration) || 20,
      cardioSpeed: parseFloat(cardio.speed) || null,
      cardioIncline: parseFloat(cardio.incline) || null,
      cardioCalories: parseInt(cardio.calories) || null,
      sessionRating: rating,
      sessionNotes: notes,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
    setExData({}); setRating(null); setNotes("");
  }

  return (
    <div style={{ padding: "0 0 20px" }}>
      <div style={{ padding: "20px 16px 12px" }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: C.textPrimary }}>Workout</div>
      </div>

      {/* Day selector */}
      <div style={{ display: "flex", gap: 6, padding: "0 16px", marginBottom: 16 }}>
        {Object.entries(WORKOUT_DATA).map(([key, w]) => (
          <button key={key} onClick={() => { setSelDay(key); setExData({}); }}
            style={{
              flex: 1, padding: "9px 4px", borderRadius: 10, border: "none", cursor: "pointer",
              fontSize: 11, fontWeight: 700,
              background: selDay === key ? w.color : C.surface,
              color: selDay === key ? "#0F1117" : C.textMuted,
            }}>
            {w.label.slice(0, 3).toUpperCase()}
          </button>
        ))}
      </div>

      {/* Rest timer banner */}
      {restTimer !== null && (
        <div style={{ margin: "0 16px 12px", background: restSec > 30 ? C.accentDim : "#4a1f00", borderRadius: 12, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: restSec > 30 ? C.accent : C.amber, fontWeight: 700, textTransform: "uppercase" }}>Rest Timer</div>
            <div style={{ fontSize: 26, fontWeight: 900, fontFamily: "monospace", color: C.textPrimary }}>
              {Math.floor(restSec / 60)}:{String(restSec % 60).padStart(2, "0")}
            </div>
          </div>
          <button onClick={() => { clearInterval(timerRef.current); setRest(null); }}
            style={{ background: C.border, border: "none", color: C.textMuted, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13 }}>
            Skip
          </button>
        </div>
      )}

      <div style={{ padding: "0 16px" }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: workout.color, marginBottom: 2 }}>{workout.name}</div>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 14 }}>{workout.exercises.length} exercises</div>

        {workout.exercises.map(ex => {
          const suggestion = progressiveOverload(ex.name, sessions);
          const numSets = ex.sets;
          return (
            <Card key={ex.name}>
              <div style={{ fontWeight: 800, fontSize: 16, color: C.textPrimary, marginBottom: 2 }}>{ex.name}</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: suggestion ? 8 : 10 }}>
                {ex.machine} · Target: {ex.sets} × {ex.reps}
              </div>

              {suggestion && (
                <div style={{ background: "#0a2016", borderRadius: 9, padding: "7px 11px", marginBottom: 10, fontSize: 12, color: C.accent, lineHeight: 1.4 }}>
                  💪 {suggestion.message}
                </div>
              )}

              {!ex.isBodyweight && (
                <div style={{ marginBottom: 10 }}>
                  {Array.from({ length: numSets }, (_, i) => i + 1).map(sn => (
                    <div key={sn}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, marginTop: sn > 1 ? 10 : 0 }}>
                        Set {sn}
                      </div>
                      <div style={{ display: "flex", gap: 14, justifyContent: "center", alignItems: "flex-start" }}>
                        <Dial values={WEIGHTS} value={getEx(ex.name, `s${sn}w`, null)} onChange={v => setEx(ex.name, `s${sn}w`, v)} color={workout.color} unit="kg" />
                        <Dial values={REPS}    value={getEx(ex.name, `s${sn}r`, null)} onChange={v => setEx(ex.name, `s${sn}r`, v)} color={C.blue}         unit="reps" />
                      </div>
                    </div>
                  ))}
                  {/* Rest timer button */}
                  <button onClick={() => startRest(90)}
                    style={{ background: C.surfaceHigh, border: `1px solid ${C.border}`, color: C.textMuted, borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, marginTop: 10, width: "100%" }}>
                    ⏱ Rest 90s
                  </button>
                </div>
              )}

              {ex.isBodyweight && (
                <div style={{ display: "flex", gap: 14, justifyContent: "center", marginBottom: 10 }}>
                  <Dial values={REPS} value={getEx(ex.name, "s1r", null)} onChange={v => setEx(ex.name, "s1r", v)} color={C.blue} unit="reps" />
                </div>
              )}

              {/* Difficulty */}
              <SectionLabel>Difficulty</SectionLabel>
              <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
                {[["Easy", "easy"], ["Good", "good"], ["Hard", "hard"], ["Too Hard", "too_hard"]].map(([label, key]) => {
                  const active = getEx(ex.name, "diff") === key;
                  return (
                    <button key={key} onClick={() => setEx(ex.name, "diff", key)}
                      style={{
                        flex: 1, padding: "6px 2px", borderRadius: 7, border: "none", cursor: "pointer",
                        fontSize: 10, fontWeight: 700,
                        background: active ? workout.color : C.surfaceHigh,
                        color: active ? "#0F1117" : C.textMuted,
                      }}>
                      {label}
                    </button>
                  );
                })}
              </div>

              <input value={getEx(ex.name, "notes", "")} onChange={e => setEx(ex.name, "notes", e.target.value)}
                placeholder="Notes (e.g. knee felt fine, strong today)…"
                style={{ background: C.surfaceHigh, color: C.textPrimary, border: `1px solid ${C.border}`, borderRadius: 9, padding: "8px 11px", fontSize: 13, width: "100%", boxSizing: "border-box" }} />
            </Card>
          );
        })}

        {/* Cardio */}
        <Card style={{ borderColor: C.amber + "55" }}>
          <SectionLabel>Cardio</SectionLabel>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {[["treadmill", "Treadmill"], ["crossTrainer", "X-Trainer"], ["bike", "Bike"]].map(([key, label]) => (
              <button key={key} onClick={() => setCardio(p => ({ ...p, type: key }))}
                style={{
                  flex: 1, padding: "8px 4px", borderRadius: 9, border: "none", cursor: "pointer",
                  fontSize: 11, fontWeight: 700,
                  background: cardio.type === key ? C.amber : C.surfaceHigh,
                  color: cardio.type === key ? "#0F1117" : C.textMuted,
                }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
            {[["Mins", "duration", 20], ["Speed", "speed", ""], ["Incline", "incline", ""], ["Cals", "calories", ""]].map(([label, field, ph]) => (
              <div key={field}>
                <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 3 }}>{label}</div>
                <Input value={cardio[field]} onChange={v => setCardio(p => ({ ...p, [field]: v }))} placeholder={String(ph)} />
              </div>
            ))}
          </div>
        </Card>

        {/* Session rating */}
        <Card>
          <SectionLabel>Session Rating</SectionLabel>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <button key={n} onClick={() => setRating(n)}
                style={{
                  width: 38, height: 38, borderRadius: 9, border: "none", cursor: "pointer",
                  fontWeight: 800, fontSize: 14,
                  background: rating === n ? C.accent : C.surfaceHigh,
                  color: rating === n ? "#0F1117" : C.textMuted,
                }}>
                {n}
              </button>
            ))}
          </div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Session notes — how did it feel overall?"
            style={{ background: C.surfaceHigh, color: C.textPrimary, border: `1px solid ${C.border}`, borderRadius: 9, padding: 11, fontSize: 13, width: "100%", boxSizing: "border-box", minHeight: 70, resize: "none" }} />
        </Card>

        {saved ? (
          <div style={{ background: C.accentDim, color: C.accent, borderRadius: 12, padding: "15px 20px", fontSize: 16, fontWeight: 800, textAlign: "center" }}>
            ✓ Session saved — great work!
          </div>
        ) : (
          <Btn onClick={handleSave}>Save Session</Btn>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — PROGRESS
// ═══════════════════════════════════════════════════════════════════════════════
function ProgressScreen({ sessions, measurements, settings }) {
  const weightData = measurements.map(m => ({
    date: m.date.slice(5), lbs: stLbs(m.weightStone, m.weightLbs),
  }));
  const waistData = measurements.filter(m => m.waistCm).map(m => ({
    date: m.date.slice(5), cm: m.waistCm,
  }));
  const KEY_LIFTS = ["Leg Press", "Chest Press", "Lat Pulldown", "Shoulder Press"];
  const strengthData = {};
  KEY_LIFTS.forEach(lift => {
    strengthData[lift] = sessions
      .filter(s => s.exercises.some(e => e.name === lift))
      .map(s => {
        const ex = s.exercises.find(e => e.name === lift);
        return { date: s.date.slice(5), kg: Math.max(ex.set1Weight || 0, ex.set2Weight || 0, ex.set3Weight || 0) };
      });
  });
  const weeklyData = [];
  for (let i = 7; i >= 0; i--) {
    const ws = weekStart(new Date(Date.now() - i * 7 * 86400000));
    const we = new Date(ws.getTime() + 7 * 86400000);
    weeklyData.push({ week: `W${8 - i}`, count: sessions.filter(s => { const d = new Date(s.date); return d >= ws && d < we; }).length });
  }

  // Fat loss verdict
  const fourAgo = new Date(Date.now() - 28 * 86400000);
  const oldM = measurements.find(m => new Date(m.date) <= fourAgo);
  const newM = measurements[measurements.length - 1];
  const enough = oldM && newM;

  let lighter = { text: "Not enough data yet", color: C.textMuted };
  let waistVerdict = { text: "Not enough data yet", color: C.textMuted };
  let strengthVerdict = { text: "Not enough data yet", color: C.textMuted };

  if (enough) {
    const lostL = stLbs(oldM.weightStone, oldM.weightLbs) - stLbs(newM.weightStone, newM.weightLbs);
    lighter = lostL > 0
      ? { text: `✓ Yes — down ${lostL.toFixed(1)} lb`, color: C.accent }
      : lostL < 0 ? { text: `↑ Up ${Math.abs(lostL).toFixed(1)} lb`, color: C.red }
      : { text: "~ No change", color: C.amber };

    if (oldM.waistCm && newM.waistCm) {
      const diff = oldM.waistCm - newM.waistCm;
      waistVerdict = diff > 0
        ? { text: `✓ Yes — down ${diff.toFixed(1)} cm`, color: C.accent }
        : diff < 0 ? { text: `↑ Up ${Math.abs(diff).toFixed(1)} cm`, color: C.red }
        : { text: "~ Steady", color: C.amber };
    }

    const changes = KEY_LIFTS.map(lift => {
      const o = sessions.filter(s => new Date(s.date) <= fourAgo && s.exercises.some(e => e.name === lift)).pop();
      const n = sessions.filter(s => s.exercises.some(e => e.name === lift)).pop();
      if (!o || !n) return null;
      const om = Math.max(...[o.exercises.find(e => e.name === lift)].flatMap(e => [e.set1Weight, e.set2Weight, e.set3Weight]).filter(Boolean));
      const nm = Math.max(...[n.exercises.find(e => e.name === lift)].flatMap(e => [e.set1Weight, e.set2Weight, e.set3Weight]).filter(Boolean));
      return om > 0 ? (nm - om) / om : null;
    }).filter(Boolean);

    if (changes.length) {
      const avg = changes.reduce((a, b) => a + b, 0) / changes.length;
      strengthVerdict = avg > 0.02
        ? { text: `✓ Improving (+${(avg * 100).toFixed(0)}%)`, color: C.accent }
        : avg < -0.05 ? { text: "↓ Declining — check recovery", color: C.red }
        : { text: "~ Steady", color: C.amber };
    }
  }

  const totalSessions = sessions.length;
  const totalWeeks = Math.max(1, Math.ceil((Date.now() - new Date(settings.startDate)) / (7 * 86400000)));
  const avgPerWeek = (totalSessions / totalWeeks).toFixed(1);

  return (
    <div style={{ padding: "0 0 20px" }}>
      <div style={{ padding: "20px 16px 8px" }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: C.textPrimary }}>Progress</div>
        <div style={{ fontSize: 12, color: C.textMuted }}>
          {totalSessions} sessions · {totalWeeks} weeks · {avgPerWeek} avg/week
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        {/* Fat loss verdict */}
        <Card style={{ borderColor: C.accent + "44" }}>
          <SectionLabel>Fat Loss Verdict</SectionLabel>
          {[
            ["⚖️", "Getting lighter?", lighter],
            ["📏", "Waist shrinking?", waistVerdict],
            ["💪", "Maintaining strength?", strengthVerdict],
          ].map(([icon, q, v]) => (
            <div key={q} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <span style={{ fontSize: 13, color: C.textMuted }}>{q}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: v.color }}>{v.text}</span>
            </div>
          ))}
        </Card>

        {/* Weight chart */}
        <Card>
          <SectionLabel>Body Weight (lbs)</SectionLabel>
          {weightData.length > 1 ? (
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={weightData} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
                <XAxis dataKey="date" tick={axisProps} />
                <YAxis tick={axisProps} domain={["auto", "auto"]} />
                <Tooltip {...tooltipStyle} />
                <ReferenceLine y={stLbs(settings.targetStone, settings.targetLbs)} stroke={C.accent} strokeDasharray="4 2" />
                <Line type="monotone" dataKey="lbs" stroke={C.accent} strokeWidth={2} dot={{ fill: C.accent, r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ color: C.textMuted, fontSize: 13, padding: "20px 0", textAlign: "center" }}>Log 2+ measurements to see chart</div>
          )}
        </Card>

        {/* Waist chart */}
        <Card>
          <SectionLabel>Waist (cm)</SectionLabel>
          {waistData.length > 1 ? (
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={waistData} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
                <XAxis dataKey="date" tick={axisProps} />
                <YAxis tick={axisProps} domain={["auto", "auto"]} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="cm" stroke={C.amber} strokeWidth={2} dot={{ fill: C.amber, r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ color: C.textMuted, fontSize: 13, padding: "20px 0", textAlign: "center" }}>Log 2+ measurements to see waist trend</div>
          )}
        </Card>

        {/* Strength grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          {KEY_LIFTS.map(lift => (
            <Card key={lift} style={{ marginBottom: 0, padding: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, marginBottom: 6 }}>{lift.toUpperCase()}</div>
              {strengthData[lift].length > 1 ? (
                <ResponsiveContainer width="100%" height={70}>
                  <LineChart data={strengthData[lift]} margin={{ top: 2, right: 2, left: -30, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fill: C.textMuted, fontSize: 8 }} />
                    <YAxis tick={{ fill: C.textMuted, fontSize: 8 }} domain={["auto", "auto"]} />
                    <Line type="monotone" dataKey="kg" stroke={C.blue} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ color: C.textMuted, fontSize: 11, padding: "10px 0" }}>
                  {strengthData[lift].length === 1 ? `${strengthData[lift][0].kg} kg` : "No data yet"}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Weekly consistency */}
        <Card>
          <SectionLabel>Weekly Sessions (target: 3)</SectionLabel>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
              <XAxis dataKey="week" tick={axisProps} />
              <YAxis tick={axisProps} domain={[0, 3]} ticks={[0, 1, 2, 3]} />
              <ReferenceLine y={3} stroke={C.accent} strokeDasharray="4 2" />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" fill={C.accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Session history */}
        {sessions.length > 0 && (
          <>
            <SectionLabel>Recent Sessions</SectionLabel>
            {[...sessions].reverse().slice(0, 5).map(s => (
              <Card key={s.id} style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>{fmtD(s.date)}</div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>{WORKOUT_DATA[s.workoutType]?.name}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {s.sessionRating && (
                      <div style={{ fontSize: 14, fontWeight: 800, color: s.sessionRating >= 7 ? C.accent : s.sessionRating >= 5 ? C.amber : C.red }}>
                        {s.sessionRating}/10
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: C.textMuted }}>{s.exercises.length} exercises</div>
                  </div>
                </div>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — MEASUREMENTS
// ═══════════════════════════════════════════════════════════════════════════════
function MeasurementsScreen({ measurements, onSaveMeasurement }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({ date: today, weightStone: "", weightLbs: "", waistCm: "", chestCm: "", hipsCm: "", sleepQuality: null, alcoholUnits: "", notes: "" });
  const [saved, setSaved]     = useState(false);
  const [expanded, setExpanded] = useState(null);

  function setF(k, v) { setForm(p => ({ ...p, [k]: v })); }
  function handleSave() {
    if (!form.weightStone) return;
    onSaveMeasurement({
      id: Date.now().toString(), date: form.date,
      weightStone: parseInt(form.weightStone) || 0, weightLbs: parseInt(form.weightLbs) || 0,
      waistCm: parseFloat(form.waistCm) || null, chestCm: parseFloat(form.chestCm) || null,
      hipsCm: parseFloat(form.hipsCm) || null, sleepQuality: form.sleepQuality,
      alcoholUnits: parseInt(form.alcoholUnits) || null, notes: form.notes,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setForm({ date: today, weightStone: "", weightLbs: "", waistCm: "", chestCm: "", hipsCm: "", sleepQuality: null, alcoholUnits: "", notes: "" });
  }

  // Trend arrows vs last entry
  const last = measurements[measurements.length - 1];
  const prev = measurements[measurements.length - 2];

  return (
    <div style={{ padding: "0 0 20px" }}>
      <div style={{ padding: "20px 16px 8px" }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: C.textPrimary }}>Measurements</div>
        <div style={{ fontSize: 12, color: C.textMuted }}>Log weekly for best results</div>
      </div>

      <div style={{ padding: "0 16px" }}>
        {/* Latest snapshot */}
        {last && (
          <Card style={{ borderColor: C.accent + "44" }}>
            <SectionLabel>Latest — {fmtD(last.date)}</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                ["Weight", fmtW(last.weightStone, last.weightLbs), prev ? stLbs(prev.weightStone, prev.weightLbs) - stLbs(last.weightStone, last.weightLbs) : null, "lb"],
                ["Waist", last.waistCm ? `${last.waistCm} cm` : "—", prev?.waistCm ? prev.waistCm - last.waistCm : null, "cm"],
                ["Chest", last.chestCm ? `${last.chestCm} cm` : "—", null, "cm"],
              ].map(([label, val, delta, unit]) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.textPrimary }}>{val}</div>
                  {delta != null && (
                    <div style={{ fontSize: 11, color: delta > 0 ? C.accent : delta < 0 ? C.red : C.textMuted, marginTop: 2 }}>
                      {delta > 0 ? "▼" : delta < 0 ? "▲" : "—"} {Math.abs(delta).toFixed(1)}{unit}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Entry form */}
        <Card>
          <SectionLabel>New Entry</SectionLabel>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>Date</div>
            <input type="date" value={form.date} onChange={e => setF("date", e.target.value)}
              style={{ background: C.surfaceHigh, color: C.textPrimary, border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 11px", fontSize: 14, width: "100%", boxSizing: "border-box" }} />
          </div>

          <SectionLabel>Body Weight *</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
            <div><div style={{ fontSize: 11, color: C.textMuted, marginBottom: 3 }}>Stone</div><Input value={form.weightStone} onChange={v => setF("weightStone", v)} placeholder="14" max={30} /></div>
            <div><div style={{ fontSize: 11, color: C.textMuted, marginBottom: 3 }}>Lbs</div><Input value={form.weightLbs} onChange={v => setF("weightLbs", v)} placeholder="9" max={13} /></div>
          </div>

          <SectionLabel>Measurements (cm)</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
            {[["Waist", "waistCm"], ["Chest", "chestCm"], ["Hips", "hipsCm"]].map(([label, field]) => (
              <div key={field}>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 3 }}>{label}</div>
                <Input value={form[field]} onChange={v => setF(field, v)} placeholder="—" />
              </div>
            ))}
          </div>

          <SectionLabel>Sleep Quality</SectionLabel>
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setF("sleepQuality", n)}
                style={{ flex: 1, height: 38, borderRadius: 9, border: "none", cursor: "pointer", fontSize: 18, background: form.sleepQuality >= n ? C.amber : C.surfaceHigh, transition: "background 0.15s" }}>
                ★
              </button>
            ))}
          </div>

          <SectionLabel>Alcohol Units (optional)</SectionLabel>
          <Input value={form.alcoholUnits} onChange={v => setF("alcoholUnits", v)} placeholder="0" max={50} style={{ marginBottom: 14 }} />

          <SectionLabel>Notes</SectionLabel>
          <textarea value={form.notes} onChange={e => setF("notes", e.target.value)} placeholder="How are you feeling this week?"
            style={{ background: C.surfaceHigh, color: C.textPrimary, border: `1px solid ${C.border}`, borderRadius: 9, padding: 11, fontSize: 13, width: "100%", boxSizing: "border-box", minHeight: 65, resize: "none", marginBottom: 14 }} />

          {saved
            ? <div style={{ background: C.accentDim, color: C.accent, borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 800, textAlign: "center" }}>✓ Saved</div>
            : <Btn onClick={handleSave} disabled={!form.weightStone}>Save Measurements</Btn>
          }
        </Card>

        {/* History */}
        {measurements.length > 0 && (
          <>
            <SectionLabel>History</SectionLabel>
            {[...measurements].reverse().map(m => (
              <Card key={m.id} style={{ cursor: "pointer", padding: "12px 14px" }} onClick={() => setExpanded(expanded === m.id ? null : m.id)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>{fmtD(m.date)}</div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>
                      {fmtW(m.weightStone, m.weightLbs)}{m.waistCm ? ` · Waist: ${m.waistCm} cm` : ""}
                    </div>
                  </div>
                  <span style={{ color: C.textMuted, fontSize: 14 }}>{expanded === m.id ? "▲" : "▼"}</span>
                </div>
                {expanded === m.id && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                    {m.chestCm && <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 3 }}>Chest: {m.chestCm} cm</div>}
                    {m.hipsCm  && <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 3 }}>Hips: {m.hipsCm} cm</div>}
                    {m.sleepQuality && <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 3 }}>Sleep: {"★".repeat(m.sleepQuality)}{"☆".repeat(5 - m.sleepQuality)}</div>}
                    {m.alcoholUnits != null && <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 3 }}>Alcohol: {m.alcoholUnits} units</div>}
                    {m.notes && <div style={{ fontSize: 12, color: C.textPrimary, marginTop: 6, fontStyle: "italic" }}>"{m.notes}"</div>}
                  </div>
                )}
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — EXERCISE GUIDE
// ═══════════════════════════════════════════════════════════════════════════════
function GuideScreen() {
  const [activeDay, setActiveDay] = useState(0);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

  const GUIDE_DATA = Object.entries(WORKOUT_DATA).map(([, w]) => ({
    day: w.label, name: w.name, color: w.color,
    exercises: w.exercises.map(ex => ({
      name: ex.name, machine: ex.machine, muscles: ex.muscles, sets: `${ex.sets} × ${ex.reps}`,
      tips: ex.tips, video: ex.video, videoLabel: ex.videoLabel,
    })),
  }));

  const filtered = search
    ? GUIDE_DATA.flatMap((w, wi) =>
        w.exercises
          .filter(ex =>
            ex.name.toLowerCase().includes(search.toLowerCase()) ||
            ex.machine.toLowerCase().includes(search.toLowerCase()) ||
            (ex.muscles || "").toLowerCase().includes(search.toLowerCase())
          )
          .map(ex => ({ ...ex, day: w.day, dayColor: w.color, wi }))
      )
    : null;

  const activeGroup = GUIDE_DATA[activeDay];

  return (
    <div style={{ padding: "0 0 20px" }}>
      <div style={{ padding: "20px 16px 8px" }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: C.textPrimary }}>Exercise Guide</div>
        <div style={{ fontSize: 12, color: C.textMuted }}>27 exercises · tap to expand · YouTube links included</div>
      </div>

      <div style={{ padding: "0 16px" }}>
        {/* Search */}
        <div style={{ position: "relative", marginBottom: 14 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textMuted, fontSize: 15 }}>🔍</span>
          <input
            value={search} onChange={e => { setSearch(e.target.value); setExpanded(null); }}
            placeholder="Search by exercise, muscle or machine…"
            style={{ width: "100%", boxSizing: "border-box", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 12px 11px 38px", fontSize: 14, color: C.textPrimary, outline: "none" }}
          />
        </div>

        {/* Day tabs */}
        {!search && (
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {GUIDE_DATA.map((w, i) => (
              <button key={i} onClick={() => { setActiveDay(i); setExpanded(null); }}
                style={{ flex: 1, padding: "9px 4px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: activeDay === i ? w.color : C.surface, color: activeDay === i ? "#0F1117" : C.textMuted, transition: "background 0.2s" }}>
                {w.day.slice(0, 3).toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        {search ? (
          <>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 10 }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </div>
            {filtered.length === 0
              ? <div style={{ textAlign: "center", color: C.textMuted, padding: "40px 0" }}>No exercises found</div>
              : filtered.map(ex => (
                  <div key={ex.name + ex.day}>
                    <div style={{ fontSize: 10, color: ex.dayColor, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>{ex.day}</div>
                    <ExCard ex={ex} color={ex.dayColor} expanded={expanded === ex.name + ex.day} onToggle={() => setExpanded(expanded === ex.name + ex.day ? null : ex.name + ex.day)} />
                  </div>
                ))
            }
          </>
        ) : (
          <>
            <div style={{ fontSize: 14, fontWeight: 800, color: activeGroup.color, marginBottom: 4 }}>{activeGroup.name}</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 14 }}>{activeGroup.exercises.length} exercises · tap to expand</div>
            {activeGroup.exercises.map(ex => (
              <ExCard key={ex.name} ex={ex} color={activeGroup.color} expanded={expanded === ex.name} onToggle={() => setExpanded(expanded === ex.name ? null : ex.name)} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function ExCard({ ex, color, expanded, onToggle }) {
  return (
    <div onClick={onToggle} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${expanded ? color + "66" : C.border}`, marginBottom: 10, overflow: "hidden", cursor: "pointer" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 15px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary, marginBottom: 2 }}>{ex.name}</div>
          <div style={{ fontSize: 11, color: C.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ex.machine}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0, marginLeft: 8 }}>
          <Badge color={color}>{ex.sets}</Badge>
          <span style={{ color: C.textMuted, fontSize: 13, transform: expanded ? "rotate(180deg)" : "none", display: "inline-block", transition: "transform 0.2s" }}>▼</span>
        </div>
      </div>
      {expanded && (
        <div style={{ padding: "0 15px 15px", borderTop: `1px solid ${C.border}` }}>
          {ex.muscles && (
            <div style={{ marginTop: 12, marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Muscles Worked</div>
              <div style={{ fontSize: 13, color: C.textPrimary }}>{ex.muscles}</div>
            </div>
          )}
          {ex.tips && (
            <div style={{ background: C.surfaceHigh, borderRadius: 9, padding: "10px 12px", marginBottom: 12 }}>
              <div style={{ fontSize: 10, color, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Form Tips</div>
              <div style={{ fontSize: 13, color: C.textPrimary, lineHeight: 1.5 }}>{ex.tips}</div>
            </div>
          )}
          {ex.video && (
            <a href={ex.video} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              style={{ display: "flex", alignItems: "center", gap: 10, background: "#FF000018", border: "1px solid #FF000044", borderRadius: 10, padding: "10px 13px", textDecoration: "none" }}>
              <div style={{ width: 30, height: 21, background: "#FF0000", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ width: 0, height: 0, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderLeft: "9px solid white", marginLeft: 2 }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#FF5555", fontWeight: 700, marginBottom: 1 }}>Watch Tutorial on YouTube</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{ex.videoLabel}</div>
              </div>
              <div style={{ marginLeft: "auto", color: C.textMuted, fontSize: 13 }}>↗</div>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS OVERLAY
// ═══════════════════════════════════════════════════════════════════════════════
function SettingsOverlay({ settings, sessions, measurements, onSave, onClose }) {
  const [form, setForm] = useState({ ...settings });
  const [cleared, setCleared] = useState(false);
  function setF(k, v) { setForm(p => ({ ...p, [k]: v })); }

  return (
    <div style={{ position: "fixed", inset: 0, background: C.bg, zIndex: 200, overflow: "auto", padding: "0 0 60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 16px 12px" }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: C.textPrimary }}>Settings</div>
        <button onClick={() => { onSave(form); onClose(); }}
          style={{ background: C.accent, color: "#0F1117", border: "none", borderRadius: 10, padding: "9px 18px", fontWeight: 800, cursor: "pointer", fontSize: 14 }}>
          Save ✓
        </button>
      </div>

      <div style={{ padding: "0 16px" }}>
        <Card>
          <SectionLabel>Target Weight</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div><div style={{ fontSize: 11, color: C.textMuted, marginBottom: 3 }}>Stone</div><Input value={form.targetStone} onChange={v => setF("targetStone", parseInt(v) || 0)} /></div>
            <div><div style={{ fontSize: 11, color: C.textMuted, marginBottom: 3 }}>Lbs</div><Input value={form.targetLbs} onChange={v => setF("targetLbs", parseInt(v) || 0)} max={13} /></div>
          </div>
        </Card>

        <Card>
          <SectionLabel>Starting Weight (baseline)</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div><div style={{ fontSize: 11, color: C.textMuted, marginBottom: 3 }}>Stone</div><Input value={form.startStone} onChange={v => setF("startStone", parseInt(v) || 0)} /></div>
            <div><div style={{ fontSize: 11, color: C.textMuted, marginBottom: 3 }}>Lbs</div><Input value={form.startLbs} onChange={v => setF("startLbs", parseInt(v) || 0)} max={13} /></div>
          </div>
        </Card>

        <Card>
          <SectionLabel>Programme</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 3 }}>Start Date</div>
              <input type="date" value={form.startDate} onChange={e => setF("startDate", e.target.value)}
                style={{ background: C.surfaceHigh, color: C.textPrimary, border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 11px", fontSize: 13, width: "100%", boxSizing: "border-box" }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 3 }}>Length (weeks)</div>
              <Input value={form.weeks} onChange={v => setF("weeks", parseInt(v) || 12)} max={52} />
            </div>
          </div>
        </Card>

        <Card>
          <SectionLabel>Workout Days</SectionLabel>
          <div style={{ display: "flex", gap: 8 }}>
            {["Mon", "Wed", "Fri"].map(d => (
              <div key={d} style={{ flex: 1, background: C.accent + "22", color: C.accent, borderRadius: 9, padding: 9, textAlign: "center", fontSize: 13, fontWeight: 700 }}>{d}</div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 6 }}>Fixed — Monday, Wednesday, Friday</div>
        </Card>

        <Card>
          <SectionLabel>Export &amp; Data</SectionLabel>
          <Btn onClick={() => exportCSV(sessions, measurements)} color={C.blue} style={{ marginBottom: 10 }}>
            Export Data as CSV
          </Btn>
          {!cleared
            ? <button onClick={() => {
                if (window.confirm("Clear ALL data? This cannot be undone.")) {
                  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
                  setCleared(true);
                  setTimeout(() => window.location.reload(), 600);
                }
              }}
              style={{ background: C.red + "22", color: C.red, border: `1px solid ${C.red}44`, borderRadius: 10, padding: "11px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%" }}>
              Clear All Data
            </button>
            : <div style={{ color: C.red, fontSize: 13 }}>Clearing…</div>
          }
        </Card>

        <Card>
          <SectionLabel>About</SectionLabel>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <Logo size={52} />
            <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>
              <b style={{ color: C.textPrimary }}>FitTrack 56</b> — Personal fat-loss gym tracker.<br />
              3 workouts · 27 exercises · progressive overload built in.<br />
              All data stored on this device only. No account required.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ONBOARDING (shown once on first launch)
// ═══════════════════════════════════════════════════════════════════════════════
function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ targetStone: 13, targetLbs: 9, startStone: 16, startLbs: 0, startDate: new Date().toISOString().split("T")[0], weeks: 12 });
  function setF(k, v) { setForm(p => ({ ...p, [k]: v })); }

  const steps = [
    {
      title: "Welcome to FitTrack 56",
      sub: "Your personal fat-loss gym tracker. 3 sessions a week. Progressive overload built in. Let's set you up.",
      icon: "logo",
      content: null,
    },
    {
      title: "Starting Weight",
      sub: "What are you weighing in at now? This is your baseline.",
      icon: "⚖️",
      content: (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 5 }}>Stone</div>
            <Input value={form.startStone} onChange={v => setF("startStone", parseInt(v) || 0)} placeholder="16" />
          </div>
          <div>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 5 }}>Lbs</div>
            <Input value={form.startLbs} onChange={v => setF("startLbs", parseInt(v) || 0)} placeholder="0" max={13} />
          </div>
        </div>
      ),
    },
    {
      title: "Target Weight",
      sub: "Where do you want to get to? This drives your progress bar.",
      icon: "🎯",
      content: (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 5 }}>Stone</div>
            <Input value={form.targetStone} onChange={v => setF("targetStone", parseInt(v) || 0)} placeholder="13" />
          </div>
          <div>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 5 }}>Lbs</div>
            <Input value={form.targetLbs} onChange={v => setF("targetLbs", parseInt(v) || 0)} placeholder="9" max={13} />
          </div>
        </div>
      ),
    },
    {
      title: "Programme Length",
      sub: "How many weeks are you committing to? 12 weeks is a solid block.",
      icon: "📅",
      content: (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 5 }}>Start Date</div>
            <input type="date" value={form.startDate} onChange={e => setF("startDate", e.target.value)}
              style={{ background: C.surfaceHigh, color: C.textPrimary, border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 11px", fontSize: 13, width: "100%", boxSizing: "border-box" }} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 5 }}>Weeks</div>
            <Input value={form.weeks} onChange={v => setF("weeks", parseInt(v) || 12)} placeholder="12" max={52} />
          </div>
        </div>
      ),
    },
    {
      title: "You're set up",
      sub: "Log your first session, record your measurements, and let the data do the rest. Mon · Wed · Fri.",
      icon: "✅",
      content: null,
    },
  ];

  const s = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.bg, padding: "0 24px", justifyContent: "center", maxWidth: 430, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        {s.icon === "logo"
          ? <div style={{ display: "flex", justifyContent: "center" }}><Logo size={110} /></div>
          : <span style={{ fontSize: 54 }}>{s.icon}</span>
        }
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, color: C.textPrimary, textAlign: "center", marginBottom: 12, letterSpacing: "-0.5px" }}>{s.title}</div>
      <div style={{ fontSize: 15, color: C.textMuted, textAlign: "center", lineHeight: 1.6, marginBottom: 36 }}>{s.sub}</div>
      {s.content && <div style={{ marginBottom: 36 }}>{s.content}</div>}
      <Btn onClick={() => { if (isLast) onDone(form); else setStep(s => s + 1); }}>
        {isLast ? "Start FitTrack 56 →" : "Continue →"}
      </Btn>
      {step > 0 && !isLast && (
        <button onClick={() => setStep(s => s - 1)} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 14, cursor: "pointer", marginTop: 14, padding: 8 }}>
          ← Back
        </button>
      )}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 28 }}>
        {steps.map((_, i) => (
          <div key={i} style={{ width: i === step ? 20 : 7, height: 7, borderRadius: 4, background: i === step ? C.accent : C.border, transition: "width 0.25s, background 0.25s" }} />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function FitTrack56() {
  const [sessions, setSessions]         = useState(() => load(KEYS.sessions, []));
  const [measurements, setMeasurements] = useState(() => load(KEYS.measurements, []));
  const [settings, setSettings]         = useState(() => load(KEYS.settings, null));
  const [activeTab, setActiveTab]       = useState("dashboard");
  const [workoutDay, setWorkoutDay]     = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  function handleOnboardDone(form) {
    const s = { ...DEFAULT_SETTINGS, ...form };
    setSettings(s);
    save(KEYS.settings, s);
  }

  function saveSession(session) {
    const u = [...sessions, session];
    setSessions(u);
    save(KEYS.sessions, u);
  }
  function saveMeasurement(entry) {
    const u = [...measurements, entry];
    setMeasurements(u);
    save(KEYS.measurements, u);
  }
  function saveSettings(s) {
    setSettings(s);
    save(KEYS.settings, s);
  }
  function navigateTo(tab, day) {
    setActiveTab(tab);
    if (day) setWorkoutDay(day);
  }

  // First launch — show onboarding
  if (!settings) return <Onboarding onDone={handleOnboardDone} />;

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh",
      background: C.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: C.textPrimary, maxWidth: 430, margin: "0 auto", position: "relative",
    }}>
      {/* Main content */}
      <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
        {activeTab === "dashboard"    && <Dashboard sessions={sessions} measurements={measurements} settings={settings} onNavigate={navigateTo} onOpenSettings={() => setShowSettings(true)} />}
        {activeTab === "workout"      && <WorkoutScreen sessions={sessions} onSaveSession={saveSession} initialDay={workoutDay} />}
        {activeTab === "progress"     && <ProgressScreen sessions={sessions} measurements={measurements} settings={settings} />}
        {activeTab === "measurements" && <MeasurementsScreen measurements={measurements} onSaveMeasurement={saveMeasurement} />}
        {activeTab === "guide"        && <GuideScreen />}
      </div>

      {/* Bottom tab bar */}
      <div style={{ display: "flex", background: C.surface, borderTop: `1px solid ${C.border}`, padding: "8px 0 env(safe-area-inset-bottom, 10px)", flexShrink: 0 }}>
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 0" }}>
              <span style={{ fontSize: 19, color: active ? C.accent : C.textMuted, lineHeight: 1 }}>{tab.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: active ? C.accent : C.textMuted, letterSpacing: "0.04em" }}>{tab.label}</span>
              {active && <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.accent, marginTop: 1 }} />}
            </button>
          );
        })}
      </div>

      {/* Settings overlay */}
      {showSettings && (
        <SettingsOverlay sessions={sessions} measurements={measurements} settings={settings} onSave={saveSettings} onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
