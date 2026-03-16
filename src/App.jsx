import { useState, useMemo, useEffect } from "react";

const WATER_GOAL    = 8;
const WALK_GOAL     = 60;
const EIGHTY_PCT    = 7;
const TOTAL_PILLARS = 9;
const DAYS_SHORT    = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const MONTHS_LONG   = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const NUTRITION_BOOLS = [
  { id:"plants",    label:"Mostly plants",     hint:"Was your plate mostly plants today?" },
  { id:"homemade",  label:"Home-cooked meal",  hint:"Did you eat at least one home-cooked meal?" },
  { id:"satisfied", label:"Stopped when full", hint:"Did you stop eating when you felt satisfied?" },
];

const PILLARS = [
  { id:"movement",    label:"Movement",      prompt:"Did you move naturally today?",         hasMinutes:true },
  { id:"nourishment", label:"Nourishment",   prompt:"Did you eat something real and slow?",  hasNutrition:true },
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
  { text:"The people who live the longest do not try to live longer. They live fully.", source:"Blue Zones research" },
  { text:"Wherever you go, go with all your heart.", source:"Confucian proverb, Okinawa" },
  { text:"An early morning walk is a blessing for the whole day.", source:"Henry David Thoreau, c. 1850" },
  { text:"In seed time learn, in harvest teach, in winter enjoy.", source:"William Blake, c. 1790" },
  { text:"The cure for anything is salt water: sweat, tears, or the sea.", source:"Isak Dinesen, c. 1934" },
  { text:"Let food be thy medicine and medicine be thy food.", source:"Hippocrates" },
  { text:"She resolved to be the maker of her own happiness.", source:"Louisa May Alcott, Little Women" },
  { text:"Drink your tea slowly and reverently, as if it is the axis on which the whole earth revolves.", source:"Thich Nhat Hanh" },
  { text:"A gentle walk among old trees is worth more than an hour in any doctor's office.", source:"Edwardian naturalist, c. 1907" },
  { text:"The greatest wealth is health.", source:"Virgil" },
  { text:"She was not made for sitting still.", source:"Louisa May Alcott, Little Women" },
  { text:"Good friends, good books, and a sleepy conscience. That is the ideal life.", source:"Mark Twain, c. 1898" },
  { text:"Sleep is the golden chain that ties health and our bodies together.", source:"Thomas Dekker, c. 1609" },
  { text:"In Okinawa, they say the reason they live so long is that they never retire from life.", source:"Blue Zones research" },
  { text:"I took a walk in the woods and came out taller than the trees.", source:"Henry David Thoreau" },
  { text:"One cannot think well, love well, sleep well, if one has not dined well.", source:"Virginia Woolf, c. 1929" },
  { text:"Marmee always said that a good laugh and a long sleep are the two best cures.", source:"Louisa May Alcott, Little Women" },
  { text:"She did not know yet what she was capable of. That was the most exciting part.", source:"Louisa May Alcott, Little Women" },
  { text:"Real kindness is doing a little thing well, and doing it every day.", source:"Marmee, Little Women" },
  { text:"Have regular hours for work and play. Make each day both useful and pleasant.", source:"Marmee, Little Women" },
  { text:"A garden, a walk, a book, a friend. That is a very good life.", source:"Edwardian domestic writing, c. 1906" },
  { text:"There is always light, if only we are brave enough to see it.", source:"Louisa May Alcott" },
];

const NUDGES = {
  movement:    ["Jo March would not have stayed inside on a day like this. The lane is waiting.", "The Edwardians considered a daily walk as essential as breakfast. It has been a few days.", "In Okinawa, movement is simply life. Your body is asking for a little of it today."],
  nourishment: ["The March table was always full of simple, real food. Try to get a fruit or vegetable in today.", "The Edwardians ate what was in season and avoided excess. More whole food, a little less packaged.", "In Blue Zones, the plate is mostly plants and the meal is unhurried. One small step today is enough."],
  water:       ["A glass of water first thing sets the tone for the whole day. Start there.", "The Edwardians drank water and weak tea steadily all day. Small sips, often.", "Your afternoon might feel quite different with a little more water in it."],
  air:         ["It has been a few days since you stepped outside. Even five minutes of fresh air will do.", "Edwardian doctors prescribed fresh air before almost anything else. The door is right there.", "In Okinawa, the outdoors is where life happens. Step into it today, even briefly."],
  rest:        ["A proper wind-down has been missing lately. Try setting everything down a little earlier tonight.", "The Edwardians kept strict hours. Work ended, and rest began. Give yourself that boundary tonight.", "Blue Zones elders sleep when it is dark. Your body is probably asking for the same."],
  connection:  ["It has been a little while since you reached out to someone. A short message is enough.", "The Edwardians built social life into every single day. Who could you check in with today?", "In Sardinia, no one eats alone if they can help it. Who have you been meaning to call?"],
  creative:    ["Your creative self has been quiet lately. Even ten minutes of something made is enough.", "The Edwardians believed purposeful leisure was as important as work. Make something small today.", "Jo wrote even on the hard days. Your hands and mind want a little of their own work."],
  joy:         ["Small joys have been a little scarce lately. What simple pleasure have you been walking past?", "The Edwardians made an art of small pleasures. Tea, a book, a walk. Find yours today.", "In Okinawa, delight is not chased. It is noticed. Look for one small thing today."],
  faith:       ["It has been a few days since you took time for your faith. Even a short prayer is enough.", "The Edwardian day began and ended with stillness. Take a moment to be present with God today.", "Marmee began each morning in quiet prayer. Your spiritual life is worth tending today, even briefly."],
};

const ENCOURAGEMENT = {
  movement:    ["Movement has been showing up in your days this week. The Edwardians would approve.", "You have been keeping yourself in motion. Jo March never sat still for long either.", "Walking has become part of your rhythm. In Okinawa, that is simply called living."],
  nourishment: ["You have been tending to your meals with care. Marmee would call that good housekeeping of the soul.", "Nourishment has been a priority lately. The Edwardians believed a well-fed body was a well-ordered life.", "Something is shifting in how you are feeding yourself. Blue Zones elders would recognize that shift."],
  water:       ["You have been drinking your water consistently. Simple, steady, good.", "Hydration has been a quiet win this week. The kind the Edwardians called good constitution.", "Water has been showing up in your days. In Okinawa, that is one of the first secrets they name."],
  air:         ["Fresh air has found its way into your week. The Edwardians considered this non-negotiable.", "You have been getting outside. Jo March spent every spare hour out of doors too.", "You stepped out into the world this week. In Blue Zones, the outdoors is where life is lived."],
  rest:        ["Rest has been part of your week. Beth always knew the value of a quiet evening.", "You have been winding down with intention. The Edwardians kept strict hours for exactly this reason.", "Rest is showing up in your rhythm. Blue Zones elders have always known it is not a luxury."],
  connection:  ["You have been showing up for the people in your life. The March family made that their whole practice.", "Connection has been a thread in your days. The Edwardians built entire lives around regular small gatherings.", "You have not been doing this alone. In Sardinia, that is considered the whole point."],
  creative:    ["Your creative work has been showing up. Jo never let a week pass without writing something.", "You have been making things. The Edwardians believed purposeful making was essential to a full life.", "Something creative has found its place in your week. In Blue Zones, work and making are not so different."],
  joy:         ["Small joys have been finding you this week. Amy March made an art of noticing them.", "You have been finding delight. The Edwardians considered this a discipline worth practicing daily.", "Joy has shown up in your days. In Okinawa, they call this the reason to get up in the morning."],
  faith:       ["Your faith has been a thread in your days. Marmee wove hers through everything she did.", "You have been showing up for your spiritual life. The Edwardians began and ended each day with that same intention.", "Connecting with God has been part of your rhythm. In Blue Zones, faith is one of the longest threads."],
};

const SEASONAL = [
  { season:"Winter", text:"January is a good month to tend your faith. Marmee began each new year with prayer and intention. What do you want to carry into this one?" },
  { season:"Winter", text:"February is for connection. The March girls wrote letters, paid visits, and gathered close. Who have you been meaning to reach out to?" },
  { season:"Spring", text:"March is for opening windows. Jo flung hers open every spring morning. If you can, put your hands in some soil and feel the season turning." },
  { season:"Spring", text:"April is for movement. The Edwardians cycled, walked, and played lawn games the moment the weather turned. Find your version of that and get outside." },
  { season:"Spring", text:"May is the month Blue Zones gardeners are most active. Movement as tending, not exercising. Eat something you grew, picked, or bought from someone who did." },
  { season:"Summer", text:"June is for nourishment. Blue Zones summers are built around fresh food eaten slowly with people you love. Eat the season fully this month." },
  { season:"Summer", text:"July is for water. More than you think, more than you track. Find your cool, quiet place and linger there." },
  { season:"Summer", text:"August is for creative work. Amy sketched all summer. Jo wrote. Beth played. The long light gives you time. Make something this month." },
  { season:"Autumn", text:"September brings the harvest. Root vegetables, squash, apples. Eat what the season offers freely. The air is crisp enough now for long walks." },
  { season:"Autumn", text:"October is for connection. In Sardinia, October means communal feasts and long evenings with family. Gather your people." },
  { season:"Autumn", text:"November is for faith. The days are short and the light is thin. Marmee always said November was the month to count your blessings out loud. What are yours?" },
  { season:"Winter", text:"December is for rest and reflection, yes, but also for joy. The March Christmas had very little and it was everything. What is enough for you?" },
];

const C = {
  cream:"#F8F6F1", parchment:"#EEEAE2", parchDark:"#CEC8BC",
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
    const pos = (n.plants?1:0)+(n.homemade?1:0)+(n.satisfied?1:0)+(n.slow?1:0);
    const neg = (n.sugar==="a little"?1:n.sugar==="quite a bit"?3:0)+(n.processed==="some"?1:n.processed==="a lot"?3:0)+(n.caffeine==="several"?1:0);
    return pos-neg >= 2;
  }
  return !!entry.checked;
}

function dayScore(data, key) {
  if (!data[key]) return null;
  return PILLARS.map(p=>pillarDone(p,data[key][p.id])?1:0).reduce((a,b)=>a+b,0)/TOTAL_PILLARS;
}

function buildNudge(data, todayKey, yKey) {
  const tE    = data[todayKey]||{};
  const yE    = data[yKey]||{};
  const y2Key = getDateKey(offsetDate(new Date(todayKey),-1));
  const y2E   = data[y2Key]||{};
  const neglected = PILLARS.filter(p=>
    !pillarDone(p,tE[p.id]) && !pillarDone(p,yE[p.id]) && !pillarDone(p,y2E[p.id])
  );
  if (!neglected.length) return null;
  const pick = neglected[Math.floor(Date.now()/86400000)%neglected.length];
  const pool = NUDGES[pick.id];
  if (!pool||!pool.length) return null;
  return { pillar:pick.label, text:pool[Math.floor(Date.now()/86400000)%pool.length] };
}

function buildEncouragement(data) {
  const past7 = Array.from({length:7},(_,i)=>{ const d=new Date(TODAY); d.setDate(TODAY.getDate()-i-1); return getDateKey(d); });
  const scored = PILLARS.map(p=>({ id:p.id, label:p.label, count:past7.filter(k=>data[k]&&pillarDone(p,data[k][p.id])).length }));
  const best = scored.reduce((a,b)=>b.count>a.count?b:a, scored[0]);
  if (best.count<3) return null;
  const pool = ENCOURAGEMENT[best.id];
  if (!pool||!pool.length) return null;
  return { pillar:best.label, count:best.count, text:pool[Math.floor(Date.now()/86400000)%pool.length] };
}

function buildNourishmentInsight(data) {
  const past7 = Array.from({length:7},(_,i)=>{ const d=new Date(TODAY); d.setDate(TODAY.getDate()-i-1); return getDateKey(d); });
  const entries = past7.map(k=>data[k]?.nourishment?.nutrition).filter(Boolean);
  if (entries.length < 2) return null;
  const count = entries.length;
  const threshold = Math.ceil(count*0.6);
  const plantsCount    = entries.filter(n=>n.plants).length;
  const homemadeCount  = entries.filter(n=>n.homemade).length;
  const satisfiedCount = entries.filter(n=>n.satisfied).length;
  const slowCount      = entries.filter(n=>n.slow).length;
  const sugarHigh      = entries.filter(n=>n.sugar==="quite a bit").length;
  const sugarSome      = entries.filter(n=>n.sugar==="a little").length;
  const processedHigh  = entries.filter(n=>n.processed==="a lot").length;
  const processedSome  = entries.filter(n=>n.processed==="some").length;
  const caffeineHigh   = entries.filter(n=>n.caffeine==="several").length;
  const wins = [];
  const concerns = [];
  if (plantsCount >= threshold)    wins.push("eating mostly plants");
  if (homemadeCount >= threshold)  wins.push("cooking at home");
  if (satisfiedCount >= threshold) wins.push("stopping when satisfied");
  if (slowCount >= threshold)      wins.push("eating slowly");
  if (sugarHigh >= 2)              concerns.push("quite a bit of added sugar");
  else if (sugarSome >= 3)         concerns.push("a little added sugar most days");
  if (processedHigh >= 2)          concerns.push("quite a bit of processed food");
  else if (processedSome >= 3)     concerns.push("some processed food most days");
  if (caffeineHigh >= 2)           concerns.push("several caffeinated drinks a day");
  if (!wins.length && !concerns.length) return null;
  if (wins.length && concerns.length) {
    return "You have been doing well with " + wins.join(" and ") + " this week. One thing worth noticing: " + concerns[0] + " has been showing up regularly. Today is a good day to ease up on that.";
  }
  if (wins.length) {
    return "Your nourishment has been on a good track this week, especially " + wins.join(" and ") + ". Keep it going.";
  }
  return "Something worth noticing in your eating this week: " + concerns.join(" and ") + ". No guilt, just an invitation to bring a little more balance today.";
}

function warmthBg(s) {
  if (s===null) return "#EEEAE2";
  if (s<0.3)                      return "#D4CFC8";
  if (s<0.55)                     return "#F0E2B6";
  if (s<EIGHTY_PCT/TOTAL_PILLARS) return "#E8C96A";
  return "#D4A017";
}
function warmthFg(s) {
  if (s===null) return "#747060";
  if (s<0.3)                      return "#3D3D30";
  if (s<0.55)                     return "#9A6E10";
  if (s<EIGHTY_PCT/TOTAL_PILLARS) return "#7A4E08";
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
      {on&&<svg width="12" height="12" viewBox="0 0 10 10"><path d="M1.5 5.5l2.5 2.5 5-5" stroke={C.cream} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
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

function FlagRow({ label, hint, options, value, onChange, readOnly }) {
  return (
    <div style={{marginBottom:14}}>
      <div style={{fontFamily:sans,fontSize:14,color:C.ink,marginBottom:7}}>{label} <span style={{color:C.inkLight,fontSize:13}}>- {hint}</span></div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {options.map(o=>{
          const sel=value===o, good=o===options[0];
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
      <span style={{fontFamily:sans,fontSize:14,color:C.ink,flex:1,paddingRight:12}}>{label} <span style={{color:C.inkLight,fontSize:13}}>{hint}</span></span>
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
      <p style={{fontFamily:sans,fontSize:12,color:C.inkLight,margin:"12px 0 0",letterSpacing:"0.05em",textTransform:"uppercase"}}>{s.season} - {MONTHS_LONG[month]}</p>
    </div>
  );
}

function MonthStats({ monthDays, data }) {
  const scores = monthDays.filter(d=>d&&d<=TODAY).map(d=>dayScore(data,getDateKey(d))).filter(s=>s!==null);
  const count  = scores.length;
  const avg    = count?Math.round(scores.reduce((a,b)=>a+b,0)/count*100):0;
  const best   = count?Math.round(Math.max(...scores)*100):0;
  const at80   = scores.filter(s=>s>=EIGHTY_PCT/TOTAL_PILLARS).length;
  const stats  = [
    { label:"Days logged",  val:count },
    { label:"Days at 80%+", val:at80 },
    { label:"Average",      val:count?avg+"%":"--" },
    { label:"Best day",     val:count?best+"%":"--" },
  ];
  return (
    <div style={{borderTop:"1px solid "+C.parchDark,paddingTop:20,marginBottom:24}}>
      <p style={{fontFamily:serif,fontSize:15,color:C.inkLight,fontStyle:"italic",margin:"0 0 14px"}}>This month at a glance</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {stats.map(item=>(
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
          {isDay?"Clear this whole day?":"Clear "+(pillar?pillar.label:"entry")+"?"}
        </p>
        <p style={{fontFamily:sans,fontSize:13,color:C.inkLight,margin:"0 0 24px",lineHeight:1.6}}>
          {isDay?"All entries for this day will be reset to blank.":"This pillar's data and notes will be reset to blank."}
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
  const [data,         setData]         = useState(()=>{ try { const s=localStorage.getItem("rhythm-data"); return s?JSON.parse(s):{}; } catch { return {}; } });
  const [expanded,     setExpanded]     = useState(null);
  const [dayOffset,    setDayOffset]    = useState(0);
  const [weekOffset,   setWeekOffset]   = useState(0);
  const [monthOffset,  setMonthOffset]  = useState(0);
  const [confirmClear, setConfirmClear] = useState(null);

  const viewDate   = useMemo(()=>offsetDate(TODAY,dayOffset),[dayOffset]);
  const viewKey    = getDateKey(viewDate);
  const isToday    = dayOffset===0;
  const yKey       = getDateKey(offsetDate(viewDate,-1));
  const viewData   = data[viewKey]||{};
  const weekAnchor = useMemo(()=>offsetDate(TODAY,weekOffset*7),[weekOffset]);
  const weekDates  = useMemo(()=>getWeekDates(weekAnchor),[weekAnchor]);
  const monthRef   = useMemo(()=>new Date(TODAY.getFullYear(),TODAY.getMonth()+monthOffset,1),[monthOffset]);
  const monthDays  = useMemo(()=>{
    const y=monthRef.getFullYear(),m=monthRef.getMonth();
    const first=new Date(y,m,1),last=new Date(y,m+1,0);
    const dow=(first.getDay()+6)%7,days=[];
    for(let i=0;i<dow;i++) days.push(null);
    for(let d=1;d<=last.getDate();d++) days.push(new Date(y,m,d));
    return days;
  },[monthRef]);

  const checkedCount       = PILLARS.filter(p=>pillarDone(p,viewData[p.id])).length;
  const nudge              = isToday?buildNudge(data,viewKey,yKey):null;
  const encourage          = isToday?buildEncouragement(data):null;
  const nourishmentInsight = isToday?buildNourishmentInsight(data):null;
  const quote              = QUOTES[Math.floor(Date.now()/86400000)%QUOTES.length];
  const nowMonth           = new Date().getMonth();
  const glasses            = viewData.water?.glasses||0;
  const walkMins           = parseInt(viewData.movement?.minutes)||0;
  const rawN               = viewData.nourishment?.nutrition||{};
  const nutrition          = {
    plants:    !!rawN.plants,
    homemade:  !!rawN.homemade,
    satisfied: !!rawN.satisfied,
    sugar:     rawN.sugar||"none",
    processed: rawN.processed||"none",
    caffeine:  rawN.caffeine||"none",
    slow:      !!rawN.slow,
  };
  const hasDayData = data[viewKey]&&Object.keys(data[viewKey]).length>0;

  useEffect(()=>{ try { localStorage.setItem("rhythm-data",JSON.stringify(data)); } catch {} },[data]);

  function toggle(pid) {
    if(!isToday) return;
    setData(prev=>({...prev,[viewKey]:{...prev[viewKey],[pid]:{...prev[viewKey]?.[pid],checked:!prev[viewKey]?.[pid]?.checked}}}));
  }
  function setNote(pid,val) {
    if(!isToday) return;
    setData(prev=>({...prev,[viewKey]:{...prev[viewKey],[pid]:{...prev[viewKey]?.[pid],note:val}}}));
  }
  function setMinutes(n) {
    if(!isToday) return;
    setData(prev=>({...prev,[viewKey]:{...prev[viewKey],movement:{...prev[viewKey]?.movement,minutes:Math.max(0,Math.min(240,n))}}}));
  }
  function setGlasses(n) {
    if(!isToday) return;
    setData(prev=>({...prev,[viewKey]:{...prev[viewKey],water:{...prev[viewKey]?.water,glasses:Math.max(0,Math.min(WATER_GOAL,n))}}}));
  }
  function setNutrition(field,val) {
    if(!isToday) return;
    setData(prev=>({...prev,[viewKey]:{...prev[viewKey],nourishment:{...prev[viewKey]?.nourishment,nutrition:{...prev[viewKey]?.nourishment?.nutrition,[field]:val}}}}));
  }
  function clearPillar(pid) {
    const p=PILLARS.find(p=>p.id===pid);
    let blank;
    if(p.isWater)           blank={glasses:0,note:""};
    else if(p.hasMinutes)   blank={minutes:0,note:""};
    else if(p.hasNutrition) blank={checked:false,note:"",nutrition:{plants:false,homemade:false,satisfied:false,sugar:"none",processed:"none",caffeine:"none",slow:false}};
    else                    blank={checked:false,note:""};
    setData(prev=>({...prev,[viewKey]:{...prev[viewKey],[pid]:blank}}));
    setConfirmClear(null);
  }
  function clearDay() {
    setData(prev=>({...prev,[viewKey]:{}}));
    setConfirmClear(null);
  }

  const greet = !isToday?null
    :checkedCount===0             ?"How is today unfolding?"
    :checkedCount<4               ?"Every habit counts. Keep going."
    :checkedCount<EIGHTY_PCT      ?"More than halfway there. You are doing well."
    :checkedCount===TOTAL_PILLARS ?"A perfect day. Soak it in. ✦"
    :                              "You reached your 80 today. That is enough. ✦";

  const isCurrentMonth = monthOffset===0;
  const monthLabel     = MONTHS_LONG[monthRef.getMonth()]+" "+monthRef.getFullYear();
  function jumpToDay(dt) { setView("today"); setDayOffset(Math.round((dt-TODAY)/86400000)); }

  return (
    <div style={{background:C.cream,minHeight:"100vh",color:C.ink}}>
      {confirmClear&&<ConfirmModal target={confirmClear} onConfirm={()=>confirmClear==="day"?clearDay():clearPillar(confirmClear)} onCancel={()=>setConfirmClear(null)}/>}
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
          {[["today","Journal"],["week","This week"],["month","Month"],["why","Why"]].map(([v,l])=>(
            <button key={v} onClick={()=>setView(v)} style={{background:"none",border:"none",cursor:"pointer",padding:"0 0 2px",fontFamily:serif,fontSize:20,color:view===v?C.sageDark:C.inkLight,borderBottom:view===v?"2px solid "+C.sage:"2px solid transparent",transition:"all .15s"}}>{l}</button>
          ))}
        </div>

        {view==="today"&&(
          <>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <NavBtn onClick={()=>setDayOffset(d=>d-1)} label="Earlier" disabled={false}/>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:serif,fontSize:18,color:C.ink}}>{isToday?"Today":fmtDate(viewDate)}</div>
                {!isToday&&<button onClick={()=>setDayOffset(0)} style={{background:"none",border:"none",cursor:"pointer",fontFamily:sans,fontSize:13,color:C.inkMid,padding:"2px 0 0",textDecoration:"underline"}}>Back to today</button>}
              </div>
              <NavBtn onClick={()=>setDayOffset(d=>d+1)} label="Later" disabled={dayOffset>=0}/>
            </div>

            {hasDayData&&(
              <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
                <button onClick={()=>setConfirmClear("day")} style={{background:"none",border:"none",cursor:"pointer",fontFamily:sans,fontSize:12,color:C.inkLight,textDecoration:"underline",padding:0}}>Clear this day</button>
              </div>
            )}

            {nudge&&nudge.pillar!=="Nourishment"&&(
              <div style={{marginBottom:12,padding:"12px 16px",borderRadius:4,background:C.goldPale,borderLeft:"3px solid "+C.gold}}>
                <p style={{fontFamily:serif,fontStyle:"italic",fontSize:13,color:C.inkMid,lineHeight:1.7,margin:0}}>{nudge.text}</p>
                <p style={{fontFamily:sans,fontSize:12,color:C.gold,margin:"8px 0 0",letterSpacing:"0.05em",textTransform:"uppercase"}}>{nudge.pillar} - has not shown up in a few days</p>
              </div>
            )}

            {nourishmentInsight&&(
              <div style={{marginBottom:12,padding:"12px 16px",borderRadius:4,background:C.goldPale,borderLeft:"3px solid "+C.gold}}>
                <p style={{fontFamily:serif,fontStyle:"italic",fontSize:13,color:C.inkMid,lineHeight:1.7,margin:0}}>{nourishmentInsight}</p>
                <p style={{fontFamily:sans,fontSize:12,color:C.gold,margin:"8px 0 0",letterSpacing:"0.05em",textTransform:"uppercase"}}>Nourishment - this week's pattern</p>
              </div>
            )}

            {encourage&&encourage.pillar!=="Nourishment"&&(
              <div style={{marginBottom:12,padding:"12px 16px",borderRadius:4,background:"#EDF4EC",borderLeft:"3px solid "+C.sage}}>
                <p style={{fontFamily:serif,fontStyle:"italic",fontSize:13,color:C.inkMid,lineHeight:1.7,margin:0}}>{encourage.text}</p>
                <p style={{fontFamily:sans,fontSize:12,color:C.sageDark,margin:"8px 0 0",letterSpacing:"0.05em",textTransform:"uppercase"}}>{encourage.pillar} - {encourage.count} of the last 7 days</p>
              </div>
            )}

            {isToday&&checkedCount>=EIGHTY_PCT&&(
              <div style={{marginBottom:18,padding:"12px 16px",borderRadius:4,background:"#EDF4EC",borderLeft:"3px solid "+C.sageDark}}>
                <p style={{fontFamily:serif,fontStyle:"italic",fontSize:15,color:C.sageDark,lineHeight:1.7,margin:0}}>
                  {checkedCount===TOTAL_PILLARS?"A truly full day. Every pillar tended to. ✦":"You reached your 80 today. That is enough. ✦"}
                </p>
              </div>
            )}

            {isToday&&checkedCount<EIGHTY_PCT&&(
              <p style={{fontFamily:serif,fontSize:19,color:C.inkMid,marginBottom:20,marginTop:0,fontStyle:"italic"}}>{greet}</p>
            )}
            {!isToday&&(
              <p style={{fontFamily:serif,fontSize:16,color:C.inkMid,marginBottom:16,marginTop:0,fontStyle:"italic"}}>{fmtDate(viewDate)} - a past entry, read only.</p>
            )}

            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {PILLARS.map(p=>{
                const st=viewData[p.id], on=pillarDone(p,st), open=expanded===p.id;

                if(p.isWater) return(
                  <div key={p.id} style={{borderRadius:4,border:"1px solid "+(glasses>0?C.dustBluePale:C.parchDark),background:glasses>=WATER_GOAL?"#EAF3F7":C.parchment,overflow:"hidden"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px 10px"}}>
                      <div>
                        <div style={{fontFamily:serif,fontSize:19,color:glasses>=WATER_GOAL?C.sageDark:C.ink}}>Water</div>
                        <div style={{fontFamily:sans,fontSize:14,color:C.inkMid,marginTop:3}}>{glasses===0?"Tap a glass to log":glasses>=WATER_GOAL?"Well hydrated today":glasses+" of "+WATER_GOAL+" glasses"}</div>
                      </div>
                      {isToday&&(
                        <div style={{display:"flex",gap:6,alignItems:"center"}}>
                          <button onClick={()=>setGlasses(glasses-1)} style={{background:"none",border:"1px solid "+C.parchDark,borderRadius:4,width:30,height:30,cursor:"pointer",fontSize:18,color:C.inkLight,lineHeight:"28px",textAlign:"center",padding:0}}>-</button>
                          <span style={{fontFamily:serif,fontSize:18,color:C.dustBlueDark,minWidth:22,textAlign:"center"}}>{glasses}</span>
                          <button onClick={()=>setGlasses(glasses+1)} style={{background:"none",border:"1px solid "+C.parchDark,borderRadius:4,width:30,height:30,cursor:"pointer",fontSize:18,color:C.inkLight,lineHeight:"28px",textAlign:"center",padding:0}}>+</button>
                        </div>
                      )}
                      {!isToday&&<span style={{fontFamily:serif,fontSize:18,color:C.dustBlueDark}}>{glasses}</span>}
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

                if(p.hasNutrition) {
                  const nDone = pillarDone(p,st);
                  const parts = [
                    nutrition.plants&&"mostly plants",
                    nutrition.homemade&&"home-cooked",
                    nutrition.satisfied&&"stopped when full",
                    nutrition.slow&&"ate slowly",
                    nutrition.caffeine!=="none"&&("caffeine: "+nutrition.caffeine),
                    nutrition.sugar!=="none"&&("sugar: "+nutrition.sugar),
                  ].filter(Boolean);
                  const nSummary = parts.length>0?parts.join(" · "):p.prompt;
                  return(
                    <div key={p.id} style={{borderRadius:4,border:"1px solid "+(nDone?C.sagePale:C.parchDark),background:nDone?"#EDF4EC":C.parchment,overflow:"hidden"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px"}}>
                        <div style={{flex:1}}>
                          <div style={{fontFamily:serif,fontSize:19,color:nDone?C.sageDark:C.ink}}>Nourishment</div>
                          <div style={{fontFamily:sans,fontSize:14,color:C.inkMid,marginTop:3}}>{nSummary}</div>
                        </div>
                        <button onClick={e=>{e.stopPropagation();setExpanded(open?null:p.id);}} style={{background:"none",border:"none",cursor:"pointer",padding:"0 4px",fontFamily:serif,fontSize:24,lineHeight:1,color:C.inkLight,flexShrink:0}}>{open?"-":"+"}</button>
                      </div>
                      {open&&(
                        <div style={{padding:"12px 16px 14px",borderTop:"1px dashed "+C.parchDark}}>
                          {NUTRITION_BOOLS.map(nb=>(
                            <BoolRow key={nb.id} label={nb.label} hint={nb.hint} value={!!nutrition[nb.id]} onChange={v=>setNutrition(nb.id,v)} readOnly={!isToday}/>
                          ))}
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

                if(p.hasMinutes) {
                  const mDone = walkMins>=WALK_GOAL;
                  const status = mDone?"goal met":walkMins>0?(WALK_GOAL-walkMins)+" to go":"";
                  return(
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

                return(
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

        {view==="week"&&(
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
                const key=getDateKey(dt),score=dayScore(data,key),isTodayCell=key===getDateKey(TODAY);
                return(
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
              const at80=weekDates.filter(dt=>{ const s=dayScore(data,getDateKey(dt)); return s!==null&&s>=EIGHTY_PCT/TOTAL_PILLARS; }).length;
              return at80>0?(
                <p style={{fontFamily:serif,fontStyle:"italic",fontSize:14,color:C.inkMid,margin:"0 0 20px"}}>
                  {at80} of 7 days at 80% this week{at80>=5?" - a strong week. ✦":at80>=3?" - good momentum.":"."}
                </p>
              ):null;
            })()}
            <div style={{borderTop:"1px solid "+C.parchDark,marginBottom:24}}/>
            <p style={{fontFamily:serif,fontSize:15,color:C.inkLight,fontStyle:"italic",margin:"0 0 16px"}}>By pillar</p>
            <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:32}}>
              {PILLARS.map(p=>{
                const dots=weekDates.map(dt=>{ const k=getDateKey(dt); if(!data[k]) return "empty"; return pillarDone(p,data[k][p.id])?"yes":"no"; });
                const cnt=dots.filter(d=>d==="yes").length;
                return(
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

        {view==="why"&&(
          <div style={{display:"flex",flexDirection:"column",gap:32}}>

            <div>
              <h2 style={{fontFamily:serif,fontSize:24,fontWeight:400,color:C.ink,margin:"0 0 12px"}}>The idea behind Rhythm</h2>
              <p style={{fontFamily:sans,fontSize:15,color:C.inkMid,lineHeight:1.8,margin:0}}>
                Rhythm is not a diet app. It does not count calories, track macros, or reward streaks. It is a daily practice, a quiet check-in with the parts of life that matter most for long-term health and happiness. The habits it tracks are drawn from three sources: communities where people live the longest and report the highest wellbeing, a historical era known for structured and purposeful daily living, and a beloved work of fiction that has always understood what a well-tended life looks like. The goal is not perfection. It is rhythm.
              </p>
            </div>

            <div style={{height:1,background:C.parchDark}}/>

            <div>
              <h2 style={{fontFamily:serif,fontSize:24,fontWeight:400,color:C.ink,margin:"0 0 20px"}}>Your three inspirations</h2>

              <div style={{marginBottom:24,padding:"18px 20px",borderRadius:4,background:C.parchment,borderLeft:"3px solid "+C.sage}}>
                <h3 style={{fontFamily:serif,fontSize:18,fontWeight:400,color:C.sageDark,margin:"0 0 10px"}}>Blue Zones</h3>
                <p style={{fontFamily:sans,fontSize:14,color:C.inkMid,lineHeight:1.8,margin:0}}>
                  Blue Zones are five regions of the world where people consistently live past 100 in good health: Okinawa in Japan, Sardinia in Italy, Nicoya in Costa Rica, Ikaria in Greece, and Loma Linda in California. Researcher Dan Buettner spent years studying what they share. The answer was not a diet plan or an exercise regimen. It was a way of life. They move naturally throughout the day. They eat mostly plants, stop before they are full, and share meals with others. They have a strong sense of purpose, a close community, and a faith or spiritual practice. They do not try to live longer. They simply live well, and longevity follows.
                </p>
              </div>

              <div style={{marginBottom:24,padding:"18px 20px",borderRadius:4,background:C.parchment,borderLeft:"3px solid "+C.gold}}>
                <h3 style={{fontFamily:serif,fontSize:18,fontWeight:400,color:C.inkMid,margin:"0 0 10px"}}>Edwardian England</h3>
                <p style={{fontFamily:sans,fontSize:14,color:C.inkMid,lineHeight:1.8,margin:0}}>
                  The Edwardian era, roughly 1901 to 1910, is often remembered for its elegance and structure. But underneath the formality was a remarkably healthy way of living. People walked everywhere. Fresh air was considered essential medicine. Days had clear rhythms: regular mealtimes, structured work, purposeful leisure. The culture valued making things, reading, visiting friends, playing sport, and spending time outdoors in all weathers. Processed food barely existed. Meals were simple and seasonal. The Edwardians did not know they were practicing wellness. It was simply how life was organized. That structure, stripped of its class constraints, still holds up remarkably well today.
                </p>
              </div>

              <div style={{padding:"18px 20px",borderRadius:4,background:C.parchment,borderLeft:"3px solid "+C.dustBlue}}>
                <h3 style={{fontFamily:serif,fontSize:18,fontWeight:400,color:C.dustBlueDark,margin:"0 0 10px"}}>Little Women</h3>
                <p style={{fontFamily:sans,fontSize:14,color:C.inkMid,lineHeight:1.8,margin:0}}>
                  Louisa May Alcott published Little Women in 1868, and it has never been out of print. It belongs here not as a wellness manual but as a portrait of a life well-lived on very little. The March family is poor, but their days are full. They read, write, play music, sew, cook, go outdoors, gather in the evenings, argue, laugh, and look after each other. Marmee is the quiet center of it all: a woman of deep faith, practical wisdom, and extraordinary warmth. She teaches her daughters not to chase happiness but to build it through small, consistent acts of goodness. That is the spirit this app tries to carry. Wellness is not an achievement. It is a practice.
                </p>
              </div>
            </div>

            <div style={{height:1,background:C.parchDark}}/>

            <div>
              <h2 style={{fontFamily:serif,fontSize:24,fontWeight:400,color:C.ink,margin:"0 0 12px"}}>The 80% principle</h2>
              <p style={{fontFamily:sans,fontSize:15,color:C.inkMid,lineHeight:1.8,margin:"0 0 12px"}}>
                In Okinawa, people say a phrase before every meal: hara hachi bu. It means eat until you are eight parts full. Stop at 80%, and let the remaining 20% go. It is one of the most well-studied habits in longevity research, and it works not because of calorie restriction but because of the discipline of knowing when enough is enough.
              </p>
              <p style={{fontFamily:sans,fontSize:15,color:C.inkMid,lineHeight:1.8,margin:0}}>
                Rhythm applies the same principle to your whole day. Hitting 7 out of 9 pillars, your 80%, is a genuinely good day. You do not need to do everything perfectly. You need to do most things consistently. Perfection is fragile. It breaks under pressure and creates guilt. Consistency is sturdy. It builds slowly and compounds over time. A day at 80% every day for a year is a transformed life. That is what this app is for.
              </p>
            </div>

            <div style={{height:1,background:C.parchDark}}/>

            <div>
              <h2 style={{fontFamily:serif,fontSize:24,fontWeight:400,color:C.ink,margin:"0 0 20px"}}>Your nine pillars</h2>
              {[
                { label:"Movement", text:"In every Blue Zone, people do not go to the gym. They move naturally: walking to the market, tending gardens, climbing stairs, working with their hands. The Edwardians walked everywhere and spent their leisure time in active pursuits. The March girls were always outdoors. This pillar is not about exercise. It is about keeping your body in motion as a natural part of your day. The walk goal of 60 minutes reflects research showing that daily walking of that duration is one of the strongest single predictors of longevity." },
                { label:"Nourishment", text:"Blue Zones diets are not identical, but they share a common shape: mostly plants, very little processed food, eaten slowly and with others. The Edwardians ate simply and seasonally. The March family cooked everything from scratch. This pillar asks not whether you hit a calorie target but whether your relationship with food is one of care and intention. The nourishment trackers reflect the habits that matter most: eating mostly plants, cooking at home, and stopping when satisfied." },
                { label:"Water", text:"Hydration is quietly one of the most impactful daily habits, affecting energy, digestion, mood, and cognitive function. Blue Zones residents drink water, herbal teas, and in some regions moderate amounts of wine with meals. The Edwardians drank steadily throughout the day. The goal of eight glasses is not a magic number, but it is a reliable target for most adults." },
                { label:"Fresh air", text:"Edwardian doctors prescribed fresh air before almost anything else. Blue Zones communities live largely outdoors. The March girls went out in all weathers. Time outdoors reduces cortisol, improves sleep, boosts mood, and supports immune function. Even five minutes outside counts. The goal is simply to step into the world every day, whatever the weather." },
                { label:"Rest", text:"Blue Zones elders sleep when it is dark and rise when it is light. They also build downshift rituals into their days, quiet moments that reduce stress and allow the nervous system to recover. The Edwardians kept strict hours: work ended, rest began. Beth March always knew when to put the work down and be still. Rest is not laziness. It is the foundation on which every other habit stands." },
                { label:"Connection", text:"Social connection is one of the strongest predictors of longevity in Blue Zones research. Sardinians gather in the village square every evening. Okinawans belong to moais, small social groups that meet for life. The Edwardians built visiting, correspondence, and gathering into every week. The March family made connection their whole practice. Loneliness is as harmful to health as smoking. Belonging is medicine." },
                { label:"Creative work", text:"The Edwardians believed purposeful leisure was as important as productive work. Jo March wrote every day, even on hard days. Blue Zones residents work with their hands, tend gardens, and make things. Creative work engages the mind differently from passive consumption, builds a sense of agency and identity, and is consistently associated with wellbeing and life satisfaction. Even ten minutes of something made is worth logging." },
                { label:"Small joy", text:"Amy March found beauty in the smallest corners of every day. In Okinawa, they speak of ikigai, a reason to get up in the morning, as central to their longevity. The Edwardians made an art of small pleasures: tea, flowers, a walk, a good book. This pillar asks you to notice one thing each day that delighted you. Over time, the practice of noticing joy creates more of it." },
                { label:"Faith", text:"Every Blue Zone has a strong culture of faith or spiritual practice. Loma Linda is a Seventh-day Adventist community. Sardinians are deeply Catholic. Ikarians are Greek Orthodox. The research is consistent: people with a regular spiritual practice live longer, report higher wellbeing, and handle stress more effectively. Marmee wove her faith through everything she did. This pillar simply asks whether you made space for God today." },
              ].map(item=>(
                <div key={item.label} style={{marginBottom:20,paddingBottom:20,borderBottom:"1px solid "+C.parchDark}}>
                  <h3 style={{fontFamily:serif,fontSize:18,fontWeight:400,color:C.ink,margin:"0 0 8px"}}>{item.label}</h3>
                  <p style={{fontFamily:sans,fontSize:14,color:C.inkMid,lineHeight:1.8,margin:0}}>{item.text}</p>
                </div>
              ))}
            </div>

          </div>
        )}

        {view==="month"&&(
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
                if(!dt) return <div key={i}/>;
                const key=getDateKey(dt),score=dayScore(data,key),isTodayCell=key===getDateKey(TODAY),isFuture=dt>TODAY;
                return(
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
