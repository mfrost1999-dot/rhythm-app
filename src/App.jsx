import { useState, useMemo, useEffect } from "react";

const PILLARS = [
  { id:"movement",    label:"Movement",      prompt:"Did you move naturally today?",        hasMinutes:true },
  { id:"nourishment", label:"Nourishment",   prompt:"Did you eat something real and slow?", hasNutrition:true },
  { id:"water",       label:"Water",         isWater:true },
  { id:"air",         label:"Fresh air",     prompt:"Did you get outside, even briefly?" },
  { id:"rest",        label:"Rest",          prompt:"Did you wind down intentionally?" },
  { id:"connection",  label:"Connection",    prompt:"Did you share time with someone?" },
  { id:"creative",    label:"Creative work", prompt:"Did you make or learn something yours?" },
  { id:"joy",         label:"Small joy",     prompt:"Did something delight you today?" },
];

const DAYS_SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const MONTHS_LONG = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WATER_GOAL = 8;
const WALK_GOAL  = 60;

const QUOTES = [
  { text:"The secret of health for both mind and body is not to mourn for the past, nor to worry about the future, but to live the present moment wisely.", source:"Buddhist proverb, Okinawa" },
  { text:"I am not afraid of storms, for I am learning how to sail my ship.", source:"Louisa May Alcott, Little Women" },
  { text:"Take long walks in stormy weather or through deep snow in the fields and woods, if you would keep your spirits up.", source:"Edwardian walking guide, c. 1905" },
  { text:"It is not how much we have, but how much we enjoy, that makes happiness.", source:"Blue Zones wisdom" },
  { text:"She had a gift for making the most of small pleasures.", source:"Louisa May Alcott, Little Women" },
  { text:"Eat until you are eight parts full, and let the other two parts nourish your soul.", source:"Hara hachi bu, Okinawa" },
  { text:"Sunshine is delicious, rain is refreshing, wind braces us up — there is really no such thing as bad weather.", source:"John Ruskin, c. 1870" },
  { text:"Belonging to a community is one of the most powerful medicines we have.", source:"Blue Zones research" },
  { text:"The best rooms are those in which one has laughed, cried, and lingered over tea.", source:"Edwardian domestic writing, c. 1908" },
  { text:"Family is the cornerstone of a long life well-lived.", source:"Blue Zones, Sardinia" },
  { text:"I want to do something splendid before I go into my castle, something heroic or wonderful.", source:"Louisa May Alcott, Little Women" },
  { text:"Move, eat, sleep, repeat — but do each one as if it were the only thing.", source:"Sardinian proverb" },
];

const NUDGES = {
  movement:    ["Your body is asking for a little movement today.", "Even a short walk counts — the lane is waiting.", "Yesterday you moved well. Today is another invitation."],
  nourishment: ["A slow meal is a gift to yourself.", "Try sitting down to eat today, without anything else in hand.", "Nourishment is not just food — it is the pace you eat it at."],
  water:       ["A glass of water first thing sets the tone for the whole day.", "Small sips, often. That is all it takes.", "Your afternoon might feel better with a little more water in it."],
  air:         ["Step outside today, even for five minutes. The light will do you good.", "Fresh air is the easiest medicine there is.", "A walk to the end of the street still counts."],
  rest:        ["An early wind-down tonight might be just what you need.", "Rest is not laziness — it is preparation.", "Try setting everything down a little earlier this evening."],
  connection:  ["Reach out to someone today, even briefly.", "A short conversation can change the whole color of a day.", "Who have you not spoken to in a while?"],
  creative:    ["Make something small today — it does not have to be important.", "Even ten minutes of something creative is enough.", "Your hands and mind want a little of their own work."],
  joy:         ["Look for one small thing today that makes you smile.", "Delight has a way of hiding in plain sight.", "What small pleasure have you been walking past?"],
};

const SEASONAL = {
  0:  { season:"Winter", text:"January is for quietude — the Edwardians called it the restorative month. Rest more than you think you need to." },
  1:  { season:"Winter", text:"February light is thin but returning. Even a short walk outside catches it. Blue Zones elders drink herbal teas all winter — warming, hydrating, a reason to sit still." },
  2:  { season:"Spring", text:"March is for opening windows. The Okinawan garden comes alive this month. If you can, put your hands in some soil." },
  3:  { season:"Spring", text:"April showers mean walking in rain gear, not staying inside. The Edwardians were firm on this. This is also the month to add color back to your plate." },
  4:  { season:"Spring", text:"May is the month Blue Zones gardeners are most active — movement as tending, not exercising. Eat something you grew, picked, or bought from someone who did." },
  5:  { season:"Summer", text:"June evenings are long. The Edwardians used them for after-dinner walks. Okinawan summers are built around the sea, community, and eating light." },
  6:  { season:"Summer", text:"July heat calls for water — more than you think. In the heat, the Edwardians retreated to gardens and riversides. Find your cool, quiet place." },
  7:  { season:"Summer", text:"August is for slowing down before the turn. Blue Zones elders rest more in August. The March girls spent it picking berries and reading under trees." },
  8:  { season:"Autumn", text:"September brings the harvest. Root vegetables, squash, apples — eat what the season offers freely. The air is crisp enough now for long walks." },
  9:  { season:"Autumn", text:"October in Blue Zones is for gratitude feasts — communal, unhurried, rooted in the harvest. The days are shortening; tend to your rest now." },
  10: { season:"Autumn", text:"November asks you to go inward. Warming soups and stews are the Blue Zones answer to cold weather. Be generous with connection — the dark months are easier with people close." },
  11: { season:"Winter", text:"December is for candlelight and company. Blue Zones elders treat it as a time of rest and reflection, not acceleration. What is enough for you this season?" },
};

const C = {
  cream:"#F7F4EF", parchment:"#EDE8DF", parchDark:"#D8D0C2",
  sage:"#7D9E7A", sagePale:"#C8D9C6", sageDark:"#4E6E4B",
  ink:"#2C2416", inkMid:"#6B5E47", inkLight:"#A0916F",
  clay:"#B5724A", clayPale:"#EDD9CC",
  dustBlue:"#7A99A8", dustBluePale:"#C6D8E0", dustBlueDark:"#3E6070",
  gold:"#C49A3C", goldPale:"#F0E2B6",
};
const serif = "'Georgia','Times New Roman',serif";
const sans  = "'Inter','Helvetica Neue',sans-serif";
const BASE  = 16;

function getDateKey(d) { return d.toISOString().slice(0,10); }
function offsetDate(base, days) { const d = new Date(base); d.setDate(d.getDate()+days); return d; }
function getWeekDates(anchor) {
  const dow = anchor.getDay();
  const mon = new Date(anchor); mon.setDate(anchor.getDate()-((dow+6)%7));
  return Array.from({length:7}, (_,i) => { const d=new Date(mon); d.setDate(mon.getDate()+i); return d; });
}
function fmtDate(d) { return d.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}); }
function fmtShort(d) { return d.toLocaleDateString("en-US",{month:"short",day:"numeric"}); }

const TODAY = new Date(); TODAY.setHours(0,0,0,0);

function pillarDone(p, entry) {
  if (!entry) return false;
  if (p.isWater) return (entry.glasses||0) >= WATER_GOAL;
  return !!entry.checked;
}

function dayScore(data, key) {
  if (!data[key]) return null;
  const total = PILLARS.map(p => pillarDone(p, data[key][p.id]) ? 1 : 0).reduce((a,b)=>a+b,0);
  return total / PILLARS.length;
}

function makeSeedData() {
  const d = {};
  for (let i=89; i>=0; i--) {
    const dt = new Date(TODAY); dt.setDate(TODAY.getDate()-i);
    const key = getDateKey(dt);
    d[key] = {};
    PILLARS.forEach(p => {
      if (p.isWater) {
        d[key][p.id] = { glasses: Math.floor(Math.random()*9), note:"" };
      } else if (p.hasMinutes) {
        d[key][p.id] = { checked: Math.random()>0.25, minutes: Math.floor(Math.random()*90+10), note:"" };
      } else if (p.hasNutrition) {
        d[key][p.id] = {
          checked: Math.random()>0.3, note:"",
          nutrition: {
            fruits: Math.floor(Math.random()*6),
            protein: Math.floor(Math.random()*3),
            whole: Math.floor(Math.random()*4),
            sugar: ["none","a little","quite a bit"][Math.floor(Math.random()*3)],
            processed: ["none","some","a lot"][Math.floor(Math.random()*3)],
            caffeine: ["none","one or two","several"][Math.floor(Math.random()*3)],
            slow: Math.random()>0.4,
          }
        };
      } else {
        d[key][p.id] = { checked: Math.random()>0.3, note:"" };
      }
    });
  }
  return d;
}

function buildNudge(data, todayKey, yKey) {
  const tE = data[todayKey]||{};
  const yE = data[yKey]||{};
  const missed = PILLARS.filter(p => !pillarDone(p,tE[p.id]) && pillarDone(p,yE[p.id]));
  if (!missed.length) return null;
  const pick = missed[Math.floor(Date.now()/86400000) % missed.length];
  const pool = NUDGES[pick.id];
  return { pillar: pick.label, text: pool[Math.floor(Date.now()/86400000) % pool.length] };
}

function warmthBg(s) {
  if (s===null) return "#E0DBD3";
  if (s<0.3)  return "#D4CFC8";
  if (s<0.55) return "#F0E2B6";
  if (s<0.75) return "#E8C96A";
  return "#D4A017";
}
function warmthFg(s) {
  if (s===null) return "#8A7D6A";
  if (s<0.3)  return "#6B5E47";
  if (s<0.55) return "#9A6E10";
  if (s<0.75) return "#7A4E08";
  return "#4A2E04";
}

function NavBtn({ onClick, label, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background:"none", border:`1px solid ${C.parchDark}`, borderRadius:4,
      padding:"6px 14px", cursor:disabled?"default":"pointer",
      fontFamily:sans, fontSize:14, color:disabled?C.parchDark:C.inkMid, opacity:disabled?0.4:1
    }}>{label}</button>
  );
}

function GlassIcon({ filled }) {
  return (
    <svg width="22" height="28" viewBox="0 0 22 28" fill="none">
      <path d="M4 2h14l-2 22H6L4 2z" fill={filled?C.dustBluePale:"transparent"} stroke={filled?C.dustBlue:C.parchDark} strokeWidth="1.4" strokeLinejoin="round"/>
      {filled && <path d="M5.5 10h11" stroke={C.dustBlue} strokeWidth="0.8" strokeLinecap="round" opacity="0.5"/>}
    </svg>
  );
}

function CheckBox({ on }) {
  return (
    <div style={{ width:22, height:22, borderRadius:3, flexShrink:0, border:`1.5px solid ${on?C.sage:C.inkLight}`, background:on?C.sage:"transparent", display:"flex", alignItems:"center", justifyContent:"center", transition:"all .15s" }}>
      {on && <svg width="12" height="12" viewBox="0 0 10 10"><path d="M1.5 5.5l2.5 2.5 5-5" stroke={C.cream} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </div>
  );
}

function NoteField({ value, onChange, onClick }) {
  return (
    <textarea placeholder="A note for today..." value={value||""} onChange={onChange} onClick={onClick} rows={2} style={{
      width:"100%", boxSizing:"border-box", resize:"none",
      border:`1px solid ${C.parchDark}`, borderRadius:4, padding:"10px 12px",
      fontSize:15, fontFamily:serif, fontStyle:"italic",
      background:C.cream, color:C.ink, outline:"none", lineHeight:1.7
    }}/>
  );
}

function CountRow({ label, hint, value, goal, onChange, readOnly }) {
  const pct = Math.min(1, value/goal);
  const color = pct>=1 ? C.sage : pct>=0.5 ? C.gold : C.parchDark;
  return (
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <span style={{fontFamily:sans,fontSize:14,color:C.ink}}>{label} <span style={{color:C.inkLight,fontSize:13}}>{hint}</span></span>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {!readOnly && <button onClick={()=>onChange(Math.max(0,value-1))} style={{background:"none",border:`1px solid ${C.parchDark}`,borderRadius:4,width:28,height:28,cursor:"pointer",color:C.inkLight,fontSize:16,lineHeight:"26px",textAlign:"center",padding:0}}>−</button>}
          <span style={{fontFamily:serif,fontSize:16,color:C.inkMid,minWidth:20,textAlign:"center"}}>{value}</span>
          {!readOnly && <button onClick={()=>onChange(value+1)} style={{background:"none",border:`1px solid ${C.parchDark}`,borderRadius:4,width:28,height:28,cursor:"pointer",color:C.inkLight,fontSize:16,lineHeight:"26px",textAlign:"center",padding:0}}>+</button>}
        </div>
      </div>
      <div style={{height:5,borderRadius:3,background:C.parchDark,overflow:"hidden"}}>
        <div style={{height:"100%",borderRadius:3,width:`${pct*100}%`,background:color,transition:"width .3s"}}/>
      </div>
    </div>
  );
}

function FlagRow({ label, hint, options, value, onChange, readOnly }) {
  return (
    <div style={{marginBottom:14}}>
      <div style={{fontFamily:sans,fontSize:14,color:C.ink,marginBottom:7}}>{label} <span style={{color:C.inkLight,fontSize:13}}>— {hint}</span></div>
      <div style={{display:"flex",gap:8}}>
        {options.map(o => {
          const sel = value===o;
          const good = o===options[0];
          return (
            <button key={o} onClick={()=>!readOnly&&onChange(o)} style={{
              padding:"5px 14px", borderRadius:12, border:"1px solid",
              borderColor: sel?(good?C.sageDark:C.clay):C.parchDark,
              background: sel?(good?"#EDF4EC":C.clayPale):"transparent",
              fontFamily:sans, fontSize:13,
              color: sel?(good?C.sageDark:C.clay):C.inkLight,
              cursor:readOnly?"default":"pointer"
            }}>{o}</button>
          );
        })}
      </div>
    </div>
  );
}

function BoolRow({ label, hint, value, onChange, readOnly }) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
      <span style={{fontFamily:sans,fontSize:14,color:C.ink}}>{label} <span style={{color:C.inkLight,fontSize:13}}>{hint}</span></span>
      <div onClick={()=>!readOnly&&onChange(!value)} style={{width:42,height:26,borderRadius:13,cursor:readOnly?"default":"pointer",background:value?C.sage:C.parchDark,position:"relative",transition:"background .2s",flexShrink:0}}>
        <div style={{position:"absolute",top:4,left:value?20:4,width:18,height:18,borderRadius:9,background:C.cream,transition:"left .2s"}}/>
      </div>
    </div>
  );
}

function SeasonalCard({ month }) {
  const s = SEASONAL[month];
  return (
    <div style={{padding:"20px 22px",borderRadius:4,background:C.parchment,borderLeft:`3px solid ${C.sagePale}`}}>
      <p style={{fontFamily:serif,fontStyle:"italic",fontSize:15,color:C.inkMid,lineHeight:1.8,margin:0}}>{s.text}</p>
      <p style={{fontFamily:sans,fontSize:12,color:C.inkLight,margin:"12px 0 0",letterSpacing:"0.05em",textTransform:"uppercase"}}>{s.season} · {MONTHS_LONG[month]}</p>
    </div>
  );
}

function MonthStats({ monthDays, data }) {
  const scores = monthDays
    .filter(d => d && d <= TODAY)
    .map(d => dayScore(data, getDateKey(d)))
    .filter(s => s !== null);
  const count = scores.length;
  const avg = count ? Math.round(scores.reduce((a,b)=>a+b,0)/count*100) : 0;
  const best = count ? Math.round(Math.max(...scores)*100) : 0;
  const full = scores.filter(s=>s>=0.75).length;
  const stats = [
    { label:"Days logged",      val: count },
    { label:"Full days (75%+)", val: full },
    { label:"Average",          val: count ? avg+"%" : "—" },
    { label:"Best day",         val: count ? best+"%" : "—" },
  ];
  return (
    <div style={{borderTop:`1px solid ${C.parchDark}`,paddingTop:20,marginBottom:24}}>
      <p style={{fontFamily:serif,fontSize:15,color:C.inkLight,fontStyle:"italic",margin:"0 0 14px"}}>This month at a glance</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {stats.map(item => (
          <div key={item.label} style={{padding:"14px 16px",borderRadius:4,background:C.parchment,border:`1px solid ${C.parchDark}`}}>
            <div style={{fontFamily:serif,fontSize:24,color:C.ink,marginBottom:4}}>{item.val}</div>
            <div style={{fontFamily:sans,fontSize:13,color:C.inkLight}}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [view,        setView]        = useState("today");
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem("rhythm-data");
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [expanded,    setExpanded]    = useState(null);
  const [dayOffset,   setDayOffset]   = useState(0);
  const [weekOffset,  setWeekOffset]  = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  const viewDate  = useMemo(() => offsetDate(TODAY, dayOffset), [dayOffset]);
  const viewKey   = getDateKey(viewDate);
  const isToday   = dayOffset === 0;
  const yKey      = getDateKey(offsetDate(viewDate, -1));
  const viewData  = data[viewKey] || {};

  const weekAnchor = useMemo(() => offsetDate(TODAY, weekOffset*7), [weekOffset]);
  const weekDates  = useMemo(() => getWeekDates(weekAnchor), [weekAnchor]);

  const monthRef = useMemo(() => {
    const d = new Date(TODAY.getFullYear(), TODAY.getMonth()+monthOffset, 1);
    return d;
  }, [monthOffset]);

  const monthDays = useMemo(() => {
    const year = monthRef.getFullYear();
    const month = monthRef.getMonth();
    const first = new Date(year, month, 1);
    const last  = new Date(year, month+1, 0);
    const startDow = (first.getDay()+6)%7;
    const days = [];
    for (let i=0; i<startDow; i++) days.push(null);
    for (let d=1; d<=last.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  }, [monthRef]);

  const checkedCount = PILLARS.filter(p => pillarDone(p, viewData[p.id])).length;
  const nudge   = isToday ? buildNudge(data, viewKey, yKey) : null;

  useEffect(() => {
    try { localStorage.setItem("rhythm-data", JSON.stringify(data)); }
    catch { }
  }, [data]);
  const quote   = QUOTES[Math.floor(Date.now()/86400000) % QUOTES.length];
  const nowMonth = new Date().getMonth();

  const glasses   = viewData.water?.glasses || 0;
  const walkMins  = viewData.movement?.minutes || 0;
  const nutrition = viewData.nourishment?.nutrition || { fruits:0, protein:0, whole:0, sugar:"none", processed:"none", caffeine:"none", slow:false };

  function toggle(pid) {
    if (!isToday) return;
    setData(prev => ({ ...prev, [viewKey]: { ...prev[viewKey], [pid]: { ...prev[viewKey]?.[pid], checked: !prev[viewKey]?.[pid]?.checked } } }));
  }
  function setNote(pid, val) {
    if (!isToday) return;
    setData(prev => ({ ...prev, [viewKey]: { ...prev[viewKey], [pid]: { ...prev[viewKey]?.[pid], note: val } } }));
  }
  function setMinutes(val) {
    if (!isToday) return;
    const n = Math.max(0, Math.min(240, parseInt(val)||0));
    setData(prev => ({ ...prev, [viewKey]: { ...prev[viewKey], movement: { ...prev[viewKey]?.movement, minutes: n } } }));
  }
  function setGlasses(n) {
    if (!isToday) return;
    setData(prev => ({ ...prev, [viewKey]: { ...prev[viewKey], water: { ...prev[viewKey]?.water, glasses: Math.max(0,Math.min(WATER_GOAL,n)) } } }));
  }
  function setNutrition(field, val) {
    if (!isToday) return;
    setData(prev => ({
      ...prev, [viewKey]: { ...prev[viewKey],
        nourishment: { ...prev[viewKey]?.nourishment,
          nutrition: { ...prev[viewKey]?.nourishment?.nutrition, [field]: val }
        }
      }
    }));
  }

  const greet = !isToday ? null
    : checkedCount===0 ? "How is today unfolding?"
    : checkedCount<4   ? `A gentle start — ${checkedCount} of 8.`
    : checkedCount<7   ? `You are tending well — ${checkedCount} of 8.`
    : "A truly full day. ✦";

  const isCurrentMonth = monthOffset === 0;
  const monthLabel = `${MONTHS_LONG[monthRef.getMonth()]} ${monthRef.getFullYear()}`;

  function jumpToDay(dt) {
    setView("today");
    setDayOffset(Math.round((dt - TODAY) / 86400000));
  }

  return (
    <div style={{background:C.cream, minHeight:"100vh", color:C.ink}}>
    <div style={{maxWidth:460, margin:"0 auto",       padding:"36px 20px 64px"}}>

      {/* Header */}
      <div style={{marginBottom:20, paddingBottom:18, borderBottom:`1px solid ${C.parchDark}`}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
          <h1 style={{fontFamily:serif, fontSize:38, fontWeight:400, margin:0, letterSpacing:"-0.5px"}}>Rhythm</h1>
          <p style={{fontFamily:sans, fontSize:13, color:C.inkLight, margin:0, letterSpacing:"0.08em", textTransform:"uppercase"}}>
            {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
          </p>
        </div>
        <div style={{marginTop:14, paddingTop:14, borderTop:`1px dashed ${C.parchDark}`}}>
          <p style={{fontFamily:serif, fontStyle:"italic", fontSize:15, color:C.inkMid, lineHeight:1.7, margin:"0 0 5px"}}>"{quote.text}"</p>
          <p style={{fontFamily:sans, fontSize:12, color:C.inkLight, margin:0, letterSpacing:"0.05em", textTransform:"uppercase"}}>{quote.source}</p>
        </div>
      </div>

      {/* Nav */}
      <div style={{display:"flex", gap:24, marginBottom:24, borderBottom:`1px solid ${C.parchDark}`, paddingBottom:14}}>
        {[["today","Journal"],["week","This week"],["month","Month"]].map(([v,l]) => (
          <button key={v} onClick={()=>setView(v)} style={{
            background:"none", border:"none", cursor:"pointer", padding:"0 0 2px",
            fontFamily:serif, fontSize:18, color:view===v?C.sageDark:C.inkLight,
            borderBottom:view===v?`2px solid ${C.sage}`:"2px solid transparent", transition:"all .15s"
          }}>{l}</button>
        ))}
      </div>

      {/* ── JOURNAL ── */}
      {view==="today" && (
        <>
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16}}>
            <NavBtn onClick={()=>setDayOffset(d=>d-1)} label="← Earlier" disabled={false}/>
            <div style={{textAlign:"center"}}>
              <div style={{fontFamily:serif, fontSize:16, color:C.ink}}>{isToday ? "Today" : fmtDate(viewDate)}</div>
              {!isToday && (
                <button onClick={()=>setDayOffset(0)} style={{background:"none",border:"none",cursor:"pointer",fontFamily:sans,fontSize:11,color:C.inkLight,padding:"2px 0 0",textDecoration:"underline"}}>
                  Back to today
                </button>
              )}
            </div>
            <NavBtn onClick={()=>setDayOffset(d=>d+1)} label="Later →" disabled={dayOffset>=0}/>
          </div>

          {nudge && (
            <div style={{marginBottom:18, padding:"12px 16px", borderRadius:4, background:C.goldPale, borderLeft:`3px solid ${C.gold}`}}>
              <p style={{fontFamily:serif, fontStyle:"italic", fontSize:13, color:C.inkMid, lineHeight:1.7, margin:0}}>{nudge.text}</p>
              <p style={{fontFamily:sans, fontSize:12, color:C.gold, margin:"8px 0 0", letterSpacing:"0.05em", textTransform:"uppercase"}}>{nudge.pillar} · yesterday you had this one</p>
            </div>
          )}

          {isToday  && <p style={{fontFamily:serif, fontSize:17, color:C.inkMid, marginBottom:20, marginTop:0, fontStyle:"italic"}}>{greet}</p>}
          {!isToday && <p style={{fontFamily:serif, fontSize:15, color:C.inkLight, marginBottom:16, marginTop:0, fontStyle:"italic"}}>{fmtDate(viewDate)} — a past entry, read only.</p>}

          <div style={{display:"flex", flexDirection:"column", gap:5}}>
            {PILLARS.map(p => {
              const st   = viewData[p.id];
              const on   = pillarDone(p, st);
              const open = expanded===p.id;

              // Water
              if (p.isWater) return (
                <div key={p.id} style={{borderRadius:4, border:`1px solid ${glasses>0?C.dustBluePale:C.parchDark}`, background:glasses>=WATER_GOAL?"#EAF3F7":C.parchment, overflow:"hidden"}}>
                  <div style={{padding:"12px 14px"}}>
                    <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px 10px"}}>
                      <div style={{display:"flex", alignItems:"center", gap:14}}>
                        <div style={{fontFamily:serif, fontSize:17, color:glasses>=WATER_GOAL?C.sageDark:C.ink}}>Water</div>
                        <div style={{fontFamily:sans, fontSize:13, color:C.inkLight}}>
                          {glasses===0 ? "Tap a glass to log" : glasses>=WATER_GOAL ? "Well hydrated today ✦" : `${glasses} of ${WATER_GOAL} glasses`}
                        </div>
                      </div>
                      {isToday && (
                        <div style={{display:"flex", gap:6, alignItems:"center"}}>
                          <button onClick={()=>setGlasses(glasses-1)} style={{background:"none",border:`1px solid ${C.parchDark}`,borderRadius:4,width:30,height:30,cursor:"pointer",fontSize:18,color:C.inkLight,lineHeight:"28px",textAlign:"center",padding:0}}>−</button>
                          <span style={{fontFamily:serif, fontSize:18, color:C.dustBlueDark, minWidth:22, textAlign:"center"}}>{glasses}</span>
                          <button onClick={()=>setGlasses(glasses+1)} style={{background:"none",border:`1px solid ${C.parchDark}`,borderRadius:4,width:30,height:30,cursor:"pointer",fontSize:18,color:C.inkLight,lineHeight:"28px",textAlign:"center",padding:0}}>+</button>
                        </div>
                      )}
                      {!isToday && <span style={{fontFamily:serif, fontSize:18, color:C.dustBlueDark}}>{glasses}</span>}
                    </div>
                    <div style={{display:"flex", gap:5, flexWrap:"wrap", padding:"0 16px 14px"}}>
                      {Array.from({length:WATER_GOAL}, (_,i) => (
                        <button key={i} onClick={()=>isToday&&setGlasses(i<glasses?i:i+1)} style={{background:"none",border:"none",cursor:isToday?"pointer":"default",padding:0,transform:i<glasses?"translateY(-2px)":"none",transition:"transform .15s"}}>
                          <GlassIcon filled={i<glasses}/>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );

              // Nourishment
              if (p.hasNutrition) {
                const nDone = nutrition.fruits>=3 || nutrition.protein>=2 || nutrition.whole>=2 || nutrition.slow;
                const nColor = nDone ? C.sageDark : C.ink;
                const nBorder = nDone ? C.sagePale : C.parchDark;
                const nBg = nDone ? "#EDF4EC" : C.parchment;
                const nSummary = [
                  nutrition.fruits>0 && `${nutrition.fruits} fruit/veg`,
                  nutrition.slow && "ate slowly",
                  nutrition.sugar!=="none" && `sugar: ${nutrition.sugar}`,
                ].filter(Boolean).join(" · ") || p.prompt;
                return (
                <div key={p.id} style={{borderRadius:4, border:`1px solid ${nBorder}`, background:nBg, overflow:"hidden"}}>
                  <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px"}}>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:serif, fontSize:17, color:nColor}}>Nourishment</div>
                      <div style={{fontFamily:sans, fontSize:13, color:C.inkLight, marginTop:3}}>{nSummary}</div>
                    </div>
                    <button onClick={e=>{e.stopPropagation();setExpanded(open?null:p.id);}} style={{background:"none",border:"none",cursor:"pointer",padding:"0 4px",fontFamily:serif,fontSize:24,lineHeight:1,color:C.inkLight,flexShrink:0}}>{open?"−":"+"}</button>
                  </div>
                  {open && (
                    <div style={{padding:"12px 16px 14px", borderTop:`1px dashed ${C.parchDark}`}}>
                      <CountRow label="Fruits & vegetables" hint="aim for 5" value={nutrition.fruits} goal={5} onChange={v=>setNutrition("fruits",v)} readOnly={!isToday}/>
                      <CountRow label="Protein" hint="beans, eggs, meat, fish" value={nutrition.protein} goal={2} onChange={v=>setNutrition("protein",v)} readOnly={!isToday}/>
                      <CountRow label="Whole grains" hint="oats, rice, bread" value={nutrition.whole} goal={3} onChange={v=>setNutrition("whole",v)} readOnly={!isToday}/>
                      <div style={{height:1, background:C.parchDark, margin:"10px 0"}}/>
                      <FlagRow label="Added sugar" hint="sweets, syrups, sweet drinks" options={["none","a little","quite a bit"]} value={nutrition.sugar} onChange={v=>setNutrition("sugar",v)} readOnly={!isToday}/>
                      <FlagRow label="Processed food" hint="packaged, fast food" options={["none","some","a lot"]} value={nutrition.processed} onChange={v=>setNutrition("processed",v)} readOnly={!isToday}/>
                      <div style={{height:1, background:C.parchDark, margin:"10px 0"}}/>
                      <FlagRow label="Caffeine" hint="coffee, soda, energy drinks" options={["none","one or two","several"]} value={nutrition.caffeine||"none"} onChange={v=>setNutrition("caffeine",v)} readOnly={!isToday}/>
                      <div style={{height:1, background:C.parchDark, margin:"10px 0"}}/>
                      <BoolRow label="Ate slowly" hint="sat down, present, no rush" value={nutrition.slow} onChange={v=>setNutrition("slow",v)} readOnly={!isToday}/>
                      <div style={{marginTop:10}}>
                        <NoteField value={st?.note} onChange={e=>setNote(p.id,e.target.value)} onClick={e=>e.stopPropagation()}/>
                      </div>
                    </div>
                  )}
                </div>
              );
              }

              // Movement
              if (p.hasMinutes) {
                const mDone = walkMins >= WALK_GOAL;
                const mColor = mDone ? C.sageDark : C.ink;
                const mBorder = mDone ? C.sagePale : C.parchDark;
                const mBg = mDone ? "#EDF4EC" : C.parchment;
                const mSummary = walkMins > 0 ? `${walkMins} min walked${walkMins >= 90 ? " ✦" : walkMins >= WALK_GOAL ? " · goal met" : ` · ${WALK_GOAL - walkMins} to go`}` : `goal: ${WALK_GOAL} min`;
                return (
                <div key={p.id} style={{borderRadius:4, border:`1px solid ${mBorder}`, background:mBg, overflow:"hidden"}}>
                  <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px"}}>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:serif, fontSize:17, color:mColor}}>Movement</div>
                      <div style={{fontFamily:sans, fontSize:13, color:C.inkLight, marginTop:3}}>{mSummary}</div>
                    </div>
                    <button onClick={e=>{e.stopPropagation();setExpanded(open?null:p.id);}} style={{background:"none",border:"none",cursor:"pointer",padding:"0 4px",fontFamily:serif,fontSize:24,lineHeight:1,color:C.inkLight,flexShrink:0}}>{open?"−":"+"}</button>
                  </div>
                  <div style={{padding:"0 16px 14px"}}>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6}}>
                      <span style={{fontFamily:sans, fontSize:13, color:C.inkLight}}>Minutes walked</span>
                      <div style={{display:"flex", alignItems:"center", gap:6}}>
                        {isToday ? (
                          <div style={{display:"flex", alignItems:"center", gap:4}}>
                            <input type="number" min="0" max="240" value={walkMins||""} placeholder="0"
                              onChange={e=>setMinutes(e.target.value)} onClick={e=>e.stopPropagation()}
                              style={{width:52, padding:"2px 6px", borderRadius:3, textAlign:"right", border:`1px solid ${C.parchDark}`, background:C.cream, fontFamily:serif, fontSize:13, color:C.ink, outline:"none"}}/>
                            <span style={{fontFamily:sans, fontSize:11, color:C.inkLight}}>min</span>
                          </div>
                        ) : (
                          <span style={{fontFamily:serif, fontSize:13, color:C.inkMid}}>{walkMins} min</span>
                        )}
                        <span style={{fontFamily:serif, fontSize:12, color:walkMins>=90?C.sage:walkMins>=WALK_GOAL?C.sageDark:C.inkLight}}>
                          {walkMins>=90 ? "✦" : walkMins>=WALK_GOAL ? "· goal met" : walkMins>0 ? `· ${WALK_GOAL-walkMins} to go` : `· goal ${WALK_GOAL} min`}
                        </span>
                      </div>
                    </div>
                    <div style={{height:5, borderRadius:3, background:C.parchDark, overflow:"hidden", marginBottom: open?10:0}}>
                      <div style={{height:"100%", borderRadius:3, width:`${Math.min(100,(walkMins/90)*100)}%`, background:walkMins>=90?C.sage:walkMins>=WALK_GOAL?C.sagePale:C.gold, transition:"width .3s"}}/>
                    </div>
                    {open && <div style={{marginTop:10}}><NoteField value={st?.note} onChange={e=>setNote(p.id,e.target.value)} onClick={e=>e.stopPropagation()}/></div>}
                  </div>
                </div>
              );
              }

              // Standard
              return (
                <div key={p.id} style={{borderRadius:4, border:`1px solid ${on?C.sagePale:C.parchDark}`, background:on?"#EDF4EC":C.parchment, overflow:"hidden"}}>
                  <div style={{display:"flex", alignItems:"center", padding:"14px 16px", gap:14, cursor:isToday?"pointer":"default"}} onClick={()=>toggle(p.id)}>
                    <CheckBox on={on}/>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:serif, fontSize:17, color:on?C.sageDark:C.ink}}>{p.label}</div>
                      <div style={{fontFamily:sans, fontSize:13, color:C.inkLight, marginTop:3}}>{p.prompt}</div>
                    </div>
                    <button onClick={e=>{e.stopPropagation();setExpanded(open?null:p.id);}} style={{background:"none",border:"none",cursor:"pointer",padding:"0 4px",fontFamily:serif,fontSize:24,lineHeight:1,color:C.inkLight,flexShrink:0}}>{open?"−":"+"}</button>
                  </div>
                  {open && (
                    <div style={{padding:"0 16px 14px 52px"}}>
                      <NoteField value={st?.note} onChange={e=>setNote(p.id,e.target.value)} onClick={e=>e.stopPropagation()}/>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── WEEK ── */}
      {view==="week" && (
        <>
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20}}>
            <NavBtn onClick={()=>setWeekOffset(w=>w-1)} label="← Earlier" disabled={false}/>
            <div style={{fontFamily:serif, fontSize:14, color:C.ink, textAlign:"center"}}>
              {weekOffset===0 ? "This week" : weekOffset===-1 ? "Last week" : `${fmtShort(weekDates[0])} – ${fmtShort(weekDates[6])}`}
            </div>
            <NavBtn onClick={()=>setWeekOffset(w=>w+1)} label="Later →" disabled={weekOffset>=0}/>
          </div>

          <p style={{fontFamily:serif, fontSize:15, color:C.inkLight, fontStyle:"italic", margin:"0 0 14px"}}>Weekly warmth</p>
          <div style={{display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:5, marginBottom:10}}>
            {weekDates.map((dt,i) => {
              const key = getDateKey(dt);
              const score = dayScore(data, key);
              const isTodayCell = key===getDateKey(TODAY);
              return (
                <div key={i} style={{textAlign:"center"}}>
                  <div style={{fontFamily:sans, fontSize:11, color:C.inkLight, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em"}}>{DAYS_SHORT[i]}</div>
                  <div onClick={()=>jumpToDay(dt)} style={{height:52, borderRadius:3, cursor:"pointer", background:warmthBg(score), border:`${isTodayCell?2:1}px solid ${isTodayCell?C.sage:C.parchDark}`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:sans, fontSize:12, color:warmthFg(score), fontWeight:isTodayCell?600:400}}>
                    {score!==null ? Math.round(score*100)+"%" : "–"}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{display:"flex", gap:14, marginBottom:28, flexWrap:"wrap"}}>
            {[["#D4CFC8","Quiet"],["#F0E2B6","Stirring"],["#E8C96A","Tending"],["#D4A017","Full"]].map(([bg,l]) => (
              <div key={l} style={{display:"flex", alignItems:"center", gap:6, fontFamily:sans, fontSize:13, color:C.inkLight}}>
                <div style={{width:12, height:12, borderRadius:2, background:bg, border:`1px solid ${C.parchDark}`}}/>
                {l}
              </div>
            ))}
          </div>

          <div style={{borderTop:`1px solid ${C.parchDark}`, marginBottom:24}}/>
          <p style={{fontFamily:serif, fontSize:15, color:C.inkLight, fontStyle:"italic", margin:"0 0 16px"}}>By pillar</p>
          <div style={{display:"flex", flexDirection:"column", gap:12, marginBottom:32}}>
            {PILLARS.map(p => {
              const dots = weekDates.map(dt => {
                const key = getDateKey(dt);
                if (!data[key]) return "empty";
                return pillarDone(p, data[key][p.id]) ? "yes" : "no";
              });
              const cnt = dots.filter(d=>d==="yes").length;
              return (
                <div key={p.id} style={{display:"flex", alignItems:"center", gap:10}}>
                  <div style={{width:116, fontFamily:serif, fontSize:14, color:C.ink, flexShrink:0}}>{p.label}</div>
                  <div style={{display:"flex", gap:5, flex:1}}>
                    {dots.map((d,i) => (
                      <div key={i} style={{width:24, height:24, borderRadius:3, background:d==="yes"?(p.isWater?C.dustBluePale:C.sage):d==="no"?C.parchment:"transparent", border:d==="empty"?"none":`1px solid ${d==="yes"?(p.isWater?C.dustBlue:C.sageDark):C.parchDark}`}}/>
                    ))}
                  </div>
                  <div style={{fontFamily:sans, fontSize:13, color:C.inkLight, width:28, textAlign:"right"}}>{cnt}/7</div>
                </div>
              );
            })}
          </div>
          <SeasonalCard month={nowMonth}/>
        </>
      )}

      {/* ── MONTH ── */}
      {view==="month" && (
        <>
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20}}>
            <NavBtn onClick={()=>setMonthOffset(m=>m-1)} label="← Earlier" disabled={false}/>
            <div style={{fontFamily:serif, fontSize:15, color:C.ink}}>{monthLabel}</div>
            <NavBtn onClick={()=>setMonthOffset(m=>m+1)} label="Later →" disabled={isCurrentMonth}/>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:6}}>
            {DAYS_SHORT.map(d => (
              <div key={d} style={{fontFamily:sans, fontSize:11, color:C.inkLight, textAlign:"center", textTransform:"uppercase", letterSpacing:"0.05em"}}>{d}</div>
            ))}
          </div>

          <div style={{display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:28}}>
            {monthDays.map((dt,i) => {
              if (!dt) return <div key={i}/>;
              const key = getDateKey(dt);
              const score = dayScore(data, key);
              const isTodayCell = key===getDateKey(TODAY);
              const isFuture = dt > TODAY;
              return (
                <div key={i} onClick={()=>{ if(!isFuture) jumpToDay(dt); }} style={{
                  aspectRatio:"1", borderRadius:4,
                  background: isFuture ? C.cream : score===null ? C.parchment : warmthBg(score),
                  border:`${isTodayCell?2:1}px solid ${isTodayCell?C.sage:C.parchDark}`,
                  display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                  cursor: isFuture?"default":"pointer", opacity:isFuture?0.35:1
                }}>
                  <span style={{fontFamily:sans, fontSize:12, color:isFuture?C.inkLight:score!==null?warmthFg(score):C.inkLight, fontWeight:isTodayCell?700:400}}>
                    {dt.getDate()}
                  </span>
                  {score!==null && !isFuture && (
                    <span style={{fontFamily:sans, fontSize:10, color:warmthFg(score), opacity:0.85, marginTop:1}}>
                      {Math.round(score*100)}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <MonthStats monthDays={monthDays} data={data}/>
          <SeasonalCard month={nowMonth}/>
        </>
      )}

    </div>
    </div>
  );
}
