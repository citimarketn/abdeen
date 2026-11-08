# -*- coding: utf-8 -*-
import json
def F(kg=False,m=False,colors=False,sizes=False): return {"kg":kg,"m":m,"colors":colors,"sizes":sizes}
# (id, name, name_en, parent, icon, feat)
CATS=[
("c1","أثاث وديكور ومفروشات","Furniture, Décor & Furnishings",None,"🛋️",F(colors=True)),
("c11","كنب وركنات","Sofas & Corner Units","c1","",None),("c12","غرف النوم","Bedroom","c1","",None),
("c13","الستائر والأقمشة","Curtains & Fabrics","c1","",F(m=True,colors=True)),("c14","السجاد والموكيت","Rugs & Carpets","c1","",F(m=True,colors=True)),
("c15","الإضاءة","Lighting","c1","",None),("c16","مفارش وبياضات","Bedding & Linens","c1","",F(colors=True,sizes=True)),
("c17","ديكور ومرايا","Décor & Mirrors","c1","",None),("c18","طاولات ووحدات تلفزيون","Tables & TV Units","c1","",None),
("c2","مواد غذائية وسوبر ماركت وعطارة وأسماك","Groceries, Spices & Fresh Fish",None,"🧺",F(kg=True)),
("c21","خضروات وفاكهة","Fruits & Vegetables","c2","",None),("c22","عطارة وتوابل","Spices & Herbs","c2","",None),
("c23","أسماك طازجة","Fresh Fish & Seafood","c2","",None),("c24","سوبر ماركت","Supermarket Essentials","c2","",None),
("c3","ملابس وموضة وأحذية","Clothing, Fashion & Shoes",None,"👕",F(colors=True,sizes=True)),
("c31","ملابس رجالي","Men's Clothing","c3","",None),("c32","ملابس حريمي","Women's Clothing","c3","",None),
("c33","ملابس أطفال","Kids' Clothing","c3","",None),("c34","أحذية","Shoes","c3","",None),
("c35","إكسسوارات وحقائب","Accessories & Bags","c3","",F(colors=True)),
("c4","إلكترونيات وأجهزة كهربائية وصيانة","Electronics, Appliances & Repairs",None,"💻",F(colors=True)),
("c41","هواتف وإكسسوارات","Phones & Accessories","c4","",None),("c42","أجهزة منزلية","Home Appliances","c4","",None),
("c43","كابلات وقطع غيار","Cables & Spare Parts","c4","",F(m=True)),
("c5","خدمات عامة ومهنية","General & Professional Services",None,"🛠️",F()),
("c51","سباكة وكهرباء","Plumbing & Electrical","c5","",None),("c52","مقاولات وتشطيبات","Contracting & Finishing","c5","",F(m=True)),
("c53","نظافة وصيانة منزلية","Cleaning & Home Care","c5","",None),
("c6","خدمات ومستلزمات سيارات ودراجات","Car & Bike Services & Supplies",None,"🚗",F(colors=True)),
("c61","قطع غيار سيارات","Car Spare Parts","c6","",None),("c62","زيوت وصيانة","Oils & Maintenance","c6","",None),
("c63","إكسسوارات سيارات","Car Accessories","c6","",None),("c64","دراجات ومستلزماتها","Bikes & Gear","c6","",F(colors=True,sizes=True)),
("c7","عطور وعناية وتجميل","Perfume, Care & Beauty",None,"💄",F(colors=True)),
("c71","عطور","Perfumes","c7","",None),("c72","عناية بالبشرة والشعر","Skin & Hair Care","c7","",F()),
("c73","مكياج","Makeup","c7","",None),
]
def co(n,h=""): return {"name":n,"hex":h}
RED,BLK,WHT,BLU,GRN,GRY,BEI,NAV=("#C0392B","#1B1B1B","#F5F5F5","#2E5C8A","#2E7D4F","#8D9499","#D9C6A5","#1F2A44")
# (id, cat, name, name_en, price, old, desc, desc_en, opts)
P=[
("p1","c11","كنبة ثلاثية مقاعد – قطيفة","3-Seat Velvet Sofa",18500,22000,"كنبة ثلاثية المقاعد بتصميم عصري وجلسة مريحة.","A 3-seat sofa with a modern design and comfortable seating.",{"colors":[co("رمادي",GRY),co("بيج",BEI),co("أخضر",GRN)]}),
("p2","c11","ركنة حرف L – 5 مقاعد","L-Shaped Corner Sofa – 5 Seats",34900,39500,"ركنة واسعة تناسب العائلة الكبيرة.","A spacious corner sofa for larger families.",{"colors":[co("رمادي",GRY),co("بيج",BEI)]}),
("p3","c11","فوتيه استقبال","Accent Armchair",6800,0,"فوتيه مفرد يضيف لمسة أنيقة لأي ركن.","A single armchair that adds an elegant touch to any corner.",{"colors":[co("أزرق",BLU),co("بيج",BEI)]}),
("p4","c12","سرير مقاس 180 سم","Bed Frame – 180cm",16500,19000,"سرير مزدوج بمقدمة عالية ومساحة نوم مريحة.","A double bed with a tall headboard and comfortable sleeping space.",{}),
("p5","c12","دولاب 4 ضلف","4-Door Wardrobe",21900,0,"دولاب واسع بأربع ضلف لتنظيم الملابس.","A spacious 4-door wardrobe for organizing clothes.",{}),
("p6","c12","كومودينو بدُرجين","2-Drawer Nightstand",2450,2900,"كومودينو عملي بدُرجين بجانب السرير.","A practical 2-drawer nightstand.",{}),
("p7","c13","ستارة بلاك أوت (طقم)","Blackout Curtain Set",1250,1600,"ستارة تحجب الضوء وتمنح غرفتك خصوصية.","Light-blocking curtains for privacy and calm.",{"colors":[co("رمادي",GRY),co("كحلي",NAV),co("بيج",BEI)]}),
("p8","c13","قماش ستائر قطيفة بالمتر","Velvet Curtain Fabric (per meter)",180,0,"قماش قطيفة فاخر بعرض 280 سم يُباع بالمتر الطولي.","Premium velvet fabric, 280cm wide, sold per running meter.",{"unit":"m","colors":[co("عنابي","#7A2E3A"),co("أخضر",GRN),co("كحلي",NAV)]}),
("p9","c14","سجادة 200×300 سم","Area Rug 200×300cm",3200,3900,"سجادة كبيرة بنقشة كلاسيكية لغرف المعيشة.","A large rug with a classic pattern for living rooms.",{"colors":[co("بيج",BEI),co("رمادي",GRY)]}),
("p10","c14","موكيت ممرات بالمتر","Hallway Carpet Runner (per meter)",95,0,"موكيت ممرات عرض 100 سم مقاوم للاستخدام اليومي.","Hard-wearing 100cm-wide hallway carpet, sold per meter.",{"unit":"m","colors":[co("رمادي",GRY),co("أسود",BLK)]}),
("p11","c15","أباجورة أرضية","Floor Lamp",1750,0,"أباجورة أرضية بإضاءة دافئة لركن القراءة.","A floor lamp with warm lighting for a reading corner.",{}),
("p12","c15","نجفة 6 شعلات","6-Light Chandelier",4900,5900,"نجفة أنيقة تمنح الصالة إضاءة فاخرة.","An elegant chandelier that lights up the living room.",{}),
("p13","c16","طقم مفرش سرير 3 قطع","3-Piece Bed Cover Set",1650,0,"طقم مفرش سرير كامل بألوان هادئة.","A complete bed cover set in calm colors.",{"colors":[co("أبيض",WHT),co("رمادي",GRY),co("بيج",BEI)],"sizes":["مفرد","مزدوج","كينج"]}),
("p14","c17","مرآة قوس كبيرة","Large Arch Mirror",2100,0,"مرآة بشكل قوس بإطار أنيق.","An arch-shaped mirror with an elegant frame.",{}),
("p15","c17","لوحات حائط – 3 قطع","3-Piece Wall Art Set",890,1100,"طقم ثلاث لوحات بإطارات جاهزة للتعليق.","Three framed pieces, ready to hang.",{}),
("p16","c18","ترابيزة وسط","Coffee Table",3600,0,"ترابيزة وسط بسطح واسع.","A coffee table with a wide top.",{}),
("p17","c18","وحدة تلفزيون","TV Unit",5400,6300,"وحدة تلفزيون بمساحات تخزين متعددة.","A TV unit with multiple storage spaces.",{}),
("p20","c21","طماطم طازجة","Fresh Tomatoes",18,0,"طماطم بلدي طازجة تُباع بالكيلو.","Fresh local tomatoes, sold per kg.",{"unit":"kg","stock":300}),
("p21","c21","بطاطس","Potatoes",22,0,"بطاطس مصرية للطبخ والتحمير.","Egyptian potatoes for cooking and frying.",{"unit":"kg","stock":300}),
("p22","c21","موز بلدي","Local Bananas",35,0,"موز بلدي ناضج.","Ripe local bananas.",{"unit":"kg","stock":200}),
("p23","c21","تفاح أحمر","Red Apples",60,70,"تفاح أحمر مستورد.","Imported red apples.",{"unit":"kg","stock":150}),
("p24","c22","كمون مطحون","Ground Cumin",280,0,"كمون مطحون طازج يُباع بالكيلو.","Freshly ground cumin, sold per kg.",{"unit":"kg","stock":40}),
("p25","c22","فلفل أسود مطحون","Ground Black Pepper",420,0,"فلفل أسود مطحون عالي الجودة.","High-quality ground black pepper.",{"unit":"kg","stock":30}),
("p26","c22","ينسون","Anise",190,0,"ينسون بلدي للمشروبات الساخنة.","Local anise for hot drinks.",{"unit":"kg","stock":30}),
("p27","c23","بلطي طازج","Fresh Tilapia",95,0,"سمك بلطي طازج يُباع بالكيلو، يُنظف عند الطلب.","Fresh tilapia sold per kg, cleaned on request.",{"unit":"kg","stock":80,"lead":"1-2"}),
("p28","c23","جمبري متوسط","Medium Shrimp",380,420,"جمبري متوسط الحجم طازج.","Fresh medium-size shrimp.",{"unit":"kg","stock":40,"lead":"1-2"}),
("p29","c23","سمك دنيس","Sea Bream",260,0,"سمك دنيس طازج.","Fresh sea bream.",{"unit":"kg","stock":40,"lead":"1-2"}),
("p30","c24","أرز أبيض مصري","Egyptian White Rice",34,0,"أرز أبيض مصري يُباع بالكيلو.","Egyptian white rice, sold per kg.",{"unit":"kg","stock":500}),
("p31","c24","سكر","Sugar",30,0,"سكر أبيض ناعم.","Fine white sugar.",{"unit":"kg","stock":500}),
("p32","c24","زيت عباد الشمس 1 لتر","Sunflower Oil 1L",72,80,"زيت عباد الشمس للطبخ.","Sunflower cooking oil.",{"stock":200}),
("p33","c24","مكرونة 400 جم","Pasta 400g",14,0,"مكرونة مصرية.","Egyptian pasta.",{"stock":400}),
("p40","c31","تيشيرت قطن رجالي","Men's Cotton T-Shirt",250,320,"تيشيرت قطن 100% بقصة مريحة.","100% cotton t-shirt with a comfortable fit.",{"colors":[co("أسود",BLK),co("أبيض",WHT),co("كحلي",NAV)],"sizes":["S","M","L","XL","XXL"]}),
("p41","c31","قميص كلاسيك رجالي","Men's Classic Shirt",420,0,"قميص كلاسيك بخامة ناعمة.","A classic shirt in a soft fabric.",{"colors":[co("أبيض",WHT),co("أزرق",BLU)],"sizes":["M","L","XL","XXL"]}),
("p42","c31","بنطلون جينز رجالي","Men's Jeans",550,0,"بنطلون جينز بقصة مستقيمة.","Straight-cut denim jeans.",{"colors":[co("أزرق",BLU),co("أسود",BLK)],"sizes":["30","32","34","36","38"]}),
("p43","c32","فستان صيفي حريمي","Women's Summer Dress",680,850,"فستان صيفي خفيف.","A light summer dress.",{"colors":[co("أحمر",RED),co("أخضر",GRN),co("بيج",BEI)],"sizes":["S","M","L","XL"],"src":"drop","lead":"5-9"}),
("p44","c32","عباية سادة","Plain Abaya",750,0,"عباية سادة بقصة واسعة.","A plain abaya with a relaxed cut.",{"colors":[co("أسود",BLK),co("كحلي",NAV)],"sizes":["52","54","56","58"]}),
("p45","c33","طقم أطفال قطن","Kids' Cotton Set",320,400,"طقم أطفال قطن ناعم.","A soft cotton set for kids.",{"colors":[co("أزرق",BLU),co("أحمر",RED)],"sizes":["2 سنة","4 سنوات","6 سنوات","8 سنوات"]}),
("p46","c34","حذاء رياضي","Running Shoes",950,1200,"حذاء رياضي خفيف للجري.","Lightweight running shoes.",{"colors":[co("أسود",BLK),co("رمادي",GRY)],"sizes":["40","41","42","43","44","45"]}),
("p47","c34","صندل حريمي","Women's Sandals",380,0,"صندل حريمي مريح.","Comfortable women's sandals.",{"colors":[co("بيج",BEI),co("أسود",BLK)],"sizes":["36","37","38","39","40","41"]}),
("p48","c35","حقيبة يد حريمي","Women's Handbag",620,0,"حقيبة يد أنيقة.","An elegant handbag.",{"colors":[co("أسود",BLK),co("بيج",BEI),co("أحمر",RED)]}),
("p49","c35","ساعة يد","Wrist Watch",780,0,"ساعة يد بتصميم كلاسيكي.","A classic-design wrist watch.",{"colors":[co("أسود",BLK),co("بني","#6B4A2F")],"src":"drop","lead":"6-10"}),
("p50","c41","جراب هاتف شفاف","Clear Phone Case",90,120,"جراب شفاف مقاوم للصدمات.","A shock-resistant clear case.",{"colors":[co("شفاف","#E8EEF2"),co("أسود",BLK)],"src":"drop","lead":"5-9"}),
("p51","c41","شاحن سريع 25 وات","25W Fast Charger",260,0,"شاحن سريع بمنفذ USB-C.","25W USB-C fast charger.",{}),
("p52","c41","سماعة بلوتوث","Bluetooth Earbuds",480,650,"سماعة لاسلكية بعلبة شحن.","Wireless earbuds with a charging case.",{"colors":[co("أسود",BLK),co("أبيض",WHT)],"src":"drop","lead":"6-10"}),
("p53","c41","باور بانك 20000","20,000 mAh Power Bank",520,0,"باور بانك بسعة 20000 مللي أمبير.","A 20,000 mAh power bank.",{"colors":[co("أسود",BLK),co("أبيض",WHT)]}),
("p54","c42","خلاط كهربائي 600 وات","600W Blender",950,0,"خلاط بقوة 600 وات وإبريق زجاجي.","A 600W blender with a glass jug.",{}),
("p55","c42","مروحة استاند","Stand Fan",1100,1300,"مروحة استاند بثلاث سرعات.","A stand fan with three speeds.",{}),
("p56","c43","كابل HDMI بالمتر","HDMI Cable (per meter)",35,0,"كابل HDMI عالي السرعة يُباع بالمتر.","High-speed HDMI cable sold per meter.",{"unit":"m","stock":300}),
("p57","c43","سلك كهرباء 2.5 ملم بالمتر","2.5mm Electric Wire (per meter)",22,0,"سلك نحاس معزول يُباع بالمتر.","Insulated copper wire sold per meter.",{"unit":"m","stock":500}),
("p60","c51","معاينة وإصلاح سباكة","Plumbing Visit & Repair",250,0,"زيارة فني سباكة للمعاينة وإصلاح الأعطال البسيطة.","A plumber's visit for inspection and minor repairs.",{"stock":999,"lead":"1-2"}),
("p61","c51","تركيب نجفة وإضاءة","Chandelier & Lighting Installation",200,0,"تركيب نجفة أو إضاءة بواسطة فني كهرباء.","Installation of a chandelier or lighting by an electrician.",{"stock":999,"lead":"1-2"}),
("p62","c52","تركيب سيراميك (المتر المسطح)","Tile Installation (per m)",120,0,"أجرة تركيب السيراميك للمتر المسطح بدون خامات.","Tile-laying labour per square meter, materials not included.",{"unit":"m","stock":999,"lead":"2-5"}),
("p63","c52","دهان حوائط (المتر المسطح)","Wall Painting (per m)",45,0,"أجرة الدهان للمتر المسطح بدون خامات.","Painting labour per square meter, materials not included.",{"unit":"m","stock":999,"lead":"2-5"}),
("p64","c53","تنظيف شقة بالكامل","Full Apartment Cleaning",600,0,"تنظيف شامل لشقة حتى 120 متر.","A full clean for apartments up to 120 sqm.",{"stock":999,"lead":"1-3"}),
("p65","c53","مكافحة حشرات","Pest Control",450,0,"رش مبيدات آمنة لشقة حتى 120 متر.","Safe pesticide treatment for apartments up to 120 sqm.",{"stock":999,"lead":"1-3"}),
("p70","c61","فلتر زيت","Oil Filter",120,0,"فلتر زيت أصلي لمعظم السيارات.","Oil filter for most cars.",{}),
("p71","c61","طقم تيل فرامل","Brake Pad Set",650,0,"طقم تيل فرامل أمامي.","Front brake pad set.",{}),
("p72","c62","زيت محرك 4 لتر 5W-30","Engine Oil 4L 5W-30",980,1100,"زيت محرك صناعي بالكامل.","Fully synthetic engine oil.",{}),
("p73","c62","سائل تبريد 1 لتر","Coolant 1L",85,0,"سائل تبريد جاهز للاستخدام.","Ready-to-use coolant.",{}),
("p74","c63","كفر مقاعد سيارة","Car Seat Covers",1450,0,"طقم كفر مقاعد كامل.","A full car seat cover set.",{"colors":[co("أسود",BLK),co("بيج",BEI),co("رمادي",GRY)]}),
("p75","c63","حامل هاتف للسيارة","Car Phone Holder",110,0,"حامل هاتف مغناطيسي.","A magnetic phone holder.",{"src":"drop","lead":"5-9"}),
("p76","c64","خوذة دراجة نارية","Motorcycle Helmet",900,0,"خوذة كاملة بزجاج مضاد للخدش.","Full-face helmet with a scratch-resistant visor.",{"colors":[co("أسود",BLK),co("أحمر",RED)],"sizes":["M","L","XL"]}),
("p80","c71","عطر رجالي 100 مل","Men's Perfume 100ml",750,900,"عطر رجالي برائحة خشبية.","A woody men's fragrance.",{"stock":60}),
("p81","c71","عطر حريمي 100 مل","Women's Perfume 100ml",720,0,"عطر حريمي برائحة زهرية.","A floral women's fragrance.",{"stock":60}),
("p82","c72","كريم ترطيب للبشرة","Skin Moisturizer",160,0,"كريم ترطيب يومي.","A daily moisturizing cream.",{}),
("p83","c72","شامبو للشعر 400 مل","Hair Shampoo 400ml",95,0,"شامبو للعناية اليومية.","Daily-care shampoo.",{}),
("p84","c73","أحمر شفاه","Lipstick",140,0,"أحمر شفاه بتغطية عالية.","High-coverage lipstick.",{"colors":[co("أحمر",RED),co("وردي","#D96B8A"),co("نيود","#B77B6A")]}),
]
def cats_js():
    out=[]
    for i,(id_,n,ne,par,icon,feat) in enumerate(CATS):
        o={"id":id_,"name":n,"name_en":ne,"parent":par,"bg":"","ord":i,"icon":icon}
        if feat is not None: o["feat"]=feat
        out.append(o)
    return json.dumps(out,ensure_ascii=False,indent=1)
def products_js():
    out=[]
    for (id_,cat,n,ne,price,old,d,de,o) in P:
        src=o.get("src","own")
        out.append({"id":id_,"cat":cat,"name":n,"name_en":ne,"price":price,"old":old,"desc":d,"desc_en":de,
          "stock":None if src=="drop" else o.get("stock",25),"img":"","imgs":[],"src":src,"lead":o.get("lead",""),
          "unit":o.get("unit","piece"),"colors":o.get("colors",[]),"sizes":o.get("sizes",[])})
    return json.dumps(out,ensure_ascii=False,indent=1)
if __name__=="__main__":
    print(len(CATS),len(P))
