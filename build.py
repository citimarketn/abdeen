# -*- coding: utf-8 -*-
import re, sys
sys.path.insert(0,'.')
import catalog
s=open('base.html',encoding='utf-8').read()
def rep(old,new,n=1,label=''):
    global s
    c=s.count(old)
    if c!=n: raise SystemExit(f"MISMATCH {c}!={n}: {label or old[:120]}")
    s=s.replace(old,new)
def slice_replace(a,b,new,label):
    global s
    i=s.index(a); j=s.index(b,i)
    s=s[:i]+new+s[j:]
def line_replace(prefix,new,label):
    global s
    i=s.index(prefix); j=s.index('\n',i)
    s=s[:i]+new+s[j:]

# ---------- head ----------
rep('<meta name="description" content="Mazhar_Ali كنب وستائر وسجاد وإضاءة وديكور. السويس، مصر.">',
    '<meta name="description" content="عابدين – سوق إلكتروني لكل ما يحتاجه بيتك وعائلتك: أثاث، مواد غذائية، ملابس، إلكترونيات، خدمات وأكثر. السويس، مصر.">',label='meta')
rep('<title>Mazhar_Ali</title>','<title>عابدين</title>',label='title')
CSP=("default-src 'self'; script-src 'self' 'unsafe-inline' https://www.gstatic.com https://apis.google.com; "
     "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com data:; "
     "img-src 'self' data: blob: https:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.pythonanywhere.com; "
     "frame-src https://*.firebaseapp.com https://*.web.app https://accounts.google.com https://apis.google.com; object-src 'none'; base-uri 'none'; form-action 'self'")
s,n=re.subn(r'(<meta http-equiv="Content-Security-Policy" content=")[^"]*(")',lambda m:m.group(1)+CSP+m.group(2),s)
assert n==1,'csp'

# ---------- dead code cleanup ----------
s,n=re.subn(r"const HERO_SCENE=`.*?`;\n",'',s,flags=re.S); print('HERO_SCENE removed',n)
rep("const DEN={p:{},c:{}};\n","",label='DEN decl')
s=s.replace("||DEN.c[c.id]","")
s,n=re.subn(r"\|\|\(DEN\.p\[p\.id\]\|\|\{\}\)\.[nd]","",s); print('DEN.p refs',n)
assert 'DEN' not in s.replace('DENY',''),'DEN left'
if len(re.findall(r'\btmpImg\b',s))==1: s=s.replace("let tmpImg='';\n","")
rep("const pr=kind==='google'?new firebase.auth.GoogleAuthProvider():new firebase.auth.FacebookAuthProvider();",
    "if(kind!=='google')throw new Error('طريقة الدخول غير مدعومة');const pr=new firebase.auth.GoogleAuthProvider();",label='fb login removed')
rep("const m=760,","const m=700,",label='img size'); rep("c.toDataURL('image/jpeg',.8)","c.toDataURL('image/jpeg',.72)",label='img quality')
rep("style=\"${c.hex?`background:${c.hex}`:''}\"","style=\"${/^#[0-9a-fA-F]{6}$/.test(c.hex||'')?`background:${c.hex}`:''}\"",label='swatch hex guard')

# ---------- settings/default copy ----------
rep("shipping:0,leadOwn:'2-4',leadDrop:'7-14',","shipping:0,leadOwn:'2-4',leadDrop:'7-14',hours:'السبت – الخميس: 9 ص – 10 م\\nالجمعة: 2 م – 10 م',hours_en:'Sat – Thu: 9 AM – 10 PM\\nFri: 2 PM – 10 PM',",label='hours default')
line_replace("  const hT=","  const hT=LANG==='en'?(s.heroTitle_en||'Everything you need,\\nin one place'):(s.heroTitle||'كل ما تحتاجه\\nفي مكان واحد');",'hT')
line_replace("  const hS=","  const hS=LANG==='en'?(s.heroSubtitle_en||'Furniture, groceries, fashion, electronics, services and more — clear prices, delivered to your door.'):(s.heroSubtitle||'أثاث، مواد غذائية، ملابس، إلكترونيات، خدمات وأكثر — بأسعار واضحة وتوصيل لباب بيتك.');",'hS')
rep("نوفر المفروشات والديكور، ومستلزمات الأطفال والبيبي، والموضة، والجمال، وأدوات المنزل والمطبخ، بأسعار واضحة وخصومات على أصناف مختارة.",
    "نوفر الأثاث والمفروشات، والمواد الغذائية والخضروات والأسماك والعطارة، والملابس والأحذية، والإلكترونيات والأجهزة، والخدمات المنزلية والمهنية، ومستلزمات السيارات والدراجات، والعطور والتجميل، بأسعار واضحة وخصومات على أصناف مختارة.",label='about ar')
rep("We offer home furnishings and décor, kids & baby essentials, fashion, beauty, and home & kitchen goods, with clear pricing and discounts on selected items.",
    "We offer furniture and furnishings, groceries, produce, fresh fish and spices, clothing and shoes, electronics and appliances, home and professional services, car and bike supplies, and perfume and beauty — with clear pricing and discounts on selected items.",label='about en')

# ---------- DEF catalog ----------
line_replace("const P=(id,cat,","const _P=null;",'P helper')
slice_replace("  cats:[","  pages:{","  cats:"+catalog.cats_js()+",\n  products:"+catalog.products_js()+",\n","DEF cats/products")

# ---------- css ----------
rep(".cat-badge{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;flex:none;font-size:22px}",
    ".cat-badge{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;flex:none;font-size:22px;background:var(--surface2)}\n.cat-txt h3{font-size:16px;margin:0 0 3px}\n.cat-sub{font-size:13px;color:var(--mute);margin:0;line-height:1.5}\n.dot{display:inline-block;width:12px;height:12px;border-radius:50%;margin-inline-end:6px;border:1px solid var(--line);vertical-align:-1px}\n.flt{font-size:14px;margin-inline-end:4px}\n.feats{display:flex;gap:10px;flex-wrap:wrap}\n.chk{display:inline-flex;gap:4px;align-items:center;font-size:13px;white-space:nowrap}\n.chk input{width:auto;min-height:0}\n.hrs{margin-top:6px;line-height:1.7}",label='css extras')
rep(".cat-card h3{font-size:16px;margin-bottom:3px}\n.cat-card span{font-size:13px;color:var(--mute);display:block}\n","",label='old cat-card text css')

# ---------- helpers: features, private supplier data ----------
rep("const topCats=()=>","const catFeat=id=>{let c=catById(id);while(c){if(c.feat)return{kg:!!c.feat.kg,m:!!c.feat.m,colors:!!c.feat.colors,sizes:!!c.feat.sizes};c=c.parent?catById(c.parent):null}return{kg:true,m:true,colors:true,sizes:true}};\nconst topCats=()=>",label='catFeat')
rep("let FB=null,unsubOrders=null;","let FB=null,unsubOrders=null,unsubPriv=null;",label='unsubPriv')
rep("async function put(col,obj){","""async function putPriv(id,obj){
  if(FB){await FB.db.collection('productPrivate').doc(id).set(obj);return}
  S.priv[id]=obj;store.set('wd_priv',S.priv);
}
async function delPriv(id){
  if(FB){try{await FB.db.collection('productPrivate').doc(id).delete()}catch(e){console.warn(e)}return}
  delete S.priv[id];store.set('wd_priv',S.priv);
}
async function put(col,obj){""",label='priv helpers')
rep("  if(unsubOrders){unsubOrders();unsubOrders=null}\n","  if(unsubOrders){unsubOrders();unsubOrders=null}\n  if(unsubPriv){unsubPriv();unsubPriv=null}\n",label='unsub priv on user change')
rep("  const q=S.isAdmin?FB.db.collection('orders')","  if(S.isAdmin)unsubPriv=FB.db.collection('productPrivate').onSnapshot(sn=>{S.priv={};sn.docs.forEach(d=>S.priv[d.id]=d.data());softRender()},console.warn);else S.priv={};\n  const q=S.isAdmin?FB.db.collection('orders')",label='priv listener')
rep("    loadCart();loadLocalOrders();\n  }\n  render();","    loadCart();loadLocalOrders();S.priv=store.get('wd_priv',{});\n  }\n  render();",label='local priv load')
rep("await del('products',id),toast(","await del('products',id),await delPriv(id),toast(",label='prodDel priv')

# ---------- footer hours ----------
rep("<li>${esc(sv('address'))}</li>","<li>${esc(sv('address'))}</li><li class=\"hrs\"><b>مواعيد العمل</b><br>${esc(sv('hours')||'').split('\\n').join('<br>')}</li>",label='footer hours')
rep("<h3 style=\"font-size:17px;color:var(--tx);margin:22px 0 4px\">مدة التوصيل الافتراضية</h3>",
    "<h3 style=\"font-size:17px;color:var(--tx);margin:22px 0 4px\">مواعيد العمل</h3><div class=\"row2\"><label class=\"f\"><span>مواعيد العمل (عربي)</span><textarea name=\"hours\" maxlength=\"200\" style=\"min-height:70px\">${esc(s.hours||'')}</textarea></label><label class=\"f\"><span>Working hours (English)</span><textarea name=\"hours_en\" maxlength=\"200\" style=\"min-height:70px\" dir=\"ltr\">${esc(s.hours_en||'')}</textarea></label></div>\n    <h3 style=\"font-size:17px;color:var(--tx);margin:22px 0 4px\">مدة التوصيل الافتراضية</h3>",label='admin hours fields')
rep("leadOwn:String(d.leadOwn||'2-4').trim(),","hours:String(d.hours||'').trim(),hours_en:String(d.hours_en||'').trim(),leadOwn:String(d.leadOwn||'2-4').trim(),",label='FORM.store hours')
rep("'الوضع الليلي':'Dark mode',","'مواعيد العمل':'Working hours','الوضع الليلي':'Dark mode',",label='dict hours')

# ---------- vHome category cards ----------
line_replace("  const tiles=topCats()","  const TONES=['#E6F0FF','#FDE9F2','#FFF3D6','#E3F6EC','#E1F5F8','#EFE9FF','#FFEBDD'];const catSub=c=>childCats(c.id).map(cn).slice(0,4).join(L('، ',', '));\n  const tiles=topCats().map((c,i)=>`<a class=\"cat-card\" href=\"#/shop?c=${esc(c.id)}\"><div class=\"cat-badge\" style=\"background:${TONES[i%TONES.length]}\">${esc(c.icon||'🛍️')}</div><div class=\"cat-txt\"><h3>${esc(cn(c))}</h3><p class=\"cat-sub\">${esc(catSub(c))}</p></div></a>`).join('');",'tiles')
rep('<div class="tiles">${tiles}</div>','<div class="cat-cards">${tiles}</div>',label='tiles container')

open('stageA.html','w',encoding='utf-8').write(s)
print('stage A ok',len(s))
