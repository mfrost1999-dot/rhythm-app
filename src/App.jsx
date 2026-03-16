import { useState, useMemo, useEffect } from "react";

const WATER_GOAL    = 8;
const WALK_GOAL     = 60;
const EIGHTY_PCT    = 7;
const TOTAL_PILLARS = 9;
const DAYS_SHORT    = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const MONTHS_LONG   = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const PILLARS = [
  { id:"movement",    label:"Movement",      prompt:"Did you move naturally today?",           hasMinutes:true },
  { id:"nourishment", label:"Nourishment",   prompt:"Did you eat something real and slow?",    hasNutrition:true },
  { id:"water",       label:"Water",         isWater:true },
  { id:"air",         label:"Fresh air",     prompt:"Did you get outside, even briefly?" },
  { id:"rest",        label:"Rest",          prompt:"Did you wind down intentionally?" },
  { id:"connection",  label:"Connection",    prompt:"Did you share time with someone?" },
  { id:"creative",    label:"Creative work", prompt:"Did you give time to your creative self today?" },
  { id:"joy",         label:"Small joy",     prompt:"Did something delight you today?" },
  { id:"faith",       label:"Faith",         prompt:"Did you connect with God today?" },
];

const QUOTES = [
  { text:"The secret of health for both mind and body is not to mourn for the past, nor to worry about the future, but to live the present moment wisely.", source:"Buddhist proverb, Okinawa" },
  { text:"I am not afraid of storms, for I am learning how to sail my ship.", source:"Louisa May Alcott, Little Women" },
  { text:"Take long walks in stormy weather or through deep snow in the fields and woods, if you would keep your spirits up.", source:"Edwardian walking guide, c. 1905" },
  { text:"It is not how much we have, but how much we enjoy, that makes happiness.", source:"Blue Zones wisdom" },
  { text:"She had a gift for making the most of small pleasures.", source:"Louisa May Alcott, Little Women" },
  { text:"Eat until you are eight parts full, and let the other two parts nourish your soul.", source:"Hara hachi bu, Okinawa" },
  { text:"Sunshine is delicious, rain is refreshing, wind braces us up. There is really no such thing as bad weather.", source:"John Ruskin, c. 1870" },
  { text:"Belonging to a community is one of the most powerful medicines we have.", source:"Blue Zones research" },
  { text:"The best rooms are those in which one has laughed, cried, and lingered over tea.", source:"Edwardian domestic writing, c. 1908" },
  { text:"Family is the cornerstone of a long life well-lived.", source:"Blue Zones, Sardinia" },
  { text:"I want to do something splendid before I go into my castle, something heroic or wonderful.", source:"Louisa May Alcott, Little Women" },
  { text:"Move, eat, sleep, repeat. But do each one as if it were the only thing.", source:"Sardinian proverb" },
  { text:"She is too fond of books, and it has turned her brain.", source:"Louisa May Alcott, worn as a badge of honor" },
  { text:"To keep the body in good health is a duty, otherwise we shall not be able to keep our mind strong and clear.", source:"Buddhist proverb" },
  { text:"There is no sincerer love than the love of food.", source:"George Bernard Shaw, c. 1903" },
  { text:"Walking is a man's best medicine.", source:"Hippocrates" },
  { text:"Jo's ambition was to do something very splendid. What it was she had yet to decide.", source:"Louisa May Alcott, Little Women" },
  { text:"The people who live the longest do not try to live longer. They live fully.", source:"Blue Zones research" },
  { text:"Wherever you go, go with all your heart.", source:"Confucian proverb, Okinawa" },
  { text:"An early morning walk is a blessing for the whole day.", source:"Henry David Thoreau, c. 1850" },
  { text:"I cannot live without books.", source:"Thomas Jefferson, c. 1815" },
  { text:"In seed time learn, in harvest teach, in winter enjoy.", source:"William Blake, c. 1790" },
  { text:"The cure for anything is salt water: sweat, tears, or the sea.", source:"Isak Dinesen, c. 1934" },
  { text:"Let food be thy medicine and medicine be thy food.", source:"Hippocrates" },
  { text:"She resolved to be the maker of her own happiness.", source:"Louisa May Alcott, Little Women" },
  { text:"Drink your tea slowly and reverently, as if it is the axis on which the whole earth revolves.", source:"Thich Nhat Hanh" },
  { text:"A gentle walk among old trees is worth more than an hour in any doctor's office.", source:"Edwardian naturalist, c. 1907" },
  { text:"To find joy in work is to discover the fountain of youth.", source:"Pearl S. Buck" },
  { text:"The greatest wealth is health.", source:"Virgil" },
  { text:"She was not made for sitting still.", source:"Louisa May Alcott, Little Women" },
  { text:"Good friends, good books, and a sleepy conscience. That is the ideal life.", source:"Mark Twain, c. 1898" },
  { text:"Sleep is the golden chain that ties health and our bodies together.", source:"Thomas Dekker, c. 1609" },
  { text:"In Okinawa, they say that the reason they live so long is that they never retire from life.", source:"Blue Zones research" },
  { text:"I took a walk in the woods and came out taller than the trees.", source:"Henry David Thoreau" },
  { text:"Simplicity is the ultimate sophistication.", source:"Leonardo da Vinci" },
  { text:"One cannot think well, love well, sleep well, if one has not dined well.", source:"Virginia Woolf, c. 1929" },
];

const NUDGES = {
  movement:    ["Your body is asking for a little movement today.", "Even a short walk counts. The lane is waiting.", "Yesterday you moved well. Today is another invitation."],
  nourishment: ["A slow meal is a gift to yourself.", "Try sitting down to eat today, without anything else in hand.", "Nourishment is not just food. It is the pace you eat it at."],
  water:       ["A glass of water first thing sets the tone for the whole day.", "Small sips, often. That is all it takes.", "Your afternoon might feel better with a little more water in it."],
  air:         ["Step outside today, even for five minutes. The light will do you good.", "Fresh air is the easiest medicine there is.", "A walk to the end of the street still counts."],
  rest:        ["An early wind-down tonight might be just what you need.", "Rest is not laziness. It is preparation.", "Try setting everything down a little earlier this evening."],
  connection:  ["Reach out to someone today, even briefly.", "A short conversation can change the whole color of a day.", "Who have you not spoken to in a while?"],
  creative:    ["Make something small today. It does not have to be important.", "Even ten minutes of something creative is enough.", "Your hands and mind want a little of their own work."],
  faith:       ["Take a moment today to be still and listen.", "Even a short prayer counts. God is in the quiet moments too.", "Your spiritual life is worth tending today, even briefly."],
};

const ENCOURAGEMENT = {
  movement:    ["Movement has been showing up in your days this week. Your body notices.", "You have been keeping yourself in motion. That steadiness is worth something.", "Walking has become part of your rhythm. That is exactly how it should feel."],
  nourishment: ["You have been tending to your meals with care this week. That is a quiet kind of love.", "Nourishment has been a priority lately. Your body is grateful for the attention.", "Something is shifting in how you are feeding yourself. Keep going."],
  water:       ["You have been drinking your water consistently. More than you might think it matters.", "Hydration has been a quiet win this week. The kind that adds up.", "Water has been showing up in your days. Simple, steady, good."],
  air:         ["Fresh air has found its way into your week. That is no small thing.", "You have been getting outside. The light and the air are doing their work.", "You stepped out into the world this week, even on hard days. That counts."],
  rest:        ["Rest has been part of your week. You are learning to honor that.", "You have been winding down with intention. Your sleep will thank you.", "Rest is showing up in your rhythm. That is one of the most important things."],
  connection:  ["You have been showing up for the people in your life this week.", "Connection has been a thread in your days lately. Hold onto that.", "You have not been doing this alone. That matters more than you know."],
  creative:    ["Your creative work has been showing up this week. That part of you is alive.", "You have been making things, learning things, doing things that are yours. Keep that.", "Something creative has found its place in your week. Do not let it go."],
  faith:       ["Your faith has been a thread in your days this week. That quiet practice matters.", "You have been showing up for your spiritual life. That is no small thing.", "Connecting with God has been part of your rhythm this week. Keep tending to it."],
};

const SEASONAL = [
  { season:"Winter",  text:"January is a good month to tend your faith. Marmee began each new year with prayer and intention. What do you want to carry into this one?" },
  { season:"Winter",  text:"February is for connection. The March girls wrote letters, paid visits, and gathered close. The Edwardians called it the social season for good reason. Who have you been meaning to reach out to?" },
  { season:"Spring",  text:"March is for opening windows. Jo flung hers open every spring morning. If you can, put your hands in some soil and feel the season turning." },
  { season:"Spring",  text:"April is for movement. The Edwardians cycled, walked, and played lawn games the moment the weather turned. Find your version of that and get outside." },
  { season:"Spring",  text:"May is the month Blue Zones gardeners are most active. Movement as tending, not exercising. Eat something you grew, picked, or bought from someone who did." },
  { season:"Summer",  text:"June is for nourishment. Blue Zones summers are built around fresh food eaten slowly with people you love. Eat the season fully this month." },
  { season:"Summer",  text:"July is for water. More than you think, more than you track. The Edwardians retreated to riversides and the sea. Find your cool, quiet place and linger there." },
  { season:"Summer",  text:"August is for creative work. Amy sketched all summer. Jo wrote. Beth played. The long light gives you time. Make something this month, even something small." },
  { season:"Autumn",  text:"September brings the harvest. Root vegetables, squash, apples. Eat what the season offers freely. The air is crisp enough now for long walks." },
  { season:"Autumn",  text:"October is for connection. In Sardinia, October means communal feasts and long evenings with family. The Edwardians called on neighbors before the dark months set in. Gather your people." },
  { season:"Autumn",  text:"November is for faith. The days are short and the light is thin. Marmee always said November was the month to count your blessings out loud. What are yours?" },
  { season:"Winter",  text:"December is for rest and reflection, yes, but also for joy. The March Christmas had very little and it was everything. Blue Zones elders say the secret to a long life is knowing what is enough. What is enough for you?" },
];

const C = {
  cream:"#F8F6F1", parchment:"#EEEAE2", parchDark:"#CEC8BC",
  sage:"#5C8A58", sagePale:"#B0CCAD", sageDark:"#2E5C2A",
  ink:"#1C1C18", inkMid:"#3D3D30", inkLight:"#747060",
  clay:"#9E5A2E", clayPale:"#EDD9C0",
  dustBlue:"#5A7E90", dustBluePale:"#B0CCD8", dustBlueDark:"#2A5060",
  gold:"#A87C1E", goldPale:"#F0E4A8",
};
const serif = "'Georgia','Times New Roman',serif";
const sans  = "'Inter','Helvetica Neue',sans-serif";

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
  if (p.isWater)    return (entry.glasses||0) >= WATER_GOAL;
  if (p.hasMinutes) return (entry.minutes||0) >= WALK_GOAL;
  if (p.hasNutrition) {
    const n = entry.nutrition||{};
    const score =
      Math.min(parseInt(n.fruits)||0, 5) +
      Math.min(parseInt(n.protein)||0, 2) +
      Math.min(parseInt(n.whole)||0, 3) +
      (n.slow ? 2 : 0) +
      (n.sugar === "a little" ? -1 : n.sugar === "quite a bit" ? -3 : 0) +
      (n.processed === "some" ? -1 : n.processed === "a lot" ? -3 : 0) +
      (n.caffeine === "several" ? -1 : 0);
    return score >= 5;
  }
  return !!entry.checked;
}

function dayScore(data, key) {
  if (!data[key]) return null;
  return PILLARS.map(p => pillarDone(p,data[key][p.id]) ? 1 : 0).reduce((a,b)=>a+b,0) / TOTAL_PILLARS;
}

function buildNudge(data, todayKey, yKey) {
  const tE = data[todayKey]||{}, yE = data[yKey]||{};
  const missed = PILLARS.filter(p => !pillarDone(p,tE[p.id]) && pillarDone(p,yE[p.id]));
  if (!missed.length) return null;
  const pick = missed[Math.floor(Date.now()/86400000) % missed.length];
  return { pillar:pick.label, text:NUDGES[pick.id][Math.floor(Date.now()/86400000) % NUDGES[pick.id].length] };
}

function buildEncouragement(data) {
  const past7 = Array.from({length:7}, (_,i) => { const d=new Date(TODAY); d.setDate(TODAY.getDate()-i-1); return getDateKey(d); });
  const scored = PILLARS.map(p => ({ id:p.id, label:p.label, count:past7.filter(k => data[k] && pillarDone(p,data[k][p.id])).length }));
  const best = scored.reduce((a,b) => b.count>a.count ? b : a, scored[0]);
  if (best.count < 3) return null;
  const pool = ENCOURAGEMENT[best.id];
  return { pillar:best.label, count:best.count, text:pool[Math.floor(Date.now()/86400000) % pool.length] };
}

function warmthBg(s) {
  if (s===null) return "#EEEAE2";
  if (s < 0.3)                      return "#D4CFC8";
  if (s < 0.55)                     return "#F0E2B6";
  if (s < EIGHTY_PCT/TOTAL_PILLARS) return "#E8C96A";
  return "#D4A017";
}
function warmthFg(s) {
  if (s===null) return "#747060";
  if (s < 0.3)                      return "#3D3D30";
  if (s < 0.55)                     return "#9A6E10";
  if (s < EIGHTY_PCT/TOTAL_PILLARS) return "#7A4E08";
  return "#4A2E04";
}

function NavBtn({ onClick, label, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{background:"none",border:"1px solid "+C.parchDark,borderRadius:4,padding:"6px 14px",cursor:disabled?"default":"pointer",fontFamily:sans,fontSize:14,color:disabled?C.parchDark:C.inkMid,opacity:disabled?0.4:1}}>
      {label}
    </button>
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
    <div style={{width:22,height:22,borderRadius:3,flexShrink:0,border:"1.5px solid "+(on?C.sage:C.inkLight),background:on?C.sage:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
      {on && <svg width="12" height="12" viewBox="0 0 10 10"><path d="M1.5 5.5l2.5 2.5 5-5" stroke={C.cream} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </div>
  );
}

function NoteField({ value, onChange, onClick }) {
  return (
    <textarea placeholder="A note for today..." value={value||""} onChange={onChange} onClick={onClick} rows={2} style={{width:"100%",boxSizing:"border-box",resize:"none",border:"1px solid "+C.parchDark,borderRadius:4,padding:"10px 12px",fontSize:15,fontFamily:serif,fontStyle:"italic",background:C.cream,color:C.ink,outline:"none",lineHeight:1.7}}/>
  );
}

function ClearBtn({ onClear }) {
  return (
    <button onClick={onClear} style={{background:"none",border:"none",cursor:"pointer",fontFamily:sans,fontSize:12,color:C.inkLight,textDecoration:"underline",padding:"6px 0 0",display:"block"}}>
      Clear this entry
    </button>
  );
}

function CountRow({ label, hint, value, goal, onChange, readOnly }) {
  const v = parseInt(value)||0;
  const pct = Math.min(1, v/goal);
  const color = pct>=1 ? C.sage : pct>=0.5 ? C.gold : C.parchDark;
  return (
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <span style={{fontFamily:sans,fontSize:14,color:C.ink}}>{label} <span style={{color:C.inkLight,fontSize:13}}>{hint}</span></span>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {!readOnly && <button onClick={()=>onChange(Math.max(0,v-1))} style={{background:"none",border:"1px solid "+C.parchDark,borderRadius:4,width:28,height:28,cursor:"pointer",color:C.inkLight,fontSize:16,lineHeight:"26px",textAlign:"center",padding:0}}>-</button>}
          <span style={{fontFamily:serif,fontSize:16,color:C.inkMid,minWidth:20,textAlign:"center"}}>{v}</span>
          {!readOnly && <button onClick={()=>onChange(v+1)} style={{background:"none",border:"1px solid "+C.parchDark,borderRadius:4,width:28,height:28,cursor:"pointer",color:C.inkLight,fontSize:16,lineHeight:"26px",textAlign:"center",padding:0}}>+</button>}
        </div>
      </div>
      <div style={{height:5,borderRadius:3,background:C.parchDark,overflow:"hidden"}}>
        <div style={{height:"100%",borderRadius:3,width:(pct*100)+"%",background:color,transition:"width .3s"}}/>
      </div>
    </div>
  );
}

function FlagRow({ label, hint, options, value, onChange, readOnly }) {
  return (
    <div style={{marginBottom:14}}>
      <div style={{fontFamily:sans,fontSize:14,color:C.ink,marginBottom:7}}>{label} <span style={{color:C.inkLight,fontSize:13}}>-- {hint}</span></div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {options.map(o => {
          const sel = value===o, good = o===options[0];
          return (
            <button key={o} onClick={()=>!readOnly&&onChange(o)} style={{padding:"5px 14px",borderRadius:12,border:"1px solid",borderColor:sel?(good?C.sageDark:C.clay):C.parchDark,background:sel?(good?"#EDF4EC":C.clayPale):"transparent",fontFamily:sans,fontSize:13,color:sel?(good?C.sageDark:C.clay):C.inkLight,cursor:readOnly?"default":"pointer"}}>
              {o}
            </button>
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
    <div style={{padding:"20px 22px",borderRadius:4,background:C.parchment,borderLeft:"3px solid "+C.sagePale}}>
      <p style={{fontFamily:serif,fontStyle:"italic",fontSize:15,color:C.inkMid,lineHeight:1.8,margin:0}}>{s.text}</p>
      <p style={{fontFamily:sans,fontSize:12,color:C.inkLight,margin:"12px 0 0",letterSpacing:"0.05em",textTransform:"uppercase"}}>{s.season} · {MONTHS_LONG[month]}</p>
    </div>
  );
}

function MonthStats({ monthDays, data }) {
  const scores = monthDays.filter(d=>d&&d<=TODAY).map(d=>dayScore(data,getDateKey(d))).filter(s=>s!==null);
  const count  = scores.length;
  const avg    = count ? Math.round(scores.reduce((a,b)=>a+b,0)/count*100) : 0;
  const best   = count ? Math.round(Math.max(...scores)*100) : 0;
  const at80   = scores.filter(s=>s>=EIGHTY_PCT/TOTAL_PILLARS).length;
  const stats  = [
    { label:"Days logged",    val:count },
    { label:"Days at 80%+",   val:at80 },
    { label:"Average",        val:count?avg+"%":"--" },
    { label:"Best day",       val:count?best+"%":"--" },
  ];
  return (
    <div style={{borderTop:"1px solid "+C.parchDark,paddingTop:20,marginBottom:24}}>
      <p style={{fontFamily:serif,fontSize:15,color:C.inkLight,fontStyle:"italic",margin:"0 0 14px"}}>This month at a glance</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {stats.map(item => (
          <div key={item.label} style={{padding:"14px 16px",borderRadius:4,background:C.parchment,border:"1px solid "+C.parchDark}}>
            <div style={{fontFamily:serif,fontSize:24,color:C.ink,marginBottom:4}}>{item.val}</div>
            <div style={{fontFamily:sans,fontSize:13,color:C.inkLight}}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfirmModal({ target, onConfirm, onCancel }) {
  const pillar = PILLARS.find(p=>p.id===target);
  const isDay  = target==="day";
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(44,36,22,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:"0 24px"}}>
      <div style={{background:C.cream,borderRadius:12,padding:"28px 24px",maxWidth:320,width:"100%"}}>
        <p style={{fontFamily:serif,fontSize:17,color:C.ink,margin:"0 0 8px",fontWeight:400}}>
          {isDay ? "Clear this whole day?" : "Clear "+(pillar?pillar.label:"entry")+"?"}
        </p>
        <p style={{fontFamily:sans,fontSize:13,color:C.inkLight,margin:"0 0 24px",lineHeight:1.6}}>
          {isDay ? "All entries for this day will be reset to blank." : "This pillar's data and notes will be reset to blank."}
        </p>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onCancel} style={{flex:1,padding:"10px 0",borderRadius:6,border:"1px solid "+C.parchDark,background:"transparent",fontFamily:sans,fontSize:14,color:C.inkMid,cursor:"pointer"}}>Cancel</button>
          <button onClick={onConfirm} style={{flex:1,padding:"10px 0",borderRadius:6,border:"none",background:C.clay,fontFamily:sans,fontSize:14,color:C.cream,cursor:"pointer"}}>Clear</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [view,         setView]         = useState("today");
  const [data,         setData]         = useState(() => { try { const s=localStorage.getItem("rhythm-data"); return s?JSON.parse(s):{}; } catch { return {}; } });
  const [expanded,     setExpanded]     = useState(null);
  const [dayOffset,    setDayOffset]    = useState(0);
  const [weekOffset,   setWeekOffset]   = useState(0);
  const [monthOffset,  setMonthOffset]  = useState(0);
  const [confirmClear, setConfirmClear] = useState(null);

  const viewDate   = useMemo(() => offsetDate(TODAY,dayOffset), [dayOffset]);
  const viewKey    = getDateKey(viewDate);
  const isToday    = dayOffset===0;
  const yKey       = getDateKey(offsetDate(viewDate,-1));
  const viewData   = data[viewKey]||{};
  const weekAnchor = useMemo(() => offsetDate(TODAY,weekOffset*7), [weekOffset]);
  const weekDates  = useMemo(() => getWeekDates(weekAnchor), [weekAnchor]);
  const monthRef   = useMemo(() => new Date(TODAY.getFullYear(),TODAY.getMonth()+monthOffset,1), [monthOffset]);
  const monthDays  = useMemo(() => {
    const y=monthRef.getFullYear(), m=monthRef.getMonth();
    const first=new Date(y,m,1), last=new Date(y,m+1,0);
    const dow=(first.getDay()+6)%7, days=[];
    for (let i=0;i<dow;i++) days.push(null);
    for (let d=1;d<=last.getDate();d++) days.push(new Date(y,m,d));
    return days;
  }, [monthRef]);

  const checkedCount = PILLARS.filter(p=>pillarDone(p,viewData[p.id])).length;
  const nudge        = isToday ? buildNudge(data,viewKey,yKey) : null;
  const encourage    = isToday ? buildEncouragement(data) : null;
  const quote        = QUOTES[Math.floor(Date.now()/86400000) % QUOTES.length];
  const nowMonth     = new Date().getMonth();
  const glasses      = viewData.water?.glasses||0;
  const walkMins     = parseInt(viewData.movement?.minutes)||0;
  const rawN         = viewData.nourishment?.nutrition||{};
  const nutrition    = {
    fruits:    parseInt(rawN.fruits)||0,
    protein:   parseInt(rawN.protein)||0,
    whole:     parseInt(rawN.whole)||0,
    sugar:     rawN.sugar||"none",
    processed: rawN.processed||"none",
    caffeine:  rawN.caffeine||"none",
    slow:      !!rawN.slow,
  };
  const hasDayData = data[viewKey] && Object.keys(data[viewKey]).length>0;

  useEffect(() => { try { localStorage.setItem("rhythm-data",JSON.stringify(data)); } catch {} }, [data]);

  function toggle(pid) {
    if (!isToday) return;
    setData(prev=>({...prev,[viewKey]:{...prev[viewKey],[pid]:{...prev[viewKey]?.[pid],checked:!prev[viewKey]?.[pid]?.checked}}}));
  }
  function setNote(pid,val) {
    if (!isToday) return;
    setData(prev=>({...prev,[viewKey]:{...prev[viewKey],[pid]:{...prev[viewKey]?.[pid],note:val}}}));
  }
  function setMinutes(n) {
    if (!isToday) return;
    setData(prev=>({...prev,[viewKey]:{...prev[viewKey],movement:{...prev[viewKey]?.movement,minutes:Math.max(0,Math.min(240,n))}}}));
  }
  function setGlasses(n) {
    if (!isToday) return;
    setData(prev=>({...prev,[viewKey]:{...prev[viewKey],water:{...prev[viewKey]?.water,glasses:Math.max(0,Math.min(WATER_GOAL,n))}}}));
  }
  function setNutrition(field,val) {
    if (!isToday) return;
    setData(prev=>({...prev,[viewKey]:{...prev[viewKey],nourishment:{...prev[viewKey]?.nourishment,nutrition:{...prev[viewKey]?.nourishment?.nutrition,[field]:val}}}}));
  }
  function clearPillar(pid) {
    const p=PILLARS.find(p=>p.id===pid);
    let blank;
    if (p.isWater)           blank={glasses:0,note:""};
    else if (p.hasMinutes)   blank={minutes:0,note:""};
    else if (p.hasNutrition) blank={checked:false,note:"",nutrition:{fruits:0,protein:0,whole:0,sugar:"none",processed:"none",caffeine:"none",slow:false}};
    else                     blank={checked:false,note:""};
    setData(prev=>({...prev,[viewKey]:{...prev[viewKey],[pid]:blank}}));
    setConfirmClear(null);
  }
  function clearDay() {
    setData(prev=>({...prev,[viewKey]:{}}));
    setConfirmClear(null);
  }

  const greet = !isToday ? null
    : checkedCount === 0            ? "How is today unfolding?"
    : checkedCount < 4              ? "Every habit counts. Keep going."
    : checkedCount < EIGHTY_PCT     ? "More than halfway there. You are doing well."
    : checkedCount === TOTAL_PILLARS? "A perfect day. Soak it in. ✦"
    :                                 "You reached your 80 today. That is enough. ✦";

  const isCurrentMonth = monthOffset===0;
  const monthLabel = MONTHS_LONG[monthRef.getMonth()]+" "+monthRef.getFullYear();
  function jumpToDay(dt) { setView("today"); setDayOffset(Math.round((dt-TODAY)/86400000)); }

  return (
    <div style={{background:C.cream,minHeight:"100vh",color:C.ink}}>
      {confirmClear && <ConfirmModal target={confirmClear} onConfirm={()=>confirmClear==="day"?clearDay():clearPillar(confirmClear)} onCancel={()=>setConfirmClear(null)}/>}
      <div style={{maxWidth:460,margin:"0 auto",padding:"36px 20px 64px"}}>

        <div style={{marginBottom:20,paddingBottom:18,borderBottom:"1px solid "+C.parchDark}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
            <h1 style={{fontFamily:serif,fontSize:42,fontWeight:400,margin:0,letterSpacing:"-0.5px"}}>Rhythm</h1>
            <p style={{fontFamily:sans,fontSize:14,color:C.inkMid,margin:0,letterSpacing:"0.06em",textTransform:"uppercase"}}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</p>
          </div>
          <div style={{marginTop:14,paddingTop:14,borderTop:"1px dashed "+C.parchDark}}>
            <p style={{fontFamily:serif,fontStyle:"italic",fontSize:16,color:C.inkMid,lineHeight:1.7,margin:"0 0 5px"}}>"{quote.text}"</p>
            <p style={{fontFamily:sans,fontSize:13,color:C.inkLight,margin:0,letterSpacing:"0.05em",textTransform:"uppercase"}}>{quote.source}</p>
          </div>
        </div>

        <div style={{display:"flex",gap:24,marginBottom:24,borderBottom:"1px solid "+C.parchDark,paddingBottom:14}}>
          {[["today","Journal"],["week","This week"],["month","Month"]].map(([v,l])=>(
            <button key={v} onClick={()=>setView(v)} style={{background:"none",border:"none",cursor:"pointer",padding:"0 0 2px",fontFamily:serif,fontSize:20,color:view===v?C.sageDark:C.inkLight,borderBottom:view===v?"2px solid "+C.sage:"2px solid transparent",transition:"all .15s"}}>{l}</button>
          ))}
        </div>

        {view==="today" && (
          <>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <NavBtn onClick={()=>setDayOffset(d=>d-1)} label="Earlier" disabled={false}/>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:serif,fontSize:18,color:C.ink}}>{isToday?"Today":fmtDate(viewDate)}</div>
                {!isToday&&<button onClick={()=>setDayOffset(0)} style={{background:"none",border:"none",cursor:"pointer",fontFamily:sans,fontSize:13,color:C.inkMid,padding:"2px 0 0",textDecoration:"underline"}}>Back to today</button>}
              </div>
              <NavBtn onClick={()=>setDayOffset(d=>d+1)} label="Later" disabled={dayOffset>=0}/>
            </div>

            {hasDayData && (
              <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
                <button onClick={()=>setConfirmClear("day")} style={{background:"none",border:"none",cursor:"pointer",fontFamily:sans,fontSize:12,color:C.inkLight,textDecoration:"underline",padding:0}}>Clear this day</button>
              </div>
            )}

            {nudge && (
              <div style={{marginBottom:12,padding:"12px 16px",borderRadius:4,background:C.goldPale,borderLeft:"3px solid "+C.gold}}>
                <p style={{fontFamily:serif,fontStyle:"italic",fontSize:13,color:C.inkMid,lineHeight:1.7,margin:0}}>{nudge.text}</p>
                <p style={{fontFamily:sans,fontSize:12,color:C.gold,margin:"8px 0 0",letterSpacing:"0.05em",textTransform:"uppercase"}}>{nudge.pillar} · yesterday you had this one</p>
              </div>
            )}

            {encourage && (
              <div style={{marginBottom:12,padding:"12px 16px",borderRadius:4,background:"#EDF4EC",borderLeft:"3px solid "+C.sage}}>
                <p style={{fontFamily:serif,fontStyle:"italic",fontSize:13,color:C.inkMid,lineHeight:1.7,margin:0}}>{encourage.text}</p>
                <p style={{fontFamily:sans,fontSize:12,color:C.sageDark,margin:"8px 0 0",letterSpacing:"0.05em",textTransform:"uppercase"}}>{encourage.pillar} · {encourage.count} of the last 7 days</p>
              </div>
            )}

            {isToday && checkedCount >= EIGHTY_PCT && (
              <div style={{marginBottom:18,padding:"12px 16px",borderRadius:4,background:"#EDF4EC",borderLeft:"3px solid "+C.sageDark}}>
                <p style={{fontFamily:serif,fontStyle:"italic",fontSize:15,color:C.sageDark,lineHeight:1.7,margin:0}}>
                  {checkedCount === TOTAL_PILLARS ? "A truly full day. Every pillar tended to. ✦" : "You reached your 80 today. That is enough. ✦"}
                </p>
              </div>
            )}

            {isToday && checkedCount < EIGHTY_PCT && <p style={{fontFamily:serif,fontSize:19,color:C.inkMid,marginBottom:20,marginTop:0,fontStyle:"italic"}}>{greet}</p>}
            {!isToday && <p style={{fontFamily:serif,fontSize:16,color:C.inkMid,marginBottom:16,marginTop:0,fontStyle:"italic"}}>{fmtDate(viewDate)} -- a past entry, read only.</p>}

            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {PILLARS.map(p => {
                const st   = viewData[p.id];
                const on   = pillarDone(p,st);
                const open = expanded===p.id;

                if (p.isWater) return (
                  <div key={p.id} style={{borderRadius:4,border:"1px solid "+(glasses>0?C.dustBluePale:C.parchDark),background:glasses>=WATER_GOAL?"#EAF3F7":C.parchment,overflow:"hidden"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px 10px"}}>
                      <div>
                        <div style={{fontFamily:serif,fontSize:19,color:glasses>=WATER_GOAL?C.sageDark:C.ink}}>Water</div>
                        <div style={{fontFamily:sans,fontSize:14,color:C.inkMid,marginTop:3}}>{glasses===0?"Tap a glass to log":glasses>=WATER_GOAL?"Well hydrated today":glasses+" of "+WATER_GOAL+" glasses"}</div>
                      </div>
                      {isToday && (
                        <div style={{display:"flex",gap:6,alignItems:"center"}}>
                          <button onClick={()=>setGlasses(glasses-1)} style={{background:"none",border:"1px solid "+C.parchDark,borderRadius:4,width:30,height:30,cursor:"pointer",fontSize:18,color:C.inkLight,lineHeight:"28px",textAlign:"center",padding:0}}>-</button>
                          <span style={{fontFamily:serif,fontSize:18,color:C.dustBlueDark,minWidth:22,textAlign:"center"}}>{glasses}</span>
                          <button onClick={()=>setGlasses(glasses+1)} style={{background:"none",border:"1px solid "+C.parchDark,borderRadius:4,width:30,height:30,cursor:"pointer",fontSize:18,color:C.inkLight,lineHeight:"28px",textAlign:"center",padding:0}}>+</button>
                        </div>
                      )}
                      {!isToday && <span style={{fontFamily:serif,fontSize:18,color:C.dustBlueDark}}>{glasses}</span>}
                    </div>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap",padding:"0 16px 14px"}}>
                      {Array.from({length:WATER_GOAL},(_,i)=>(
                        <button key={i} onClick={()=>isToday&&setGlasses(i<glasses?i:i+1)} style={{background:"none",border:"none",cursor:isToday?"pointer":"default",padding:0,transform:i<glasses?"translateY(-2px)":"none",transition:"transform .15s"}}>
                          <GlassIcon filled={i<glasses}/>
                        </button>
                      ))}
                    </div>
                    {isToday&&glasses>0&&<div style={{padding:"0 16px 14px"}}><ClearBtn onClear={()=>setConfirmClear("water")}/></div>}
                  </div>
                );

                if (p.hasNutrition) {
                  const nDone = pillarDone(p, st);
                  const parts = [
                    nutrition.fruits>0&&(nutrition.fruits+" fruit/veg"),
                    nutrition.slow&&"ate slowly",
                    nutrition.caffeine!=="none"&&("caffeine: "+nutrition.caffeine),
                    nutrition.sugar!=="none"&&("sugar: "+nutrition.sugar),
                  ].filter(Boolean);
                  const nSummary = parts.length>0 ? parts.join(" · ") : p.prompt;
                  return (
                    <div key={p.id} style={{borderRadius:4,border:"1px solid "+(nDone?C.sagePale:C.parchDark),background:nDone?"#EDF4EC":C.parchment,overflow:"hidden"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px"}}>
                        <div style={{flex:1}}>
                          <div style={{fontFamily:serif,fontSize:19,color:nDone?C.sageDark:C.ink}}>Nourishment</div>
                          <div style={{fontFamily:sans,fontSize:14,color:C.inkMid,marginTop:3}}>{nSummary}</div>
                        </div>
                        <button onClick={e=>{e.stopPropagation();setExpanded(open?null:p.id);}} style={{background:"none",border:"none",cursor:"pointer",padding:"0 4px",fontFamily:serif,fontSize:24,lineHeight:1,color:C.inkLight,flexShrink:0}}>{open?"-":"+"}</button>
                      </div>
                      {open && (
                        <div style={{padding:"12px 16px 14px",borderTop:"1px dashed "+C.parchDark}}>
                          <CountRow label="Fruits & vegetables" hint="aim for 5" value={nutrition.fruits} goal={5} onChange={v=>setNutrition("fruits",v)} readOnly={!isToday}/>
                          <CountRow label="Protein" hint="beans, eggs, meat, fish" value={nutrition.protein} goal={2} onChange={v=>setNutrition("protein",v)} readOnly={!isToday}/>
                          <CountRow label="Whole grains" hint="oats, rice, bread" value={nutrition.whole} goal={3} onChange={v=>setNutrition("whole",v)} readOnly={!isToday}/>
                          <div style={{height:1,background:C.parchDark,margin:"10px 0"}}/>
                          <FlagRow label="Added sugar" hint="sweets, syrups, sweet drinks" options={["none","a little","quite a bit"]} value={nutrition.sugar} onChange={v=>setNutrition("sugar",v)} readOnly={!isToday}/>
                          <FlagRow label="Processed food" hint="packaged, fast food" options={["none","some","a lot"]} value={nutrition.processed} onChange={v=>setNutrition("processed",v)} readOnly={!isToday}/>
                          <FlagRow label="Caffeine" hint="coffee, soda, energy drinks" options={["none","one or two","several"]} value={nutrition.caffeine} onChange={v=>setNutrition("caffeine",v)} readOnly={!isToday}/>
                          <div style={{height:1,background:C.parchDark,margin:"10px 0"}}/>
                          <BoolRow label="Ate slowly" hint="sat down, present, no rush" value={nutrition.slow} onChange={v=>setNutrition("slow",v)} readOnly={!isToday}/>
                          <div style={{marginTop:10}}>
                            <NoteField value={st?.note} onChange={e=>setNote(p.id,e.target.value)} onClick={e=>e.stopPropagation()}/>
                          </div>
                          {isToday&&<ClearBtn onClear={()=>setConfirmClear(p.id)}/>}
                        </div>
                      )}
                    </div>
                  );
                }

                if (p.hasMinutes) {
                  const mDone = walkMins >= WALK_GOAL;
                  const status = mDone ? "goal met" : walkMins>0 ? (WALK_GOAL-walkMins)+" to go" : "";
                  return (
                    <div key={p.id} style={{borderRadius:4,border:"1px solid "+(mDone?C.sagePale:C.parchDark),background:mDone?"#EDF4EC":C.parchment,overflow:"hidden"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px"}}>
                        <div style={{flex:1}}>
                          <div style={{fontFamily:serif,fontSize:19,color:mDone?C.sageDark:C.ink}}>Movement</div>
                          <div style={{fontFamily:sans,fontSize:14,color:C.inkMid,marginTop:3}}>{p.prompt}</div>
                        </div>
                        <button onClick={e=>{e.stopPropagation();setExpanded(open?null:p.id);}} style={{background:"none",border:"none",cursor:"pointer",padding:"0 4px",fontFamily:serif,fontSize:24,lineHeight:1,color:C.inkLight,flexShrink:0}}>{open?"-":"+"}</button>
                      </div>
                      <div style={{padding:"0 16px 14px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                          {isToday&&<button onClick={()=>setMinutes(walkMins-5)} style={{background:"none",border:"1px solid "+C.parchDark,borderRadius:4,width:28,height:28,cursor:"pointer",fontSize:16,color:C.inkLight,lineHeight:"26px",textAlign:"center",padding:0}}>-</button>}
                          <span style={{fontFamily:serif,fontSize:16,color:C.ink,minWidth:32,textAlign:"center"}}>{walkMins}</span>
                          {isToday&&<button onClick={()=>setMinutes(walkMins+5)} style={{background:"none",border:"1px solid "+C.parchDark,borderRadius:4,width:28,height:28,cursor:"pointer",fontSize:16,color:C.inkLight,lineHeight:"26px",textAlign:"center",padding:0}}>+</button>}
                          <span style={{fontFamily:sans,fontSize:13,color:C.inkMid}}>min</span>
                          {status&&<span style={{fontFamily:sans,fontSize:13,color:mDone?C.sageDark:C.inkLight}}>{status}</span>}
                        </div>
                        <div style={{height:6,borderRadius:3,background:C.parchDark,overflow:"hidden",marginBottom:open?12:0}}>
                          <div style={{height:"100%",borderRadius:3,width:Math.min(100,(walkMins/90)*100)+"%",background:walkMins>=90?C.sage:mDone?C.sagePale:C.gold,transition:"width .3s"}}/>
                        </div>
                        {open&&(
                          <div style={{marginTop:10}}>
                            <NoteField value={st?.note} onChange={e=>setNote(p.id,e.target.value)} onClick={e=>e.stopPropagation()}/>
                            {isToday&&<ClearBtn onClear={()=>setConfirmClear(p.id)}/>}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={p.id} style={{borderRadius:4,border:"1px solid "+(on?C.sagePale:C.parchDark),background:on?"#EDF4EC":C.parchment,overflow:"hidden"}}>
                    <div style={{display:"flex",alignItems:"center",padding:"14px 16px",gap:14,cursor:isToday?"pointer":"default"}} onClick={()=>toggle(p.id)}>
                      <CheckBox on={on}/>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:serif,fontSize:19,color:on?C.sageDark:C.ink}}>{p.label}</div>
                        <div style={{fontFamily:sans,fontSize:14,color:C.inkMid,marginTop:3}}>{p.prompt}</div>
                      </div>
                      <button onClick={e=>{e.stopPropagation();setExpanded(open?null:p.id);}} style={{background:"none",border:"none",cursor:"pointer",padding:"0 4px",fontFamily:serif,fontSize:24,lineHeight:1,color:C.inkLight,flexShrink:0}}>{open?"-":"+"}</button>
                    </div>
                    {open&&(
                      <div style={{padding:"0 16px 14px"}}>
                        <NoteField value={st?.note} onChange={e=>setNote(p.id,e.target.value)} onClick={e=>e.stopPropagation()}/>
                        {isToday&&<ClearBtn onClear={()=>setConfirmClear(p.id)}/>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {view==="week" && (
          <>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <NavBtn onClick={()=>setWeekOffset(w=>w-1)} label="Earlier" disabled={false}/>
              <div style={{fontFamily:serif,fontSize:14,color:C.ink,textAlign:"center"}}>
                {weekOffset===0?"This week":weekOffset===-1?"Last week":fmtShort(weekDates[0])+" - "+fmtShort(weekDates[6])}
              </div>
              <NavBtn onClick={()=>setWeekOffset(w=>w+1)} label="Later" disabled={weekOffset>=0}/>
            </div>
            <p style={{fontFamily:serif,fontSize:15,color:C.inkLight,fontStyle:"italic",margin:"0 0 14px"}}>Weekly warmth</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:5,marginBottom:10}}>
              {weekDates.map((dt,i)=>{
                const key=getDateKey(dt), score=dayScore(data,key), isTodayCell=key===getDateKey(TODAY);
                return (
                  <div key={i} style={{textAlign:"center"}}>
                    <div style={{fontFamily:sans,fontSize:11,color:C.inkLight,marginBottom:5,textTransform:"uppercase",letterSpacing:"0.05em"}}>{DAYS_SHORT[i]}</div>
                    <div onClick={()=>jumpToDay(dt)} style={{height:52,borderRadius:3,cursor:"pointer",background:warmthBg(score),border:(isTodayCell?"2":"1")+"px solid "+(isTodayCell?C.sage:C.parchDark),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:sans,fontSize:12,color:warmthFg(score),fontWeight:isTodayCell?600:400}}>
                      {score!==null?Math.round(score*100)+"%":"--"}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{display:"flex",gap:14,marginBottom:12,flexWrap:"wrap"}}>
              {[["#D4CFC8","Just starting"],["#F0E2B6","Building momentum"],["#E8C96A","Almost there"],["#D4A017","80% reached"]].map(([bg,l])=>(
                <div key={l} style={{display:"flex",alignItems:"center",gap:6,fontFamily:sans,fontSize:13,color:C.inkLight}}>
                  <div style={{width:12,height:12,borderRadius:2,background:bg,border:"1px solid "+C.parchDark}}/>
                  {l}
                </div>
              ))}
            </div>
            {(()=>{
              const at80 = weekDates.filter(dt => { const s=dayScore(data,getDateKey(dt)); return s!==null && s>=EIGHTY_PCT/TOTAL_PILLARS; }).length;
              return at80>0 ? (
                <p style={{fontFamily:serif,fontStyle:"italic",fontSize:14,color:C.inkMid,margin:"0 0 20px"}}>
                  {at80} of 7 days at 80% this week{at80>=5?" -- a strong week. ✦":at80>=3?" -- good momentum.":"."}
                </p>
              ) : null;
            })()}
            <div style={{borderTop:"1px solid "+C.parchDark,marginBottom:24}}/>
            <p style={{fontFamily:serif,fontSize:15,color:C.inkLight,fontStyle:"italic",margin:"0 0 16px"}}>By pillar</p>
            <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:32}}>
              {PILLARS.map(p=>{
                const dots=weekDates.map(dt=>{ const k=getDateKey(dt); if(!data[k]) return "empty"; return pillarDone(p,data[k][p.id])?"yes":"no"; });
                const cnt=dots.filter(d=>d==="yes").length;
                return (
                  <div key={p.id} style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:116,fontFamily:serif,fontSize:14,color:C.ink,flexShrink:0}}>{p.label}</div>
                    <div style={{display:"flex",gap:5,flex:1}}>
                      {dots.map((d,i)=>(
                        <div key={i} style={{width:24,height:24,borderRadius:3,background:d==="yes"?(p.isWater?C.dustBluePale:C.sage):d==="no"?C.parchment:"transparent",border:d==="empty"?"none":"1px solid "+(d==="yes"?(p.isWater?C.dustBlue:C.sageDark):C.parchDark)}}/>
                      ))}
                    </div>
                    <div style={{fontFamily:sans,fontSize:13,color:C.inkLight,width:28,textAlign:"right"}}>{cnt}/7</div>
                  </div>
                );
              })}
            </div>
            <SeasonalCard month={nowMonth}/>
          </>
        )}

        {view==="month" && (
          <>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <NavBtn onClick={()=>setMonthOffset(m=>m-1)} label="Earlier" disabled={false}/>
              <div style={{fontFamily:serif,fontSize:15,color:C.ink}}>{monthLabel}</div>
              <NavBtn onClick={()=>setMonthOffset(m=>m+1)} label="Later" disabled={isCurrentMonth}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:6}}>
              {DAYS_SHORT.map(d=>(
                <div key={d} style={{fontFamily:sans,fontSize:11,color:C.inkLight,textAlign:"center",textTransform:"uppercase",letterSpacing:"0.05em"}}>{d}</div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:28}}>
              {monthDays.map((dt,i)=>{
                if (!dt) return <div key={i}/>;
                const key=getDateKey(dt), score=dayScore(data,key), isTodayCell=key===getDateKey(TODAY), isFuture=dt>TODAY;
                return (
                  <div key={i} onClick={()=>{ if(!isFuture) jumpToDay(dt); }} style={{aspectRatio:"1",borderRadius:4,background:isFuture?C.cream:score===null?C.parchment:warmthBg(score),border:(isTodayCell?"2":"1")+"px solid "+(isTodayCell?C.sage:C.parchDark),display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:isFuture?"default":"pointer",opacity:isFuture?0.35:1}}>
                    <span style={{fontFamily:sans,fontSize:12,color:isFuture?C.inkLight:score!==null?warmthFg(score):C.inkLight,fontWeight:isTodayCell?700:400}}>{dt.getDate()}</span>
                    {score!==null&&!isFuture&&<span style={{fontFamily:sans,fontSize:10,color:warmthFg(score),opacity:0.85,marginTop:1}}>{Math.round(score*100)+"%"}</span>}
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
