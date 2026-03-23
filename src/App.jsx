import { useState, useMemo, useEffect, useRef } from "react";

const WATER_GOAL    = 64;
const WALK_GOAL     = 60;
const EIGHTY_PCT    = 8;
const TOTAL_PILLARS = 10;
const DAYS_SHORT    = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS_LONG   = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const FAITH_BOOLS = [
  { id:"morningPrayer", label:"Morning prayer",        hint:"Did you pray before starting your day?" },
  { id:"scripture",     label:"Study the word of God", hint:"Did you study the scriptures?" },
  { id:"ponder",        label:"Ponder and reflect",    hint:"Did you take time to ponder and reflect?" },
  { id:"nightPrayer",   label:"Evening prayer",        hint:"Did you pray before going to bed?" },
];

const NUTRITION_BOOLS = [
  { id:"plants",    label:"Fruits and vegetables", hint:"Did you eat at least 3 servings today?" },
  { id:"homemade",  label:"Home-cooked meal",      hint:"Did you eat at least one home-cooked meal?" },
  { id:"satisfied", label:"Stopped when full",     hint:"Did you stop eating when you felt satisfied?" },
];

const PILLARS = [
  { id:"faith",       label:"Faith",                prompt:"Did you connect with Heavenly Father and Jesus Christ?", hasFaith:true },
  { id:"movement",    label:"Movement & Fresh Air", prompt:"Did you move your body and spend time outside?",         hasMinutes:true },
  { id:"nourishment", label:"Nourishment",          prompt:"Did you nourish your body with intention?",              hasNutrition:true },
  { id:"water",       label:"Water",                isWater:true },
  { id:"connection",  label:"Connection",           prompt:"Did you connect with someone in a meaningful way?" },
  { id:"service",     label:"Service",              prompt:"Did you make someone's day better?" },
  { id:"stewardship", label:"Stewardship",          prompt:"Did you tend to something in your care?" },
  { id:"creative",    label:"Creative Work",        prompt:"Did you engage in creativity that fuels you, not drains you?" },
  { id:"joy",         label:"Joy & Hygge",          prompt:"Did you enjoy a moment of warmth and delight?" },
  { id:"rest",        label:"Rest",                 prompt:"Did you wind down intentionally?" },
];

const QUOTES = [
  { text:"The secret of health for both mind and body is not to mourn for the past, nor to worry about the future, but to live the present moment wisely.", source:"Buddhist proverb, Okinawa" },
  { text:"I am not afraid of storms, for I am learning how to sail my ship.", source:"Louisa May Alcott, Little Women" },
  { text:"Take long walks in stormy weather or through deep snow in the fields and woods, if you would keep your spirits up.", source:"Edwardian walking guide, c. 1905" },
  { text:"It is not how much we have, but how much we enjoy, that makes happiness.", source:"Blue Zones wisdom" },
  { text:"She had a gift for making the most of small pleasures.", source:"Louisa May Alcott, Little Women" },
  { text:"Eat until you are eight parts full, and let the other two parts nourish your soul.", source:"Hara hachi bu, Okinawa" },
  { text:"There is no bad weather, only bad clothing.", source:"Norwegian proverb" },
  { text:"Belonging to a community is one of the most powerful medicines we have.", source:"Blue Zones research" },
  { text:"The best rooms are those in which one has laughed, cried, and lingered over tea.", source:"Edwardian domestic writing, c. 1908" },
  { text:"Family is the cornerstone of a long life well-lived.", source:"Blue Zones, Sardinia" },
  { text:"I want to do something splendid before I go into my castle, something heroic or wonderful.", source:"Louisa May Alcott, Little Women" },
  { text:"Move, eat, sleep, repeat. But do each one as if it were the only thing.", source:"Sardinian proverb" },
  { text:"She is too fond of books, and it has turned her brain.", source:"Louisa May Alcott, worn as a badge of honor" },
  { text:"To keep the body in good health is a duty, otherwise we shall not be able to keep our mind strong and clear.", source:"Buddhist proverb" },
  { text:"Hygge is not about things. It is about togetherness, presence, and the pleasure of simple moments.", source:"Danish proverb" },
  { text:"Walking is a man's best medicine.", source:"Hippocrates" },
  { text:"The people who live the longest do not try to live longer. They live fully.", source:"Blue Zones research" },
  { text:"Friluftsliv is not a hobby. It is a way of being in the world.", source:"Norwegian tradition" },
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
  { text:"Lagom is not settling for less. It is knowing that enough is exactly right.", source:"Swedish proverb" },
  { text:"The Nordic secret is simple: go outside, come back in, light something warm, and be with someone you love.", source:"Scandinavian folk wisdom" },
  { text:"Nature is not a place to visit. It is home.", source:"Gary Snyder, reflecting friluftsliv" },
  { text:"A cup of tea shared is worth more than a feast eaten alone.", source:"Danish saying" },
  { text:"Sunshine is delicious, rain is refreshing, wind braces us up. There is really no such thing as bad weather.", source:"John Ruskin, c. 1870" },
  { text:"The body needs movement the way the mind needs stillness.", source:"Scandinavian folk wisdom" },
  { text:"To find joy in work is to discover the fountain of youth.", source:"Pearl S. Buck" },
];

const NUDGES = {
  faith:       ["It has been a few days since faith showed up fully. Even one quiet moment with God is enough.", "The Edwardian day began and ended with stillness. Take a moment to be present with Heavenly Father today.", "Marmee began each morning in quiet prayer. Your spiritual life is worth tending today, even briefly."],
  movement:    ["Jo March would not have stayed inside on a day like this. The lane is waiting.", "The Norwegians say there is no bad weather, only bad clothing. Get outside today.", "In Okinawa, movement is simply life. Step outside and let your body do what it was made for."],
  nourishment: ["The March table was always full of simple, real food. Try to get a fruit or vegetable in today.", "The Edwardians ate what was in season and avoided excess. More whole food, a little less packaged.", "In Blue Zones, the plate is mostly plants and the meal is unhurried. One small step today is enough."],
  water:       ["A glass of water first thing sets the tone for the whole day. Start there.", "The Edwardians drank water and weak tea steadily all day. Small sips, often.", "Scandinavians drink herbal teas and cold water all day. Your afternoon might feel quite different with a little more of it."],
  connection:  ["It has been a little while since a truly meaningful conversation. A short message to someone who matters is enough.", "The Scandinavians have a word for simply being together without agenda. Who could you do that with today?", "In Sardinia, no one eats alone if they can help it. Who have you been meaning to call?"],
  service:     ["It has been a few days since service showed up. Even one small act of kindness is enough.", "The March girls turned to service whenever life felt heavy. Who could use a little of your attention today?", "In Blue Zones, contributing to others is woven into daily life. One small thing today is all it takes."],
  stewardship: ["It has been a few days since stewardship showed up. Even one small act of tending is enough.", "The Edwardians understood duty as a form of love. What is waiting for your attention today?", "In Blue Zones, tending gardens and community roles is woven into daily life. What is in your care that needs you today?"],
  creative:    ["Your creative self has been quiet lately. Even ten minutes of something that fills you is enough.", "Scandinavians have a deep tradition of craft and making. Your hands want a little of their own work today.", "Jo wrote even on the hard days. Make something small, even if it feels unimportant."],
  joy:         ["Small joys and cozy moments have been scarce lately. Light something, make something warm, or simply notice one thing beautiful today.", "The Danes call it hygge. The Okinawans call it ikigai. Both ask the same question: did you find warmth today?", "In Scandinavia, coziness is not an accident. It is something you build. What could you create today?"],
  rest:        ["A proper wind-down has been missing lately. The Danes call it hygge. Create a little of it tonight.", "The Edwardians kept strict hours. Work ended, and rest began. Give yourself that boundary tonight.", "Blue Zones elders sleep when it is dark. Your body is probably asking for the same."],
};

const ENCOURAGEMENT = {
  faith:       ["Your faith has been a thread in your days. Marmee wove hers through everything she did.", "You have been showing up for your spiritual life consistently. That daily faithfulness compounds.", "Connecting with Heavenly Father has been part of your rhythm. In Blue Zones, faith is one of the longest threads."],
  movement:    ["Getting outside and moving has been part of your week. The Edwardians and the Scandinavians both knew this was non-negotiable.", "You have been keeping yourself in motion outdoors. Jo March never sat still for long either.", "Outdoor movement has become part of your rhythm. In Okinawa and Scandinavia alike, that is simply called living."],
  nourishment: ["You have been tending to your meals with care. Marmee would call that good housekeeping of the soul.", "Nourishment has been a priority lately. The Edwardians believed a well-fed body was a well-ordered life.", "Something is shifting in how you are feeding yourself. Blue Zones elders would recognize that shift."],
  water:       ["You have been drinking your water consistently. Simple, steady, good.", "Hydration has been a quiet win this week. The kind the Edwardians called good constitution.", "Water has been showing up in your days. In Okinawa, that is one of the first secrets they name."],
  connection:  ["You have been showing up for the people in your life in meaningful ways. The March family made that their whole practice.", "Real connection has been a thread in your days. The Edwardians built entire lives around regular small gatherings.", "You have not been doing this alone. In Sardinia, that is considered the whole point."],
  service:     ["Service has been showing up in your days. Marmee always said the surest way out of your own troubles is to tend to someone else.", "You have been making other people's days a little brighter. That quiet generosity compounds in ways you cannot see.", "Acts of service have been a thread in your week. In Blue Zones, contributing to the community is one of the longest threads of all."],
  stewardship: ["Stewardship has been showing up in your days. Faithful tending of small things is the foundation of a well-ordered life.", "You have been attending to what is in your care. The Edwardians called this duty. Blue Zones elders call it purpose.", "The things in your care have been getting your attention this week. That quiet faithfulness matters more than it looks."],
  creative:    ["Your creative work has been showing up. Jo never let a week pass without writing something.", "You have been making things that fill you. The Edwardians believed purposeful making was essential to a full life.", "Something creative has found its place in your week. In Blue Zones, work and making are not so different."],
  joy:         ["Warmth and delight have been finding their way into your days. That is hygge and ikigai working together.", "You have been creating and noticing small joys this week. Amy March and the Danes would both approve.", "Joy and coziness have shown up in your days. That is one of the oldest wellness secrets there is."],
  rest:        ["Rest has been part of your week. Beth always knew the value of a quiet evening.", "You have been winding down with intention. The Edwardians kept strict hours for exactly this reason.", "Rest is showing up in your rhythm. Blue Zones elders have always known it is not a luxury."],
};

const SEASONAL = [
  { season:"Winter", text:"January is for hygge. The Danes and Norwegians do not hibernate in winter. They light candles, gather close, and make the indoors feel like a gift. Tend your faith and your warmth this month." },
  { season:"Winter", text:"February is for connection. The March girls wrote letters and paid visits. The Scandinavians call it showing up. The Edwardians called it the social season. Who have you been meaning to reach out to?" },
  { season:"Spring", text:"March is for opening windows and going outside. Jo March flung hers open every spring morning. In Norway, the first warm day is practically a national holiday. Step out and feel the season turning." },
  { season:"Spring", text:"April is for movement. The Edwardians cycled and walked the moment the weather turned. Scandinavians head into the forest. Find your version and get outside." },
  { season:"Spring", text:"May is the month Blue Zones gardeners are most active. Movement as tending, not exercising. Eat something you grew, picked, or bought from someone who did." },
  { season:"Summer", text:"June is for nourishment. Blue Zones summers are built around fresh food eaten slowly with people you love. In Scandinavia, June means long light and meals that go on for hours. Eat the season fully." },
  { season:"Summer", text:"July is for water and friluftsliv. Scandinavians swim in cold lakes, walk barefoot, and sleep with the windows open. Find your version of being fully outside this month." },
  { season:"Summer", text:"August is for creative work. Amy sketched all summer. Jo wrote. Beth played. The long light gives you time. The Scandinavians call this the season of making. Use it." },
  { season:"Autumn", text:"September brings the harvest. Root vegetables, squash, apples. Eat what the season offers freely. In Scandinavia, September is for foraging. In Blue Zones, it is for gathering. Both are right." },
  { season:"Autumn", text:"October is for connection. In Sardinia, October means communal feasts. In Scandinavia, it means pulling the people you love inside before the dark comes. Gather your people." },
  { season:"Autumn", text:"November is for faith and hygge. The days are short. Marmee counted her blessings out loud in November. The Scandinavians light every candle they own. What are yours?" },
  { season:"Winter", text:"December is the heart of hygge season. The March Christmas had very little and it was everything. Blue Zones elders know what enough looks like. Scandinavians know what warmth feels like. Build both this month." },
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

const INSPIRATIONS = [
  { key:"bluezones",    label:"Blue Zones",   color:"#5C8A58", fg:"#2E5C2A", bg:"#EDF4EC" },
  { key:"edwardian",    label:"Edwardian",    color:"#A87C1E", fg:"#7A4E08", bg:"#F0E4A8" },
  { key:"littlewomen",  label:"Little Women", color:"#5A7E90", fg:"#2A5060", bg:"#E4EFF4" },
  { key:"scandinavian", label:"Scandinavian", color:"#8A7A9E", fg:"#4A3A6A", bg:"#EDE8F4" },
];

const WHY_PILLARS = [
  { label:"Faith", tags:["bluezones","littlewomen","edwardian"], text:"A consistent spiritual practice is one of the most well-documented predictors of longevity and psychological resilience. People with an active faith life show lower rates of depression and anxiety, stronger immune response, and measurably longer lifespans. For members of The Church of Jesus Christ of Latter-day Saints, that connection is personal and covenantal, anchored in prayer, scripture, and a living relationship with Heavenly Father and Jesus Christ. Over a lifetime, those small daily acts of connection compound into something that touches every other area of health." },
  { label:"Movement & Fresh Air", tags:["bluezones","edwardian","scandinavian"], text:"Daily movement is the single most researched habit in longevity science. It reduces risk of heart disease, type 2 diabetes, cognitive decline, and depression, often more effectively than medication. Fresh air compounds the effect: time outdoors lowers cortisol, improves sleep quality, and restores attentional capacity in ways indoor exercise cannot. Moderate, sustained daily movement is what actually moves the needle over decades. Sixty minutes is not an arbitrary target. It is where the data points." },
  { label:"Nourishment", tags:["bluezones","edwardian","littlewomen","scandinavian"], text:"The long-term effects of how you eat show up slowly and then all at once. A diet built around whole foods, plants, and unhurried meals reduces chronic inflammation, the root mechanism behind heart disease, cancer, dementia, and metabolic disorders. Eating with intention, stopping before fullness, and treating meals as something worth sitting down for all support better digestion, healthier weight regulation, and a more stable mood. What you eat every day for thirty years is your diet. What you eat today is a single choice." },
  { label:"Water", tags:["bluezones","edwardian","scandinavian"], text:"Chronic mild dehydration is one of the most common and most overlooked contributors to fatigue, poor concentration, headaches, and low mood. Even a two percent drop in hydration measurably impairs cognitive performance. Over time, consistent hydration supports kidney function, cardiovascular health, skin integrity, and metabolic efficiency. Sixty-four ounces across the day is not a dramatic intervention. It is a quiet, compounding act of maintenance that most people simply do not do consistently." },
  { label:"Connection", tags:["bluezones","edwardian","littlewomen","scandinavian"], text:"Social isolation is as damaging to long-term health as smoking fifteen cigarettes a day. Strong social bonds reduce stress hormones, lower blood pressure, bolster immune function, and are the most consistent predictor of happiness across cultures and age groups. The quality of your relationships in midlife is a stronger predictor of how you age than cholesterol levels. But not all interaction is equal. Meaningful connection, the kind that leaves you fuller than before, is what this pillar is really asking for." },
  { label:"Service", tags:["bluezones","littlewomen","edwardian"], text:"Acts of service are among the most consistently mood-elevating behaviors in psychological research. People who regularly serve others report higher life satisfaction, lower rates of depression, and stronger immune function. In Blue Zones, contributing to the community is considered a core life purpose. Marmee taught her daughters that the surest way out of their own struggles was to look outward. LDS theology frames service as a form of worship. Even one small act is enough to count. The question is simply: did someone's day get a little better because of you?" },
  { label:"Stewardship", tags:["bluezones","edwardian","littlewomen"], text:"Having things in your care gives the day shape and meaning. Research on purpose and longevity consistently finds that people who feel responsible for something beyond themselves live longer, recover from illness faster, and report higher life satisfaction. Stewardship is not a burden. It is a gift that structures time, builds competence, and connects you to something larger than your own comfort. Tending faithfully to small things is one of the most underrated forms of self-care." },
  { label:"Creative Work", tags:["edwardian","littlewomen","scandinavian"], text:"Regular creative engagement is strongly associated with reduced anxiety, lower rates of cognitive decline, and higher reported meaning in life. It activates parts of the brain that passive consumption leaves dormant, and it produces a sense of agency that accumulates over time. Even ten minutes of something made is neurologically different from ten minutes of something consumed. The work does not have to be good. It has to be yours, and it has to fill you, not deplete you." },
  { label:"Joy & Hygge", tags:["bluezones","littlewomen","scandinavian"], text:"The ability to notice and create small moments of warmth and pleasure is not a personality trait. It is a trainable skill with measurable effects. People who regularly experience positive emotions show greater cardiovascular resilience, stronger immune function, faster recovery from stress, and longer lives. The Okinawan concept of ikigai is linked to dramatically lower rates of dementia and heart disease. You do not need large, exceptional experiences. You need reliable small ones. A candle lit. A cup of tea taken slowly. A moment enjoyed." },
  { label:"Rest", tags:["bluezones","edwardian","littlewomen","scandinavian"], text:"Sleep is not recovery from life. It is when the body does its most essential maintenance: consolidating memory, regulating hormones, clearing metabolic waste from the brain, repairing tissue, and resetting the immune system. Chronic poor sleep is linked to nearly every major disease category. Beyond sleep, deliberately winding down reduces cortisol, improves sleep quality, and protects long-term mental health. The evening routine is not indulgence. It is infrastructure." },
];

const WHY_INSPIRATIONS = [
  { label:"Blue Zones", color:"#5C8A58", fg:"#2E5C2A", text:"The Blue Zones are five regions where people consistently live past 100: Okinawa in Japan, Sardinia in Italy, Nicoya in Costa Rica, Ikaria in Greece, and Loma Linda in California. Researcher Dan Buettner identified nine common principles among them. They move naturally throughout the day without structured exercise. They eat mostly plants, stop before they are full, and share meals with others. They have a strong sense of purpose. They belong to faith communities and tight social circles. They manage stress through daily ritual rather than willpower. None of them are trying to live longer. They have simply built environments and habits that make long life the natural outcome." },
  { label:"Edwardian England", color:"#A87C1E", fg:"#7A4E08", text:"The Edwardian era, roughly 1901 to 1910, sits just before the industrialization of food and the collapse of structured daily rhythms. People walked everywhere. Fresh air was considered essential medicine. Days had clear shape: regular mealtimes, defined work hours, purposeful leisure. The culture placed high value on making things, reading, visiting friends, playing sport, and spending time outdoors regardless of weather. Meals were simple and seasonal. Duty, the faithful tending of ones responsibilities, was understood as a form of love, not burden." },
  { label:"Little Women", color:"#5A7E90", fg:"#2A5060", text:"Louisa May Alcott published Little Women in 1868 and it has never been out of print. It is included here as one of literatures clearest portraits of a life well-lived on very little. The March family is poor, but their days are full. They read, write, play music, sew, cook, go outdoors, argue, laugh, and look after one another. At the center is Marmee, a woman of deep faith, practical wisdom, and extraordinary warmth, who teaches her daughters not to chase happiness but to build it through small, consistent acts of goodness. Wellbeing is not a condition you arrive at. It is a practice you return to every day." },
  { label:"Scandinavian cultures", color:"#8A7A9E", fg:"#4A3A6A", text:"Denmark, Norway, Sweden, and Finland consistently rank among the happiest and healthiest countries on earth. Friluftsliv (free-loofts-leev), the Norwegian concept of free air life, holds that time in nature is essential to human health regardless of season or weather. Hygge (hoo-gah), the Danish and Norwegian art of coziness and presence, is about deliberately creating warmth in ordinary moments. Lagom (lah-gom), the Swedish principle of just the right amount, runs through everything from work schedules to portion sizes. Do not pursue happiness as a destination. Build it into the texture of every ordinary day." },
];

function getDateKey(d) { return d.toISOString().slice(0,10); }
function offsetDate(base, days) { const d=new Date(base); d.setDate(d.getDate()+days); return d; }
function getWeekDates(anchor) {
  const dow=anchor.getDay();
  const sun=new Date(anchor);
  sun.setDate(anchor.getDate()-dow);
  return Array.from({length:7},(_,i)=>{ const d=new Date(sun); d.setDate(sun.getDate()+i); return d; });
}
function fmtDate(d) { return d.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}); }
function fmtShort(d) { return d.toLocaleDateString("en-US",{month:"short",day:"numeric"}); }
function isSundayDate(d) { return d.getDay()===0; }

const TODAY = new Date(); TODAY.setHours(0,0,0,0);

function movementDone(entry) {
  if (!entry) return false;
  const mins=entry.minutes||0, cals=!!entry.calisthenics;
  return cals ? mins>=45 : mins>=WALK_GOAL;
}

function pillarDone(p, entry) {
  if (!entry) return false;
  if (p.isWater)      return (entry.totalOz||0)>=WATER_GOAL;
  if (p.hasMinutes)   return movementDone(entry);
  if (p.hasFaith)     return FAITH_BOOLS.every(b=>!!entry.faith?.[b.id]);
  if (p.hasNutrition) {
    const n=entry.nutrition||{};
    const pos=(n.plants?1:0)+(n.homemade?1:0)+(n.satisfied?1:0)+(n.slow?1:0);
    const neg=(n.sugar==="a little"?1:n.sugar==="quite a bit"?3:0)+(n.processed==="some"?1:n.processed==="a lot"?3:0)+(n.caffeine==="several"?1:0);
    return pos-neg>=2;
  }
  return !!entry.checked;
}

function dayScore(data, key) {
  if (!data[key]) return null;
  const date=new Date(key+"T12:00:00");
  const isSun=isSundayDate(date);
  const active=PILLARS.filter(p=>!(isSun&&p.hasMinutes));
  return active.map(p=>pillarDone(p,data[key][p.id])?1:0).reduce((a,b)=>a+b,0)/active.length;
}

function localDayIndex() {
  const d=new Date();
  return d.getFullYear()*10000+d.getMonth()*100+d.getDate();
}

function buildNudge(data, todayKey, yKey) {
  const tE=data[todayKey]||{}, yE=data[yKey]||{};
  const y2Key=getDateKey(offsetDate(new Date(todayKey),-1)), y2E=data[y2Key]||{};
  const neglected=PILLARS.filter(p=>!pillarDone(p,tE[p.id])&&!pillarDone(p,yE[p.id])&&!pillarDone(p,y2E[p.id]));
  if (!neglected.length) return null;
  const idx=localDayIndex();
  const pick=neglected[idx%neglected.length];
  const pool=NUDGES[pick.id];
  if (!pool||!pool.length) return null;
  return { pillar:pick.label, text:pool[idx%pool.length] };
}

function buildEncouragement(data) {
  const past7=Array.from({length:7},(_,i)=>{ const d=new Date(TODAY); d.setDate(TODAY.getDate()-i-1); return getDateKey(d); });
  const scored=PILLARS.map(p=>({ id:p.id, label:p.label, count:past7.filter(k=>data[k]&&pillarDone(p,data[k][p.id])).length }));
  const best=scored.reduce((a,b)=>b.count>a.count?b:a,scored[0]);
  if (best.count<3) return null;
  const pool=ENCOURAGEMENT[best.id];
  if (!pool||!pool.length) return null;
  const idx=localDayIndex();
  return { pillar:best.label, count:best.count, text:pool[idx%pool.length] };
}

function buildNourishmentInsight(data) {
  const past7=Array.from({length:7},(_,i)=>{ const d=new Date(TODAY); d.setDate(TODAY.getDate()-i-1); return getDateKey(d); });
  const entries=past7.map(k=>data[k]?.nourishment?.nutrition).filter(Boolean);
  if (entries.length<2) return null;
  const count=entries.length, threshold=Math.ceil(count*0.6);
  const wins=[], concerns=[];
  if (entries.filter(n=>n.plants).length>=threshold)    wins.push("getting your fruits and vegetables");
  if (entries.filter(n=>n.homemade).length>=threshold)  wins.push("cooking at home");
  if (entries.filter(n=>n.satisfied).length>=threshold) wins.push("stopping when satisfied");
  if (entries.filter(n=>n.slow).length>=threshold)      wins.push("eating slowly");
  if (entries.filter(n=>n.sugar==="quite a bit").length>=2)   concerns.push("quite a bit of added sugar");
  else if (entries.filter(n=>n.sugar==="a little").length>=3) concerns.push("a little added sugar most days");
  if (entries.filter(n=>n.processed==="a lot").length>=2)     concerns.push("quite a bit of processed food");
  else if (entries.filter(n=>n.processed==="some").length>=3) concerns.push("some processed food most days");
  if (entries.filter(n=>n.caffeine==="several").length>=2)    concerns.push("several caffeinated drinks a day");
  if (!wins.length&&!concerns.length) return null;
  if (wins.length&&concerns.length) return "You have been doing well with "+wins.join(" and ")+" this week. One thing worth noticing: "+concerns[0]+" has been showing up regularly.";
  if (wins.length) return "Your nourishment has been on a good track this week, especially "+wins.join(" and ")+". Keep it going.";
  return "Something worth noticing in your eating this week: "+concerns.join(" and ")+". No guilt, just an invitation to bring a little more balance today.";
}

function warmthBg(s) {
  if (s===null) return "#EEEAE2";
  if (s<0.3) return "#D4CFC8";
  if (s<0.55) return "#F0E2B6";
  if (s<EIGHTY_PCT/TOTAL_PILLARS) return "#E8C96A";
  return "#D4A017";
}
function warmthFg(s) {
  if (s===null) return "#747060";
  if (s<0.3) return "#3D3D30";
  if (s<0.55) return "#9A6E10";
  if (s<EIGHTY_PCT/TOTAL_PILLARS) return "#7A4E08";
  return "#4A2E04";
}

function usePopOnTrue(val) {
  const [popping,setPopping]=useState(false);
  const prev=useRef(val);
  useEffect(()=>{
    if (val&&!prev.current) { setPopping(true); const t=setTimeout(()=>setPopping(false),400); return ()=>clearTimeout(t); }
    prev.current=val;
  },[val]);
  return popping;
}

function UndoToast({ message, onUndo, onDismiss }) {
  useEffect(()=>{ const t=setTimeout(onDismiss,4000); return ()=>clearTimeout(t); },[]);
  return (
    <div style={{position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:C.inkMid,color:C.cream,borderRadius:8,padding:"10px 18px",display:"flex",alignItems:"center",gap:14,fontFamily:sans,fontSize:14,zIndex:200,boxShadow:"0 4px 16px rgba(0,0,0,0.2)",whiteSpace:"nowrap"}}>
      <span>{message}</span>
      <button onClick={onUndo} style={{background:"none",border:"1px solid rgba(255,255,255,0.4)",borderRadius:4,color:C.cream,fontFamily:sans,fontSize:13,cursor:"pointer",padding:"3px 10px"}}>Undo</button>
    </div>
  );
}

function NavBtn({ onClick, label, disabled }) {
  return <button onClick={onClick} disabled={disabled} style={{background:"none",border:"1px solid "+C.parchDark,borderRadius:4,padding:"6px 14px",cursor:disabled?"default":"pointer",fontFamily:sans,fontSize:14,color:disabled?C.parchDark:C.inkMid,opacity:disabled?0.4:1}}>{label}</button>;
}

function CheckBox({ on }) {
  const pop=usePopOnTrue(on);
  return (
    <div style={{width:22,height:22,borderRadius:3,flexShrink:0,border:"1.5px solid "+(on?C.sage:C.inkLight),background:on?C.sage:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transform:pop?"scale(1.35)":"scale(1)",boxShadow:pop?"0 0 0 4px #B0CCAD66":"none",transition:"background .15s, border-color .15s, transform .2s, box-shadow .2s"}}>
      {on&&<svg width="12" height="12" viewBox="0 0 10 10"><path d="M1.5 5.5l2.5 2.5 5-5" stroke={C.cream} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </div>
  );
}

function NoteField({ value, onChange, onClick }) {
  return <textarea placeholder="A note for today..." value={value||""} onChange={onChange} onClick={onClick} rows={2} style={{width:"100%",boxSizing:"border-box",resize:"none",border:"1px solid "+C.parchDark,borderRadius:4,padding:"10px 12px",fontSize:15,fontFamily:serif,fontStyle:"italic",background:C.cream,color:C.ink,outline:"none",lineHeight:1.7}}/>;
}

function ClearBtn({ onClear }) {
  return <button onClick={onClear} style={{background:"none",border:"none",cursor:"pointer",fontFamily:sans,fontSize:12,color:C.inkLight,textDecoration:"underline",padding:"6px 0 0",display:"block"}}>Clear this entry</button>;
}

function FlagRow({ label, hint, options, value, onChange }) {
  return (
    <div style={{marginBottom:14}}>
      <div style={{fontFamily:sans,fontSize:14,color:C.ink,marginBottom:7}}>{label} <span style={{color:C.inkLight,fontSize:13}}>- {hint}</span></div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {options.map(o=>{ const sel=value===o,good=o===options[0]; return <button key={o} onClick={()=>onChange(o)} style={{padding:"5px 14px",borderRadius:12,border:"1px solid",borderColor:sel?(good?C.sageDark:C.clay):C.parchDark,background:sel?(good?"#EDF4EC":C.clayPale):"transparent",fontFamily:sans,fontSize:13,color:sel?(good?C.sageDark:C.clay):C.inkLight,cursor:"pointer"}}>{o}</button>; })}
      </div>
    </div>
  );
}

function BoolRow({ label, hint, value, onChange }) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
      <span style={{fontFamily:sans,fontSize:14,color:C.ink,flex:1,paddingRight:12}}>{label} <span style={{color:C.inkLight,fontSize:13}}>{hint}</span></span>
      <div onClick={()=>onChange(!value)} style={{width:42,height:26,borderRadius:13,cursor:"pointer",background:value?C.sage:C.parchDark,position:"relative",transition:"background .2s",flexShrink:0}}>
        <div style={{position:"absolute",top:4,left:value?20:4,width:18,height:18,borderRadius:9,background:C.cream,transition:"left .2s"}}/>
      </div>
    </div>
  );
}

function SeasonalCard({ month }) {
  const s=SEASONAL[month];
  return (
    <div style={{padding:"20px 22px",borderRadius:4,background:C.parchment,borderLeft:"3px solid "+C.sagePale}}>
      <p style={{fontFamily:serif,fontStyle:"italic",fontSize:15,color:C.inkMid,lineHeight:1.8,margin:0}}>{s.text}</p>
      <p style={{fontFamily:sans,fontSize:12,color:C.inkLight,margin:"12px 0 0",letterSpacing:"0.05em",textTransform:"uppercase"}}>{s.season} - {MONTHS_LONG[month]}</p>
    </div>
  );
}

function MonthStats({ monthDays, data }) {
  const scores=monthDays.filter(d=>d&&d<=TODAY).map(d=>dayScore(data,getDateKey(d))).filter(s=>s!==null);
  const count=scores.length, avg=count?Math.round(scores.reduce((a,b)=>a+b,0)/count*100):0;
  const best=count?Math.round(Math.max(...scores)*100):0, at80=scores.filter(s=>s>=EIGHTY_PCT/TOTAL_PILLARS).length;
  const stats=[{label:"Days logged",val:count},{label:"Days at 80%+",val:at80},{label:"Average",val:count?avg+"%":"--"},{label:"Best day",val:count?best+"%":"--"}];
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
  const pillar=PILLARS.find(p=>p.id===target), isDay=target==="day";
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(44,36,22,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:"0 24px"}}>
      <div style={{background:C.cream,borderRadius:12,padding:"28px 24px",maxWidth:320,width:"100%"}}>
        <p style={{fontFamily:serif,fontSize:17,color:C.ink,margin:"0 0 8px",fontWeight:400}}>{isDay?"Clear this whole day?":"Clear "+(pillar?pillar.label:"entry")+"?"}</p>
        <p style={{fontFamily:sans,fontSize:13,color:C.inkLight,margin:"0 0 24px",lineHeight:1.6}}>{isDay?"All entries for this day will be reset to blank.":"This pillar's data and notes will be reset to blank."}</p>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onCancel} style={{flex:1,padding:"10px 0",borderRadius:6,border:"1px solid "+C.parchDark,background:"transparent",fontFamily:sans,fontSize:14,color:C.inkMid,cursor:"pointer"}}>Cancel</button>
          <button onClick={onConfirm} style={{flex:1,padding:"10px 0",borderRadius:6,border:"none",background:C.clay,fontFamily:sans,fontSize:14,color:C.cream,cursor:"pointer"}}>Clear</button>
        </div>
      </div>
    </div>
  );
}

function FaithPillar({ entry, onSetFaith, onSetNote, onClear, open, onToggleOpen }) {
  const faithData=entry?.faith||{};
  const checkedCount=FAITH_BOOLS.filter(b=>!!faithData[b.id]).length;
  const done=checkedCount===FAITH_BOOLS.length;
  const pop=usePopOnTrue(done);
  const summary=checkedCount===0?"Did you connect with Heavenly Father and Jesus Christ?":done?"All four practices complete":checkedCount+" of 4 complete";
  return (
    <div style={{borderRadius:4,border:"1px solid "+(done?C.sagePale:C.parchDark),background:done?"#EDF4EC":C.parchment,overflow:"hidden",transition:"background .3s, border-color .3s"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px"}}>
        <div style={{flex:1}}>
          <div style={{fontFamily:serif,fontSize:19,color:done?C.sageDark:C.ink,transition:"color .3s",transform:pop?"scale(1.02)":"scale(1)"}}>Faith</div>
          <div style={{fontFamily:sans,fontSize:14,color:C.inkMid,marginTop:3}}>{summary}</div>
        </div>
        <button onClick={onToggleOpen} style={{background:"none",border:"none",cursor:"pointer",padding:"0 4px",fontFamily:serif,fontSize:24,lineHeight:1,color:C.inkLight,flexShrink:0}}>{open?"-":"+"}</button>
      </div>
      {open&&(
        <div style={{padding:"12px 16px 14px",borderTop:"1px dashed "+C.parchDark}}>
          {FAITH_BOOLS.map(b=>(
            <BoolRow key={b.id} label={b.label} hint={b.hint} value={!!faithData[b.id]} onChange={v=>onSetFaith(b.id,v)}/>
          ))}
          <div style={{marginTop:10}}>
            <NoteField value={entry?.note} onChange={e=>onSetNote(e.target.value)} onClick={e=>e.stopPropagation()}/>
          </div>
          <ClearBtn onClear={onClear}/>
        </div>
      )}
    </div>
  );
}

function WaterPillar({ waterEntry, onAddDrink, onRemoveDrink, onClear }) {
  const [inputVal,setInputVal]=useState("");
  const inputRef=useRef(null);
  const drinks=waterEntry?.drinks||[], totalOz=waterEntry?.totalOz||0;
  const done=totalOz>=WATER_GOAL, remaining=Math.max(0,WATER_GOAL-totalOz);
  const pct=Math.min(100,(totalOz/WATER_GOAL)*100);
  const pop=usePopOnTrue(done);
  function handleAdd() { const n=parseInt(inputVal); if (!n||n<=0||n>200) return; onAddDrink(n); setInputVal(""); inputRef.current?.focus(); }
  return (
    <div style={{borderRadius:4,border:"1px solid "+(totalOz>0?C.dustBluePale:C.parchDark),background:done?"#EAF3F7":C.parchment,overflow:"hidden",transition:"background .3s, border-color .3s"}}>
      <div style={{padding:"14px 16px 10px"}}>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:3}}>
          <div style={{fontFamily:serif,fontSize:19,color:done?C.sageDark:C.ink,transition:"color .3s"}}>Water</div>
          <div style={{fontFamily:serif,fontSize:22,color:done?C.sageDark:C.dustBlueDark,fontWeight:400,transform:pop?"scale(1.2)":"scale(1)",transition:"color .3s, transform .2s"}}>
            {totalOz} <span style={{fontSize:14,color:C.inkLight}}>/ {WATER_GOAL} oz</span>
          </div>
        </div>
        <div style={{fontFamily:sans,fontSize:13,color:C.inkMid,marginBottom:10}}>{totalOz===0?"Log your drinks below":done?"Goal reached - well hydrated today":`${remaining} oz to go`}</div>
        <div style={{height:6,borderRadius:3,background:C.parchDark,overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:3,width:pct+"%",background:done?C.sage:C.dustBlue,transition:"width .4s ease, background .3s"}}/>
        </div>
      </div>
      {drinks.length>0&&(
        <div style={{padding:"0 16px 10px",display:"flex",flexWrap:"wrap",gap:6}}>
          {drinks.map((oz,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:12,background:C.dustBluePale,border:"1px solid "+C.dustBlue}}>
              <span style={{fontFamily:sans,fontSize:13,color:C.dustBlueDark}}>{oz} oz</span>
              <button onClick={()=>onRemoveDrink(i,oz)} style={{background:"none",border:"none",cursor:"pointer",color:C.dustBlue,fontSize:14,lineHeight:1,padding:"0 0 0 2px",fontFamily:sans}}>x</button>
            </div>
          ))}
        </div>
      )}
      <div style={{padding:"0 16px 14px",display:"flex",gap:8,alignItems:"center"}}>
        <input ref={inputRef} type="number" min="1" max="200" placeholder="oz" value={inputVal}
          onChange={e=>setInputVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAdd()}
          style={{width:72,padding:"7px 10px",border:"1px solid "+C.parchDark,borderRadius:4,fontFamily:sans,fontSize:14,color:C.ink,background:C.cream,outline:"none",boxSizing:"border-box"}}/>
        <button onClick={handleAdd} style={{padding:"7px 16px",borderRadius:4,border:"none",background:C.dustBlue,color:C.cream,fontFamily:sans,fontSize:13,cursor:"pointer"}}>Add drink</button>
        {totalOz>0&&<ClearBtn onClear={onClear}/>}
      </div>
    </div>
  );
}

function MovementPillar({ entry, onAddWalk, onRemoveWalk, onToggleCalisthenics, onSetNote, onClear, open, onToggleOpen }) {
  const [inputVal,setInputVal]=useState("");
  const inputRef=useRef(null);
  const walks=entry?.walks||[];
  const walkMins=entry?.minutes||0;
  const cals=!!entry?.calisthenics;
  const target=cals?45:WALK_GOAL;
  const mDone=movementDone(entry);
  const pop=usePopOnTrue(mDone);
  const remaining=Math.max(0,target-walkMins);
  const status=mDone?"goal met":walkMins>0?remaining+" min to go":"";
  function handleAdd() { const n=parseInt(inputVal); if (!n||n<=0) return; onAddWalk(n); setInputVal(""); inputRef.current?.focus(); }
  return (
    <div style={{borderRadius:4,border:"1px solid "+(mDone?C.sagePale:C.parchDark),background:mDone?"#EDF4EC":C.parchment,overflow:"hidden",transition:"background .3s, border-color .3s"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px"}}>
        <div style={{flex:1}}>
          <div style={{fontFamily:serif,fontSize:19,color:mDone?C.sageDark:C.ink,transition:"color .3s"}}>Movement & Fresh Air</div>
          <div style={{fontFamily:sans,fontSize:14,color:C.inkMid,marginTop:3}}>Did you move your body and spend time outside?</div>
        </div>
        <button onClick={onToggleOpen} style={{background:"none",border:"none",cursor:"pointer",padding:"0 4px",fontFamily:serif,fontSize:24,lineHeight:1,color:C.inkLight,flexShrink:0}}>{open?"-":"+"}</button>
      </div>
      <div style={{padding:"0 16px 14px"}}>
        <div onClick={onToggleCalisthenics} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,cursor:"pointer"}}>
          <span style={{fontFamily:sans,fontSize:14,color:C.ink}}>Daily calisthenics</span>
          <div style={{width:42,height:26,borderRadius:13,background:cals?C.sage:C.parchDark,position:"relative",transition:"background .2s",flexShrink:0}}>
            <div style={{position:"absolute",top:4,left:cals?20:4,width:18,height:18,borderRadius:9,background:C.cream,transition:"left .2s"}}/>
          </div>
        </div>
        <div style={{fontFamily:sans,fontSize:14,color:C.ink,marginBottom:8}}>Walk goal: {target} min</div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <div style={{flex:1,height:6,borderRadius:3,background:C.parchDark,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:3,width:Math.min(100,(walkMins/90)*100)+"%",background:mDone?C.sage:walkMins>0?C.gold:"transparent",transition:"width .4s ease, background .3s"}}/>
          </div>
          <span style={{fontFamily:serif,fontSize:16,color:mDone?C.sageDark:C.ink,minWidth:36,textAlign:"right",transform:pop?"scale(1.2)":"scale(1)",transition:"color .3s, transform .2s"}}>{walkMins}<span style={{fontFamily:sans,fontSize:12,color:C.inkLight}}> min</span></span>
          {status&&<span style={{fontFamily:sans,fontSize:12,color:mDone?C.sageDark:C.inkLight,minWidth:60}}>{status}</span>}
        </div>
        {walks.length>0&&(
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
            {walks.map((mins,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:12,background:C.sagePale,border:"1px solid "+C.sage}}>
                <span style={{fontFamily:sans,fontSize:13,color:C.sageDark}}>{mins} min</span>
                <button onClick={()=>onRemoveWalk(i,mins)} style={{background:"none",border:"none",cursor:"pointer",color:C.sage,fontSize:14,lineHeight:1,padding:"0 0 0 2px",fontFamily:sans}}>x</button>
              </div>
            ))}
          </div>
        )}
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <input ref={inputRef} type="number" min="1" max="300" placeholder="min" value={inputVal}
            onChange={e=>setInputVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAdd()}
            style={{width:72,padding:"7px 10px",border:"1px solid "+C.parchDark,borderRadius:4,fontFamily:sans,fontSize:14,color:C.ink,background:C.cream,outline:"none",boxSizing:"border-box"}}/>
          <button onClick={handleAdd} style={{padding:"7px 16px",borderRadius:4,border:"none",background:C.sage,color:C.cream,fontFamily:sans,fontSize:13,cursor:"pointer"}}>Log walk</button>
          {walkMins>0&&<ClearBtn onClear={onClear}/>}
        </div>
        {open&&(
          <div style={{marginTop:12}}>
            <NoteField value={entry?.note} onChange={e=>onSetNote(e.target.value)} onClick={e=>e.stopPropagation()}/>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckPillar({ p, entry, onToggle, onSetNote, onClear, open, onToggleOpen }) {
  const on=pillarDone(p,entry), pop=usePopOnTrue(on);
  return (
    <div style={{borderRadius:4,border:"1px solid "+(on?C.sagePale:C.parchDark),background:on?"#EDF4EC":C.parchment,overflow:"hidden",transition:"background .3s, border-color .3s"}}>
      <div style={{display:"flex",alignItems:"center",padding:"14px 16px",gap:14,cursor:"pointer"}} onClick={onToggle}>
        <div style={{transform:pop?"scale(1.35)":"scale(1)",transition:"transform .2s"}}><CheckBox on={on}/></div>
        <div style={{flex:1}}>
          <div style={{fontFamily:serif,fontSize:19,color:on?C.sageDark:C.ink,transition:"color .3s"}}>{p.label}</div>
          <div style={{fontFamily:sans,fontSize:14,color:C.inkMid,marginTop:3}}>{p.prompt}</div>
        </div>
        <button onClick={e=>{e.stopPropagation();onToggleOpen();}} style={{background:"none",border:"none",cursor:"pointer",padding:"0 4px",fontFamily:serif,fontSize:24,lineHeight:1,color:C.inkLight,flexShrink:0}}>{open?"-":"+"}</button>
      </div>
      {open&&<div style={{padding:"0 16px 14px"}}><NoteField value={entry?.note} onChange={e=>onSetNote(e.target.value)} onClick={e=>e.stopPropagation()}/><ClearBtn onClear={onClear}/></div>}
    </div>
  );
}

function InspirationTag({ insKey }) {
  const insp=INSPIRATIONS.find(i=>i.key===insKey);
  if (!insp) return null;
  return (
    <span style={{display:"inline-block",padding:"2px 10px",borderRadius:12,border:"1px solid "+insp.color,background:insp.bg,fontFamily:sans,fontSize:11,color:insp.fg,letterSpacing:"0.03em",marginRight:6,marginBottom:4}}>
      {insp.label}
    </span>
  );
}

function WhyPillarItem({ label, text, tags }) {
  const [open,setOpen]=useState(false);
  return (
    <div style={{borderBottom:"1px solid "+C.parchDark}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 0",textAlign:"left"}}>
        <span style={{fontFamily:serif,fontSize:18,fontWeight:400,color:C.ink}}>{label}</span>
        <span style={{fontFamily:serif,fontSize:22,color:C.inkLight,lineHeight:1,flexShrink:0,marginLeft:12}}>{open?"-":"+"}</span>
      </button>
      {open&&(
        <div style={{paddingBottom:16,paddingRight:8}}>
          <p style={{fontFamily:sans,fontSize:14,color:C.inkMid,lineHeight:1.8,margin:"0 0 12px"}}>{text}</p>
          <div style={{display:"flex",flexWrap:"wrap"}}>
            {tags.map(t=><InspirationTag key={t} insKey={t}/>)}
          </div>
        </div>
      )}
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
  const [toast,        setToast]        = useState(null);

  const viewDate           = useMemo(()=>offsetDate(TODAY,dayOffset),[dayOffset]);
  const viewKey            = getDateKey(viewDate);
  const isToday            = dayOffset===0;
  const isSunday           = viewDate.getDay()===0;
  const yKey               = getDateKey(offsetDate(viewDate,-1));
  const viewData           = data[viewKey]||{};
  const activePillars      = PILLARS.filter(p=>!(isSunday&&p.hasMinutes));
  const checkedCount       = activePillars.filter(p=>pillarDone(p,viewData[p.id])).length;
  const nudge              = isToday?buildNudge(data,viewKey,yKey):null;
  const encourage          = isToday?buildEncouragement(data):null;
  const nourishmentInsight = isToday?buildNourishmentInsight(data):null;
  const idx                = localDayIndex();
  const quote              = QUOTES[idx%QUOTES.length];
  const nowMonth           = new Date().getMonth();
  const rawN               = viewData.nourishment?.nutrition||{};
  const nutrition          = { plants:!!rawN.plants, homemade:!!rawN.homemade, satisfied:!!rawN.satisfied, sugar:rawN.sugar||"none", processed:rawN.processed||"none", caffeine:rawN.caffeine||"none", slow:!!rawN.slow };
  const hasDayData         = data[viewKey]&&Object.keys(data[viewKey]).length>0;
  const pastScore          = !isToday?dayScore(data,viewKey):null;
  const activeTotal        = activePillars.length;

  const weekAnchor= useMemo(()=>offsetDate(TODAY,weekOffset*7),[weekOffset]);
  const weekDates = useMemo(()=>getWeekDates(weekAnchor),[weekAnchor]);
  const monthRef  = useMemo(()=>new Date(TODAY.getFullYear(),TODAY.getMonth()+monthOffset,1),[monthOffset]);
  const monthDays = useMemo(()=>{
    const y=monthRef.getFullYear(),m=monthRef.getMonth();
    const first=new Date(y,m,1),last=new Date(y,m+1,0);
    const dow=first.getDay(), days=[];
    for(let i=0;i<dow;i++) days.push(null);
    for(let d=1;d<=last.getDate();d++) days.push(new Date(y,m,d));
    return days;
  },[monthRef]);

  useEffect(()=>{ try { localStorage.setItem("rhythm-data",JSON.stringify(data)); } catch {} },[data]);

  function showToast(message, onUndo) { setToast({ message, onUndo }); }

  function setFaith(field, val) {
    setData(prev=>({...prev,[viewKey]:{...prev[viewKey],faith:{...prev[viewKey]?.faith,faith:{...prev[viewKey]?.faith?.faith,[field]:val}}}}));
  }
  function toggle(pid) {
    setData(prev=>({...prev,[viewKey]:{...prev[viewKey],[pid]:{...prev[viewKey]?.[pid],checked:!prev[viewKey]?.[pid]?.checked}}}));
  }
  function setNote(pid,val) {
    setData(prev=>({...prev,[viewKey]:{...prev[viewKey],[pid]:{...prev[viewKey]?.[pid],note:val}}}));
  }
  function addWalk(mins) {
    setData(prev=>{
      const cur=prev[viewKey]?.movement||{walks:[],minutes:0};
      const walks=[...(cur.walks||[]),mins];
      return {...prev,[viewKey]:{...prev[viewKey],movement:{...cur,walks,minutes:walks.reduce((a,b)=>a+b,0)}}};
    });
  }
  function removeWalk(idx2, mins) {
    const snap=viewData.movement;
    setData(prev=>{
      const cur=prev[viewKey]?.movement||{walks:[],minutes:0};
      const walks=(cur.walks||[]).filter((_,i)=>i!==idx2);
      return {...prev,[viewKey]:{...prev[viewKey],movement:{...cur,walks,minutes:walks.reduce((a,b)=>a+b,0)}}};
    });
    showToast("Removed "+mins+" min",()=>setData(prev=>({...prev,[viewKey]:{...prev[viewKey],movement:snap}})));
  }
  function toggleCalisthenics() {
    setData(prev=>({...prev,[viewKey]:{...prev[viewKey],movement:{...prev[viewKey]?.movement,calisthenics:!prev[viewKey]?.movement?.calisthenics}}}));
  }
  function addDrink(oz) {
    setData(prev=>{ const cur=prev[viewKey]?.water||{drinks:[],totalOz:0}; const drinks=[...(cur.drinks||[]),oz]; return {...prev,[viewKey]:{...prev[viewKey],water:{...cur,drinks,totalOz:drinks.reduce((a,b)=>a+b,0)}}}; });
  }
  function removeDrink(idx2, oz) {
    const snap=viewData.water;
    setData(prev=>{ const cur=prev[viewKey]?.water||{drinks:[],totalOz:0}; const drinks=(cur.drinks||[]).filter((_,i)=>i!==idx2); return {...prev,[viewKey]:{...prev[viewKey],water:{...cur,drinks,totalOz:drinks.reduce((a,b)=>a+b,0)}}}; });
    showToast("Removed "+oz+" oz",()=>setData(prev=>({...prev,[viewKey]:{...prev[viewKey],water:snap}})));
  }
  function setNutrition(field,val) {
    setData(prev=>({...prev,[viewKey]:{...prev[viewKey],nourishment:{...prev[viewKey]?.nourishment,nutrition:{...prev[viewKey]?.nourishment?.nutrition,[field]:val}}}}));
  }
  function clearPillar(pid) {
    let blank;
    if (pid==="water")      blank={drinks:[],totalOz:0};
    else if (pid==="faith") blank={faith:{},note:""};
    else { const p=PILLARS.find(p=>p.id===pid); if(p.hasMinutes) blank={walks:[],minutes:0,note:""}; else if(p.hasNutrition) blank={checked:false,note:"",nutrition:{plants:false,homemade:false,satisfied:false,sugar:"none",processed:"none",caffeine:"none",slow:false}}; else blank={checked:false,note:""}; }
    setData(prev=>({...prev,[viewKey]:{...prev[viewKey],[pid]:blank}}));
    setConfirmClear(null);
  }
  function clearDay() { setData(prev=>({...prev,[viewKey]:{}})); setConfirmClear(null); }

  const greet=!isToday?null:checkedCount===0?"How is today unfolding?":checkedCount<4?"Every habit counts. Keep going.":checkedCount<EIGHTY_PCT?"More than halfway there. You are doing well.":checkedCount===activeTotal?"A perfect day. Soak it in.":"You reached your 80 today. That is enough.";
  const isCurrentMonth=monthOffset===0, monthLabel=MONTHS_LONG[monthRef.getMonth()]+" "+monthRef.getFullYear();
  function jumpToDay(dt) { setView("today"); setDayOffset(Math.round((dt-TODAY)/86400000)); }

  return (
    <div style={{background:C.cream,minHeight:"100vh",color:C.ink}}>
      {confirmClear&&<ConfirmModal target={confirmClear} onConfirm={()=>confirmClear==="day"?clearDay():clearPillar(confirmClear)} onCancel={()=>setConfirmClear(null)}/>}
      {toast&&<UndoToast message={toast.message} onUndo={()=>{ toast.onUndo(); setToast(null); }} onDismiss={()=>setToast(null)}/>}
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
            {!isToday&&(
              <div style={{marginBottom:16,padding:"12px 16px",borderRadius:4,background:pastScore!==null?warmthBg(pastScore):C.parchment,border:"1px solid "+C.parchDark}}>
                {pastScore!==null?(
                  <>
                    <p style={{fontFamily:serif,fontStyle:"italic",fontSize:15,color:warmthFg(pastScore),margin:0}}>{Math.round(pastScore*100)}% - {pastScore>=EIGHTY_PCT/TOTAL_PILLARS?"a strong day.":pastScore>=0.5?"more than halfway there.":"still a day logged."}</p>
                    <p style={{fontFamily:sans,fontSize:12,color:warmthFg(pastScore),margin:"6px 0 0",opacity:0.75}}>{fmtDate(viewDate)} - editing past entry</p>
                  </>
                ):(
                  <p style={{fontFamily:serif,fontStyle:"italic",fontSize:15,color:C.inkLight,margin:0}}>{fmtDate(viewDate)} - nothing logged yet. Fill it in below.</p>
                )}
              </div>
            )}
            {isToday&&nudge&&nudge.pillar!=="Nourishment"&&(
              <div style={{marginBottom:12,padding:"12px 16px",borderRadius:4,background:C.goldPale,borderLeft:"3px solid "+C.gold}}>
                <p style={{fontFamily:serif,fontStyle:"italic",fontSize:13,color:C.inkMid,lineHeight:1.7,margin:0}}>{nudge.text}</p>
                <p style={{fontFamily:sans,fontSize:12,color:C.gold,margin:"8px 0 0",letterSpacing:"0.05em",textTransform:"uppercase"}}>{nudge.pillar} - has not shown up in a few days</p>
              </div>
            )}
            {isToday&&nourishmentInsight&&(
              <div style={{marginBottom:12,padding:"12px 16px",borderRadius:4,background:C.goldPale,borderLeft:"3px solid "+C.gold}}>
                <p style={{fontFamily:serif,fontStyle:"italic",fontSize:13,color:C.inkMid,lineHeight:1.7,margin:0}}>{nourishmentInsight}</p>
                <p style={{fontFamily:sans,fontSize:12,color:C.gold,margin:"8px 0 0",letterSpacing:"0.05em",textTransform:"uppercase"}}>Nourishment - this week's pattern</p>
              </div>
            )}
            {isToday&&encourage&&encourage.pillar!=="Nourishment"&&(
              <div style={{marginBottom:12,padding:"12px 16px",borderRadius:4,background:"#EDF4EC",borderLeft:"3px solid "+C.sage}}>
                <p style={{fontFamily:serif,fontStyle:"italic",fontSize:13,color:C.inkMid,lineHeight:1.7,margin:0}}>{encourage.text}</p>
                <p style={{fontFamily:sans,fontSize:12,color:C.sageDark,margin:"8px 0 0",letterSpacing:"0.05em",textTransform:"uppercase"}}>{encourage.pillar} - {encourage.count} of the last 7 days</p>
              </div>
            )}
            {isToday&&checkedCount>=EIGHTY_PCT&&(
              <div style={{marginBottom:18,padding:"12px 16px",borderRadius:4,background:"#EDF4EC",borderLeft:"3px solid "+C.sageDark}}>
                <p style={{fontFamily:serif,fontStyle:"italic",fontSize:15,color:C.sageDark,lineHeight:1.7,margin:0}}>{checkedCount===activeTotal?"A truly full day. Every pillar tended to.":"You reached your 80 today. That is enough."}</p>
              </div>
            )}
            {isToday&&checkedCount<EIGHTY_PCT&&<p style={{fontFamily:serif,fontSize:19,color:C.inkMid,marginBottom:20,marginTop:0,fontStyle:"italic"}}>{greet}</p>}

            {isSunday&&(
              <div style={{padding:"20px 18px",borderRadius:4,background:C.parchment,border:"1px solid "+C.parchDark,marginBottom:8,textAlign:"center"}}>
                <p style={{fontFamily:serif,fontStyle:"italic",fontSize:17,color:C.inkLight,margin:0}}>Sunday is a rest day.</p>
                <p style={{fontFamily:sans,fontSize:13,color:C.inkLight,margin:"6px 0 0"}}>No tracking today. Come back tomorrow.</p>
              </div>
            )}
            <div style={{display:"flex",flexDirection:"column",gap:5,opacity:isSunday?0.3:1,pointerEvents:isSunday?"none":"auto"}}>
              {PILLARS.map(p=>{
                const st=viewData[p.id], open=expanded===p.id;
                const toggleOpen=()=>setExpanded(open?null:p.id);
                if (p.hasFaith)     return <FaithPillar key={p.id} entry={st} onSetFaith={setFaith} onSetNote={v=>setNote(p.id,v)} onClear={()=>setConfirmClear(p.id)} open={open} onToggleOpen={toggleOpen}/>;
                if (p.isWater)      return <WaterPillar key={p.id} waterEntry={st} onAddDrink={addDrink} onRemoveDrink={removeDrink} onClear={()=>setConfirmClear("water")}/>;
                if (p.hasMinutes)   return <MovementPillar key={p.id} entry={st} onAddWalk={addWalk} onRemoveWalk={removeWalk} onToggleCalisthenics={toggleCalisthenics} onSetNote={v=>setNote(p.id,v)} onClear={()=>setConfirmClear(p.id)} open={open} onToggleOpen={toggleOpen}/>;
                if (p.hasNutrition) {
                  const nDone=pillarDone(p,st);
                  const parts=[nutrition.plants&&"3+ fruit & veg",nutrition.homemade&&"home-cooked",nutrition.satisfied&&"stopped when full",nutrition.slow&&"ate slowly",nutrition.caffeine!=="none"&&("caffeine: "+nutrition.caffeine),nutrition.sugar!=="none"&&("sugar: "+nutrition.sugar)].filter(Boolean);
                  const nSummary=parts.length>0?parts.join(" - "):p.prompt;
                  return (
                    <div key={p.id} style={{borderRadius:4,border:"1px solid "+(nDone?C.sagePale:C.parchDark),background:nDone?"#EDF4EC":C.parchment,overflow:"hidden",transition:"background .3s, border-color .3s"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px"}}>
                        <div style={{flex:1}}>
                          <div style={{fontFamily:serif,fontSize:19,color:nDone?C.sageDark:C.ink,transition:"color .3s"}}>Nourishment</div>
                          <div style={{fontFamily:sans,fontSize:14,color:C.inkMid,marginTop:3}}>{nSummary}</div>
                        </div>
                        <button onClick={e=>{e.stopPropagation();toggleOpen();}} style={{background:"none",border:"none",cursor:"pointer",padding:"0 4px",fontFamily:serif,fontSize:24,lineHeight:1,color:C.inkLight,flexShrink:0}}>{open?"-":"+"}</button>
                      </div>
                      {open&&(
                        <div style={{padding:"12px 16px 14px",borderTop:"1px dashed "+C.parchDark}}>
                          {NUTRITION_BOOLS.map(nb=><BoolRow key={nb.id} label={nb.label} hint={nb.hint} value={!!nutrition[nb.id]} onChange={v=>setNutrition(nb.id,v)}/>)}
                          <div style={{height:1,background:C.parchDark,margin:"10px 0"}}/>
                          <FlagRow label="Added sugar" hint="sweets, syrups, sweet drinks" options={["none","a little","quite a bit"]} value={nutrition.sugar} onChange={v=>setNutrition("sugar",v)}/>
                          <FlagRow label="Processed food" hint="packaged, fast food" options={["none","some","a lot"]} value={nutrition.processed} onChange={v=>setNutrition("processed",v)}/>
                          <FlagRow label="Caffeine" hint="soda, energy drinks, tea" options={["none","one or two","several"]} value={nutrition.caffeine} onChange={v=>setNutrition("caffeine",v)}/>
                          <div style={{height:1,background:C.parchDark,margin:"10px 0"}}/>
                          <BoolRow label="Ate slowly" hint="sat down, present, no rush" value={nutrition.slow} onChange={v=>setNutrition("slow",v)}/>
                          <div style={{marginTop:10}}><NoteField value={st?.note} onChange={e=>setNote(p.id,e.target.value)} onClick={e=>e.stopPropagation()}/></div>
                          <ClearBtn onClear={()=>setConfirmClear(p.id)}/>
                        </div>
                      )}
                    </div>
                  );
                }
                return <CheckPillar key={p.id} p={p} entry={st} onToggle={()=>toggle(p.id)} onSetNote={v=>setNote(p.id,v)} onClear={()=>setConfirmClear(p.id)} open={open} onToggleOpen={toggleOpen}/>;
              })}
            </div>
          </>
        )}

        {view==="week"&&(
          <>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <NavBtn onClick={()=>setWeekOffset(w=>w-1)} label="Earlier" disabled={false}/>
              <div style={{fontFamily:serif,fontSize:14,color:C.ink,textAlign:"center"}}>{weekOffset===0?"This week":weekOffset===-1?"Last week":fmtShort(weekDates[0])+" - "+fmtShort(weekDates[6])}</div>
              <NavBtn onClick={()=>setWeekOffset(w=>w+1)} label="Later" disabled={weekOffset>=0}/>
            </div>
            <p style={{fontFamily:serif,fontSize:15,color:C.inkLight,fontStyle:"italic",margin:"0 0 14px"}}>Weekly warmth</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:5,marginBottom:10}}>
              {weekDates.map((dt,i)=>{
                const key=getDateKey(dt),score=dayScore(data,key),isTodayCell=key===getDateKey(TODAY);
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
                  <div style={{width:12,height:12,borderRadius:2,background:bg,border:"1px solid "+C.parchDark}}/>{l}
                </div>
              ))}
            </div>
            {(()=>{ const at80=weekDates.filter(dt=>{ const s=dayScore(data,getDateKey(dt)); return s!==null&&s>=EIGHTY_PCT/TOTAL_PILLARS; }).length; return at80>0?<p style={{fontFamily:serif,fontStyle:"italic",fontSize:14,color:C.inkMid,margin:"0 0 20px"}}>{at80} of 7 days at 80% this week{at80>=5?" - a strong week.":at80>=3?" - good momentum.":"."}</p>:null; })()}
            <div style={{borderTop:"1px solid "+C.parchDark,marginBottom:24}}/>
            <p style={{fontFamily:serif,fontSize:15,color:C.inkLight,fontStyle:"italic",margin:"0 0 16px"}}>By pillar</p>
            <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:32}}>
              {PILLARS.map(p=>{
                const dots=weekDates.map(dt=>{ const k=getDateKey(dt); if(!data[k]) return "empty"; if(isSundayDate(dt)&&p.hasMinutes) return "skip"; return pillarDone(p,data[k][p.id])?"yes":"no"; });
                const cnt=dots.filter(d=>d==="yes").length;
                return (
                  <div key={p.id} style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:140,fontFamily:serif,fontSize:13,color:C.ink,flexShrink:0}}>{p.label}</div>
                    <div style={{display:"flex",gap:5,flex:1}}>{dots.map((d,i)=><div key={i} style={{width:24,height:24,borderRadius:3,background:d==="yes"?(p.isWater?C.dustBluePale:C.sage):d==="skip"?C.parchment:d==="no"?C.parchment:"transparent",border:d==="empty"||d==="skip"?"none":"1px solid "+(d==="yes"?(p.isWater?C.dustBlue:C.sageDark):C.parchDark),opacity:d==="skip"?0.3:1}}/>)}</div>
                    <div style={{fontFamily:sans,fontSize:13,color:C.inkLight,width:28,textAlign:"right"}}>{cnt}/7</div>
                  </div>
                );
              })}
            </div>
            <SeasonalCard month={nowMonth}/>
          </>
        )}

        {view==="month"&&(
          <>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <NavBtn onClick={()=>setMonthOffset(m=>m-1)} label="Earlier" disabled={false}/>
              <div style={{fontFamily:serif,fontSize:15,color:C.ink}}>{monthLabel}</div>
              <NavBtn onClick={()=>setMonthOffset(m=>m+1)} label="Later" disabled={isCurrentMonth}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:6}}>
              {DAYS_SHORT.map(d=><div key={d} style={{fontFamily:sans,fontSize:11,color:C.inkLight,textAlign:"center",textTransform:"uppercase",letterSpacing:"0.05em"}}>{d}</div>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:28}}>
              {monthDays.map((dt,i)=>{
                if (!dt) return <div key={i}/>;
                const key=getDateKey(dt),score=dayScore(data,key),isTodayCell=key===getDateKey(TODAY),isFuture=dt>TODAY;
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

        {view==="why"&&(
          <div style={{display:"flex",flexDirection:"column",gap:0}}>
            <div style={{marginBottom:28}}>
              <h2 style={{fontFamily:serif,fontSize:24,fontWeight:400,color:C.ink,margin:"0 0 12px"}}>The idea behind Rhythm</h2>
              <p style={{fontFamily:sans,fontSize:15,color:C.inkMid,lineHeight:1.8,margin:0}}>Rhythm is not a diet app. It does not count calories, track macros, or reward streaks. It is a daily practice, a quiet check-in with the parts of life that matter most for long-term health and happiness. The goal is not perfection. It is rhythm.</p>
            </div>
            <div style={{height:1,background:C.parchDark,marginBottom:28}}/>
            <div style={{marginBottom:28}}>
              <h2 style={{fontFamily:serif,fontSize:24,fontWeight:400,color:C.ink,margin:"0 0 20px"}}>Four inspirations</h2>
              {WHY_INSPIRATIONS.map(item=>(
                <div key={item.label} style={{marginBottom:16,padding:"18px 20px",borderRadius:4,background:C.parchment,borderLeft:"3px solid "+item.color}}>
                  <h3 style={{fontFamily:serif,fontSize:18,fontWeight:400,color:item.fg,margin:"0 0 10px"}}>{item.label}</h3>
                  <p style={{fontFamily:sans,fontSize:14,color:C.inkMid,lineHeight:1.8,margin:0}}>{item.text}</p>
                </div>
              ))}
            </div>
            <div style={{height:1,background:C.parchDark,marginBottom:28}}/>
            <div style={{marginBottom:28}}>
              <h2 style={{fontFamily:serif,fontSize:24,fontWeight:400,color:C.ink,margin:"0 0 12px"}}>The 80% principle</h2>
              <p style={{fontFamily:sans,fontSize:15,color:C.inkMid,lineHeight:1.8,margin:0}}>In Okinawa, people say a phrase before every meal: hara hachi bu. It means eat until you are eight parts full. Rhythm applies the same principle to your whole day. Hitting 8 out of 10 pillars is a genuinely good day. Perfection is fragile. Consistency is sturdy. A day at 80% every day for a year is a transformed life.</p>
            </div>
            <div style={{height:1,background:C.parchDark,marginBottom:28}}/>
            <div>
              <h2 style={{fontFamily:serif,fontSize:24,fontWeight:400,color:C.ink,margin:"0 0 4px"}}>Ten pillars</h2>
              <p style={{fontFamily:sans,fontSize:14,color:C.inkLight,fontStyle:"italic",margin:"0 0 16px"}}>Tap any pillar to read about it.</p>
              {WHY_PILLARS.map(item=><WhyPillarItem key={item.label} label={item.label} text={item.text} tags={item.tags}/>)}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
