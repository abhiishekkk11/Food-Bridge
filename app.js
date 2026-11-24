// FoodBridge – DEMO MODE (data lives in this browser's LocalStorage; passwords are NOT secure here)
const $=s=>document.querySelector(s),KEY='foodbridge_demo',uid=()=>Math.random().toString(36).slice(2,9);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=t=>new Date(t).toLocaleString([],{dateStyle:'medium',timeStyle:'short'});
const H=36e5;let tab='';
function seed(){const t=Date.now(),mk=(i,n,e,r,c)=>({id:i,name:n,email:e,password:'demo123',role:r,phone:'9876543210',city:c||'Bengaluru',address:'Sample address',org:n,verified:true});
 const dn=(n,d,s,v,st,o={})=>({id:uid(),donorId:'u1',name:n,desc:d,qty:s+' portions',servings:s,diet:v,prepared:t-3*H,deadline:t+5*H,storage:'Kept hot, covered',allergens:'None stated',location:'12 MG Road',city:'Bengaluru',status:st,sample:true,...o});
 const d={users:[mk('u1','Sample Spice Restaurant','donor@demo.com','donor'),mk('u2','Sample Hope Trust (NGO)','ngo@demo.com','ngo'),mk('u3','Sample Volunteer Asha','volunteer@demo.com','volunteer'),mk('u4','Admin','admin@demo.com','admin')],
 donations:[dn('Veg biryani','Surplus from lunch service',40,'veg','Available'),dn('Chapati & dal','Packed in boxes',25,'veg','Available',{city:'Mysuru',location:'5 Fort Rd'}),dn('Chicken curry & rice','Freshly cooked',30,'nonveg','Available'),
 dn('Sandwich trays','Event leftovers',50,'veg','Completed',{ngoId:'u2',volId:'u3',deadline:t-20*H}),dn('Idli & sambar','Hostel mess surplus',60,'veg','Completed',{ngoId:'u2',volId:'u3',deadline:t-40*H})],notifs:[],feedback:[]};
 localStorage.setItem(KEY,JSON.stringify(d));return d}
let db=JSON.parse(localStorage.getItem(KEY)||'null')||seed(),me=JSON.parse(localStorage.getItem(KEY+'_me')||'null');
const save=()=>localStorage.setItem(KEY,JSON.stringify(db)),U=id=>db.users.find(u=>u.id===id),D=id=>db.donations.find(d=>d.id===id);
const nm=id=>U(id)?.name||'—',notify=(to,msg)=>{db.notifs.push({id:uid(),to,msg,t:Date.now()});};
function toast(m,k=''){const e=document.createElement('div');e.className='toast '+k;e.textContent=m;$('#toasts').append(e);setTimeout(()=>e.remove(),3200)}
function theme(){const n=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=n;localStorage.setItem(KEY+'_t',n)}
document.documentElement.dataset.theme=localStorage.getItem(KEY+'_t')||'light';
const R={donor:[['mine','📦 My donations'],['add','➕ Add donation'],['notifs','🔔 Notifications']],ngo:[['browse','🔍 Browse food'],['mine','📋 My requests'],['notifs','🔔 Notifications']],
 volunteer:[['tasks','🚚 Open tasks'],['mine','✅ My deliveries'],['board','🏆 Leaderboard'],['notifs','🔔 Notifications']],admin:[['stats','📊 Analytics'],['users','👥 Users'],['dons','📦 Donations']]};
const live=d=>d.deadline>Date.now(),meals=()=>db.donations.filter(d=>d.status==='Completed').reduce((a,d)=>a+d.servings,0);
const b=(l,f,id,c='')=>`<button class="s ${c}" onclick="${f}('${id}')">${l}</button>`;
function card(d,a=''){return `<div class="card don">${pic(d)}<div class="row"><h3>${esc(d.name)}</h3><span class="tag ${d.status.replace(/ /g,'')}">${d.status}</span></div>
<p class="mu">${esc(d.desc)}</p><p>${d.diet==='veg'?'🟢 Veg':'🔴 Non-veg'} • 🍽 ${d.servings} servings • ${esc(d.qty)}</p>
<p class="mu">📍 ${esc(d.location)}, ${esc(d.city)}<br>Prepared ${fmt(d.prepared)}<br>Safe pickup by <b>${fmt(d.deadline)}</b><br>Storage: ${esc(d.storage||'—')}<br>Allergens: ${esc(d.allergens||'none stated')}<br>Donor: ${esc(nm(d.donorId))}${d.ngoId?'<br>NGO: '+esc(nm(d.ngoId)):''}${d.volId?'<br>Volunteer: '+esc(nm(d.volId)):''}</p>
${d.sample?'<small>Sample data</small>':''}<div class="acts">${a}</div></div>`}
const SAFE='<div class="warn">⚠ Food safety: FoodBridge does not certify food as safe. Check preparation time, pickup deadline, storage and allergens, and use your own judgement before serving.</div>';
const empty=m=>`<div class="card mu">${m}</div>`;
// ---------- pages
function goTo(id){if((location.hash||'#home')!=='#home')location.hash='home';setTimeout(()=>document.getElementById(id)?.scrollIntoView({behavior:'smooth'}),80)}
function nav(){return `<nav><a class="nb" href="#home"><span class="logo">🌉</span>FoodBridge</a><span class="sp"></span><a class="nl" onclick="goTo('how')">How it works</a><a class="nl" onclick="goTo('impact')">Impact</a><a class="nl" onclick="goTo('featured')">Donations</a><a class="nl" onclick="theme()" title="Toggle dark mode">🌓</a>${me?'<button class="s" onclick="location.hash=\'app\'">Dashboard</button>':'<a class="nl" href="#login">Log in</a><button class="s" onclick="location.hash=\'register\'">Join FoodBridge</button>'}</nav>`}
const ICON=[[/chicken|meat|kebab/i,'🍗'],[/biryani|rice|pulao/i,'🍛'],[/chapati|roti|dal|paratha/i,'🫓'],[/sandwich|bread|burger/i,'🥪'],[/idli|dosa|sambar/i,'🍚'],[/salad|veg/i,'🥗'],[/fruit/i,'🍎'],[/cake|sweet|dessert/i,'🍰'],[/pizza/i,'🍕'],[/pasta|noodle/i,'🍝']];
// Add an optional d.img (e.g. 'images/biryani.jpg') to a donation to show a real photo instead of the illustration.
const pic=d=>d.img?`<div class="ph"><img src="${esc(d.img)}" alt="${esc(d.name)}" loading="lazy"></div>`:`<div class="ph ${d.diet}"><span aria-hidden="true">${(ICON.find(x=>x[0].test(d.name))||[0,'🍱'])[1]}</span></div>`;
function initCounters(){const nb=document.querySelector('nav');if(nb&&!window._sc){window._sc=1;addEventListener('scroll',()=>document.querySelector('nav')?.classList.toggle('sc',scrollY>8),{passive:true})}
 const els=document.querySelectorAll('[data-n]');if(!els.length||matchMedia('(prefers-reduced-motion:reduce)').matches||!('IntersectionObserver' in window))return;
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;io.unobserve(e.target);const el=e.target,n=+el.dataset.n,s=el.dataset.s||'',t0=performance.now();
  (function f(t){const p=Math.min((t-t0)/1400,1);el.textContent=Math.round(n*(1-Math.pow(1-p,3)))+s;if(p<1)requestAnimationFrame(f)})(t0)}),{threshold:.4});els.forEach(e=>io.observe(e))}
function home(){const f=db.donations.filter(d=>d.status==='Available'&&live(d)).slice(0,3),ad=new Set(db.donations.filter(d=>d.status!=='Cancelled').map(d=>d.donorId)).size,go=me?'app':'register';
 const st=[['🍲','Donors list surplus','Add what you have with prep time, pickup deadline, storage and allergens.'],['🤝','NGOs request it','Browse food by city and diet, then send a request. The donor accepts or declines.'],['🚚','Volunteers deliver','A volunteer collects and delivers when the NGO cannot pick up.'],['📈','Impact is counted','Every completed donation updates the meals shared automatically.']];
 const qs=[['Listing leftover food takes two minutes, and we can see exactly where it goes.','Restaurant manager'],['Deadlines and allergen details on every listing help us decide quickly.','NGO coordinator'],['I pick up a task, follow the steps, and mark it delivered.','Volunteer']];
 return `<header class="hero"><div class="ht"><span class="pill">🌱 Food rescue platform</span><h1>Share Food. Reduce Waste. Feed Hope.</h1>
 <p class="lead">FoodBridge connects restaurants, hotels, hostels and event organisers who have surplus edible food with NGOs and volunteers who can get it to people who need it.</p>
 <div class="acts"><button onclick="location.hash='${go}'">Donate food</button><button class="o" onclick="location.hash='${go}'">Find food</button></div><p class="trust">Free to use • Pickup deadlines and allergen details on every listing</p></div>
 <div class="hv" aria-hidden="true"><div class="blob"></div><svg class="bowl" viewBox="0 0 320 320"><circle cx="160" cy="175" r="128" fill="#fff" opacity=".92"/><path d="M60 170h200a100 100 0 0 1-200 0z" fill="#1f8a4c"/><rect x="52" y="164" width="216" height="12" rx="6" fill="#0f3d2a"/><circle cx="108" cy="148" r="22" fill="#f2a93b"/><circle cx="160" cy="134" r="27" fill="#e8663d"/><circle cx="214" cy="148" r="22" fill="#7cc576"/><g class="steam" stroke="#1f8a4c" stroke-width="6" fill="none" stroke-linecap="round"><path d="M128 96q-12-20 0-40M160 88q-12-24 0-48M192 96q-12-20 0-40"/></g><path d="M160 258l-30-28a17 17 0 0 1 30-17 17 17 0 0 1 30 17z" fill="#fff"/></svg>
 <div class="fl f1">✅ Meals delivered<small>Illustration</small></div><div class="fl f2">🚚 Pickup assigned</div></div></header>
 <section id="how"><div class="sh"><h2>From surplus to a shared meal</h2><p>Four simple steps, tracked from listing to delivery.</p></div><div class="grid">${st.map(x=>`<div class="card step"><div class="ic">${x[0]}</div><h3>${x[1]}</h3><p class="mu">${x[2]}</p></div>`).join('')}</div></section>
 <div class="imp" id="impact"><div><b data-n="${meals()}">${meals()}</b><span>meals donated</span></div><div><b data-n="${Math.round(meals()*.4)}" data-s=" kg">${Math.round(meals()*.4)} kg</b><span>food saved (estimated at 0.4 kg per serving)</span></div><div><b data-n="${ad}">${ad}</b><span>active donors</span></div><div><b data-n="${db.users.length}">${db.users.length}</b><span>community members</span></div></div>
 <section id="featured"><div class="sh"><h2>Food available now</h2><p>Fresh listings from donors. Sample data in this demo.</p></div><div class="grid">${f.map(d=>card(d,`<button class="s" onclick="location.hash='${me?'app':'login'}'">View and request</button>`)).join('')||empty('No donations available right now. Check back soon.')}</div></section>
 <section><div class="sh"><h2>Built for everyone in the chain</h2></div><div class="two"><div class="card"><h3>For donors</h3><ul><li>Publish surplus in minutes</li><li>Accept or decline each request</li><li>Follow every donation to completion</li></ul></div><div class="card"><h3>For NGOs and volunteers</h3><ul><li>Search food by city and diet</li><li>See safe-pickup deadlines upfront</li><li>Pick up tasks and update status</li></ul></div></div></section>
 <section><div class="sh"><h2>What people say</h2><p>Sample testimonials for this demo, not real customers.</p></div><div class="grid">${qs.map(x=>`<div class="card"><p class="q">“${x[0]}”</p><small>${x[1]} • sample</small></div>`).join('')}</div></section>
 <div class="cta"><div><h2>Ready to turn surplus into meals?</h2><p>Create a free account in under a minute.</p></div><button class="lt" onclick="location.hash='${go}'">Join FoodBridge</button></div>
 <footer><div class="fg"><div><b>🌉 FoodBridge</b>Share Food. Reduce Waste. Feed Hope.<br>contact@foodbridge.example (placeholder)</div><div><b>Platform</b><a onclick="goTo('how')">How it works</a><a onclick="goTo('featured')">Donations</a></div><div><b>Account</b><a href="#login">Log in</a><a href="#register">Join</a></div></div>FoodBridge does not certify food as safe. Always check preparation time, storage and allergens. Demo build: all data is sample data.</footer>`}
function authPage(m){const dm=['donor','ngo','volunteer','admin'].map(r=>`<button type="button" class="o s" onclick="quick('${r}')">${r}</button>`).join(' ');
 if(m==='login')return `<div class="auth"><h2>Log in</h2><form onsubmit="return doLogin(event)"><label>Email<input name="email" type="email" required></label><label>Password<input name="password" type="password" required></label><button>Log in</button></form>
 <p class="mu">Demo accounts (password demo123):</p><div class="acts">${dm}</div><p>New here? <a href="#register">Create an account</a></p></div>`;
 return `<div class="auth"><h2>Create your account</h2><form onsubmit="return doReg(event)"><label>I am a<select name="role"><option value="donor">Food donor</option><option value="ngo">NGO / charity</option><option value="volunteer">Volunteer</option></select></label>
 <label>Full name<input name="name" required></label><label>Organisation (donors and NGOs)<input name="org"></label><label>Email<input name="email" type="email" required></label><label>Password (6+ characters)<input name="password" type="password" minlength="6" required></label>
 <label>Phone (10 digits)<input name="phone" required></label><label>City<input name="city" required></label><label>Address<input name="address" required></label><button>Create account</button></form><p class="mu">Admin accounts are created by the platform team only.</p></div>`}
function doReg(e){e.preventDefault();const f=Object.fromEntries(new FormData(e.target));f.email=f.email.trim().toLowerCase();
 if(!/^[6-9]\d{9}$/.test(f.phone))return toast('Enter a valid 10-digit Indian mobile number','err'),false;
 if(db.users.some(u=>u.email===f.email))return toast('That email is already registered','err'),false;
 if(f.role!=='volunteer'&&!f.org.trim())return toast('Organisation name is required','err'),false;
 const u={id:uid(),...f,verified:false};db.users.push(u);save();signIn(u);return false}
function doLogin(e){e.preventDefault();const f=Object.fromEntries(new FormData(e.target)),u=db.users.find(x=>x.email===f.email.trim().toLowerCase()&&x.password===f.password);
 if(!u)toast('Wrong email or password','err');else signIn(u);return false}
const quick=r=>signIn(db.users.find(u=>u.role===r));
function signIn(u){me=u;tab='';localStorage.setItem(KEY+'_me',JSON.stringify(u));toast('Welcome, '+u.name);location.hash='app';render()}
function logout(){me=null;localStorage.removeItem(KEY+'_me');location.hash='home';render()}
const go=t=>{tab=t;render()},resetDemo=()=>{if(confirm('Reset all demo data?')){localStorage.removeItem(KEY);db=seed();logout()}};
function dash(){me=U(me.id)||me;if(!R[me.role].some(t=>t[0]===tab))tab=R[me.role][0][0];
 const title=R[me.role].find(t=>t[0]===tab)[1];
 return `<div class="dash"><aside><div class="brand">🌉 FoodBridge</div><small>${esc(me.name)}<br>${me.role}${me.verified?' ✔ verified':' (unverified)'}</small>${R[me.role].map(([k,l])=>`<a class="${k===tab?'on':''}" onclick="go('${k}')">${l}</a>`).join('')}<a onclick="theme()">🌓 Theme</a><a href="#home">🏠 Home</a><a onclick="resetDemo()">♻ Reset demo</a><a onclick="logout()">🚪 Log out</a></aside><main><h2>${title}</h2>${V[me.role+'_'+tab]()}</main></div>`}
// ---------- workflow
function setS(id,s,from,msg,to){const d=D(id);if(!d||!from.includes(d.status))return toast('That donation has already changed','err'),render();d.status=s;if(msg)notify(to(d),msg+' – '+d.name);save();toast(s);render();return d}
const reqFood=id=>{const d=D(id);if(!me.verified&&!confirm('Your NGO is not verified yet. Request anyway?'))return;if(d&&d.status==='Available'){d.ngoId=me.id;}setS(id,'Requested',['Available'],me.name+' requested your food',d=>d.donorId)};
const decide=(id,ok)=>{const d=D(id);if(ok)setS(id,'Accepted',['Requested'],'Your request was accepted',d=>d.ngoId);else{const n=d.ngoId;if(setS(id,'Available',['Requested'],'Your request was declined',()=>n)){d.ngoId=null;save();render()}}};
const acc=id=>decide(id,true),rej=id=>decide(id,false);
const cancel=id=>confirm('Cancel this donation?')&&setS(id,'Cancelled',['Available','Requested'],'Donation cancelled',d=>d.ngoId||d.donorId);
const take=id=>{const d=setS(id,'Pickup Assigned',['Accepted'],'Volunteer '+me.name+' will collect',d=>d.donorId);if(d){d.volId=me.id;save()}};
const pick=id=>setS(id,'Picked Up',['Pickup Assigned'],'Food picked up',d=>d.ngoId);
const deliv=id=>setS(id,'Delivered',['Picked Up'],'Food delivered',d=>d.ngoId);
const done=id=>{const d=setS(id,'Completed',['Delivered','Accepted'],'Donation completed',d=>d.donorId);if(d){const r=+prompt('Rate the donor 1-5 (optional)','5');if(r>=1&&r<=5)db.feedback.push({id:uid(),donation:id,from:me.id,to:d.donorId,rating:r});save()}};
const verify=id=>{const u=U(id);u.verified=!u.verified;save();render()};
// ---------- views
const mineD=()=>db.donations.filter(d=>d.donorId===me.id).reverse();
const V={
 donor_mine:()=>mineD().map(d=>card(d,d.status==='Requested'?b('Accept request','acc',d.id)+b('Decline','rej',d.id,'o'):'')+'').map((h,i)=>h.replace('</div></div>',(['Available','Requested'].includes(mineD()[i].status)?b('Cancel','cancel',mineD()[i].id,'r'):'')+'</div></div>')).join('')||empty('No donations yet. Use “Add donation” to list surplus food.'),
 donor_add:()=>SAFE+`<form class="card" onsubmit="return addDon(event)"><label>Food name<input name="name" required></label><label>Description<textarea name="desc" required></textarea></label><label>Quantity (e.g. 3 trays)<input name="qty" required></label><label>Servings<input name="servings" type="number" min="1" required></label>
 <label>Type<select name="diet"><option value="veg">Vegetarian</option><option value="nonveg">Non-vegetarian</option></select></label><label>Prepared on<input name="prepared" type="datetime-local" required></label><label>Safe pickup deadline<input name="deadline" type="datetime-local" required></label>
 <label>Storage conditions<input name="storage" required></label><label>Allergens (or “none”)<input name="allergens" required></label><label>Pickup address<input name="location" value="${esc(me.address)}" required></label><button>Publish donation</button></form>`,
 donor_notifs:()=>notifs(),ngo_notifs:()=>notifs(),volunteer_notifs:()=>notifs(),
 ngo_browse:()=>SAFE+`<div class="card row"><input id="q" placeholder="Search food or city" oninput="filt()"><select id="dt" onchange="filt()"><option value="">All types</option><option value="veg">Veg</option><option value="nonveg">Non-veg</option></select></div><div id="res">${browse()}</div>`,
 ngo_mine:()=>db.donations.filter(d=>d.ngoId===me.id).reverse().map(d=>card(d,d.status==='Accepted'?b('Mark received (self pickup)','done',d.id):d.status==='Delivered'?b('Confirm received','done',d.id):'')).join('')||empty('You have not requested any food yet.'),
 volunteer_tasks:()=>db.donations.filter(d=>d.status==='Accepted'&&!d.volId&&live(d)).map(d=>card(d,b('Accept pickup','take',d.id))).join('')||empty('No pickups waiting. Tasks appear after a donor accepts an NGO request.'),
 volunteer_mine:()=>db.donations.filter(d=>d.volId===me.id).reverse().map(d=>card(d,(d.status==='Pickup Assigned'?b('Mark picked up','pick',d.id):d.status==='Picked Up'?b('Mark delivered','deliv',d.id):'')+`<small>Drop-off: ${esc(nm(d.ngoId))}, ${esc(U(d.ngoId)?.address||'')}</small>`)).join('')||empty('No deliveries yet.'),
 volunteer_board:()=>{const c={};db.donations.filter(d=>d.volId&&['Delivered','Completed'].includes(d.status)).forEach(d=>c[d.volId]=(c[d.volId]||0)+1);
  return `<div class="card"><table>${Object.entries(c).sort((a,b)=>b[1]-a[1]).map(([i,n],k)=>`<tr><td>${k+1}</td><td>${esc(nm(i))}</td><td>${n} deliveries</td></tr>`).join('')||'<tr><td>No deliveries yet</td></tr>'}</table></div>`},
 admin_stats:()=>{const c=r=>db.users.filter(u=>u.role===r).length,s=[['Users',db.users.length],['Donors',c('donor')],['NGOs',c('ngo')],['Volunteers',c('volunteer')],['Donations',db.donations.length],['Pending requests',db.donations.filter(d=>d.status==='Requested').length],['Completed',db.donations.filter(d=>d.status==='Completed').length],['Meals shared',meals()],['Avg rating',db.feedback.length?(db.feedback.reduce((a,f)=>a+f.rating,0)/db.feedback.length).toFixed(1):'–']];
  return `<div class="grid">${s.map(x=>`<div class="card"><small>${x[0]}</small><h1>${x[1]}</h1></div>`).join('')}</div>`},
 admin_users:()=>`<div class="card"><table><tr><th>Name</th><th>Role</th><th>City</th><th></th></tr>${db.users.map(u=>`<tr><td>${esc(u.name)}</td><td>${u.role}</td><td>${esc(u.city)}</td><td>${u.role==='admin'?'':b(u.verified?'Unverify':'Verify','verify',u.id,u.verified?'o':'')}</td></tr>`).join('')}</table></div>`,
 admin_dons:()=>`<div class="card"><table><tr><th>Food</th><th>Donor</th><th>NGO</th><th>Status</th></tr>${db.donations.map(d=>`<tr><td>${esc(d.name)}</td><td>${esc(nm(d.donorId))}</td><td>${esc(nm(d.ngoId))}</td><td>${d.status}</td></tr>`).join('')}</table></div>`};
const notifs=()=>db.notifs.filter(n=>n.to===me.id).reverse().map(n=>`<div class="card">${esc(n.msg)}<br><small>${fmt(n.t)}</small></div>`).join('')||empty('No notifications yet.');
function browse(){const q=($('#q')?.value||'').toLowerCase(),t=$('#dt')?.value||'';
 return db.donations.filter(d=>d.status==='Available'&&live(d)&&(!t||d.diet===t)&&(d.name+d.city+d.location).toLowerCase().includes(q)).map(d=>card(d,b('Request this food','reqFood',d.id))).join('')||empty('No available food matches. Try a different search.')}
const filt=()=>$('#res').innerHTML=browse();
function addDon(e){e.preventDefault();const f=Object.fromEntries(new FormData(e.target)),p=new Date(f.prepared).getTime(),k=new Date(f.deadline).getTime();
 if(k<=p)return toast('Pickup deadline must be after preparation time','err'),false;if(k<=Date.now())return toast('Pickup deadline must be in the future','err'),false;
 db.donations.push({id:uid(),donorId:me.id,...f,servings:+f.servings,prepared:p,deadline:k,city:me.city,status:'Available',created:Date.now()});save();toast('Donation published');tab='mine';render();return false}
function render(){const h=location.hash.slice(1)||'home';let o;
 if(h==='app'){if(!me){location.hash='login';return}o=dash()}else o=nav()+(h==='login'||h==='register'?authPage(h):home());
 $('#app').innerHTML=o;initCounters()}
window.onhashchange=()=>{window.scrollTo(0,0);render()};render();
