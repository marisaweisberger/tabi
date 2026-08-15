import type { ListItem } from "./types";

// Starting points for the Shopping and Packing tabs. These are only offered
// while the list is empty — once they're added they become part of the trip
// JSON on the server and can be ticked, edited and deleted like anything else.
// Nothing personal belongs in this file: it's in a public repo.

/** Practical things worth buying in Japan, grouped by where to buy them. */
export const SHOPPING_SEED: ListItem[] = [
  // ---- Kappabashi ----
  {
    id: "s01",
    g: "Kappabashi · kitchen street (Asakusa)",
    t: "Kitchen knife — gyuto or santoku",
    m: "The reason to come. Kama-Asa Shoten (釜浅商店) is the easy one: English spoken, they help you pick, and they engrave your name free. Tsubaya and Kamata Hakensha nearby are the other two worth a look. ~¥8,000–20,000 for a very good one. Stainless is forgiving; carbon steel is sharper but rusts if you leave it wet. Goes in CHECKED luggage — never carry-on.",
  },
  {
    id: "s02",
    g: "Kappabashi · kitchen street (Asakusa)",
    t: "Whetstone + a lesson in using it",
    m: "A #1000/#3000 combination stone is about ¥3,000. Ask them to show you the angle while you're there — a knife you can't sharpen goes blunt in a year.",
  },
  {
    id: "s03",
    g: "Kappabashi · kitchen street (Asakusa)",
    t: "Tamagoyaki pan",
    m: "Rectangular omelette pan, copper or steel. Doesn't exist at home at this price. Light and flat — easy to pack.",
  },
  {
    id: "s04",
    g: "Kappabashi · kitchen street (Asakusa)",
    t: "Kitchen odds and ends",
    m: "Japanese kitchen shears, an oroshigane ginger/daikon grater, fish tweezers, a good peeler, wooden shamoji. All a fraction of home prices and all flat-packable.",
  },
  {
    id: "s05",
    g: "Kappabashi · kitchen street (Asakusa)",
    t: "Ceramics — rice bowls, small plates, a donabe",
    m: "Kappabashi's pottery shops, plus Nishi-Asakusa. Beautiful and cheap; also heavy and breakable, so buy it late in the trip and wrap it in clothes. Time it right: Kappabashi is a 10-minute walk from Sensoji, most shops shut around 5pm and many close Sundays — go on a weekday morning.",
  },

  // ---- Drugstores ----
  {
    id: "s06",
    g: "Drugstores · everywhere (Matsumoto Kiyoshi, Sundrug, Welcia)",
    t: "Sunscreen — buy several",
    m: "Japanese sunscreen is the best in the world and about half the price: Anessa Perfect UV (gold bottle), Biore UV Aqua Rich or Athlizm, Skin Aqua, Allie. SPF50+ PA++++ and it feels like nothing on your face. ¥800–3,000. Stock up — this is the single best-value thing on the list.",
  },
  {
    id: "s07",
    g: "Drugstores · everywhere (Matsumoto Kiyoshi, Sundrug, Welcia)",
    t: "Nail clippers",
    m: "Made in Seki, the knife town. Green Bell 'G-1000' is ~¥1,500 in any drugstore and better than anything at home. If you want the lifetime pair, Suwada (¥5,000–10,000, cuts like tiny scissors) is at Loft, Hands and department stores rather than drugstores.",
  },
  {
    id: "s08",
    g: "Drugstores · everywhere (Matsumoto Kiyoshi, Sundrug, Welcia)",
    t: "Blister patches + Salonpas",
    m: "Band-Aid 'Kizu Power Pad' hydrocolloid patches — buy these on day one, you'll be walking 20,000 steps a day. Salonpas/Hisamitsu stick-on patches for feet, shoulders and backs.",
  },
  {
    id: "s09",
    g: "Drugstores · everywhere (Matsumoto Kiyoshi, Sundrug, Welcia)",
    t: "Megurhythm steam eye masks",
    m: "Kao's self-heating eye masks, ~¥500 for 5. Perfect on the flight home and a great small gift.",
  },
  {
    id: "s10",
    g: "Drugstores · everywhere (Matsumoto Kiyoshi, Sundrug, Welcia)",
    t: "Cooling body sheets",
    m: "Gatsby or Biore 'Sara Sara' powder sheets. September in Tokyo is hot and sticky and these are what everyone uses.",
  },
  {
    id: "s11",
    g: "Drugstores · everywhere (Matsumoto Kiyoshi, Sundrug, Welcia)",
    t: "Skincare basics",
    m: "Hada Labo Gokujyun lotion, Senka Perfect Whip cleanser, Curel, sheet masks by the bagful. Matsumoto Kiyoshi and @cosme for range; Don Quijote when it's 11pm.",
  },

  // ---- Glasses ----
  {
    id: "s12",
    g: "Glasses · JINS / Zoff / OWNDAYS (Shinjuku, Shibuya, Ginza, Harajuku)",
    t: "New glasses",
    m: "Frame AND lenses from about ¥5,500–13,000 all in, usually ready in 30–60 minutes. Branches in Shinjuku, Shibuya, Harajuku and Ginza, plus almost every station building (Lumine, atre, PARCO). Bring your prescription — including your PD. See the Packing tab.",
  },
  {
    id: "s13",
    g: "Glasses · JINS / Zoff / OWNDAYS (Shinjuku, Shibuya, Ginza, Harajuku)",
    t: "A spare pair or prescription sunglasses",
    m: "At these prices a second pair is barely a decision. Prescription sunglasses or clip-on sun lenses are the usual pick.",
  },
  {
    id: "s14",
    g: "Glasses · JINS / Zoff / OWNDAYS (Shinjuku, Shibuya, Ginza, Harajuku)",
    t: "Ask about the free eye test",
    m: "They'll test your eyes in-store for free, so a missing prescription isn't fatal — but for a strong or astigmatic prescription bring your own numbers, and allow more time. Go early in the day, not 20 minutes before closing.",
  },
  {
    id: "s15",
    g: "Glasses · JINS / Zoff / OWNDAYS (Shinjuku, Shibuya, Ginza, Harajuku)",
    t: "Optional splurge: 999.9 or Masunaga",
    m: "Japanese frames worth the trip: 999.9 (Four Nines) and Masunaga, in Ginza and Shinjuku. ¥40,000+ and usually not same-day, so go early in the trip if you want them.",
  },

  // ---- Bags and travel goods ----
  {
    id: "s16",
    g: "Foldable bags & travel goods · Loft / Hands / Muji",
    t: "Shupatto foldable bag",
    m: "The famous one — pull both handles and it collapses itself in one go, no folding. Marna 'Shupatto', sizes S/M/L plus a Drop shape, ¥1,600–3,000. Loft, Hands, Don Quijote, Tokyu Hands and most department stores. Buy two or three: they're the best small gift on this list.",
  },
  {
    id: "s17",
    g: "Foldable bags & travel goods · Loft / Hands / Muji",
    t: "A big foldable bag for the flight home",
    m: "Muji's foldable boston bag or a Shupatto Large, flat in your suitcase on the way out and full of shopping on the way back.",
  },
  {
    id: "s18",
    g: "Foldable bags & travel goods · Loft / Hands / Muji",
    t: "Folding umbrella",
    m: "Wpc. or Waterfront, ¥1,500–3,500 and lighter than anything sold at home. September is typhoon season, so this is a need not a want.",
  },
  {
    id: "s19",
    g: "Foldable bags & travel goods · Loft / Hands / Muji",
    t: "Packing cubes and travel bottles",
    m: "Muji's travel section for the good ones, Daiso for the ¥110 versions that are honestly fine.",
  },
  {
    id: "s20",
    g: "Foldable bags & travel goods · Loft / Hands / Muji",
    t: "Tenugui hand towels",
    m: "Japanese public toilets usually have no paper towels or dryers — everyone carries a small towel. Fujiya on Nakamise in Asakusa for lovely printed ones; Daiso for ¥110 ones that do the same job.",
  },

  // ---- Loft / Hands ----
  {
    id: "s21",
    g: "Loft & Hands · Shibuya, Shinjuku, Ginza",
    t: "Stationery",
    m: "Uni Kuru Toga pencils, Jetstream and Frixion pens, notebooks, Hobonichi planners. Loft and Hands are everywhere and cheap; Itoya in Ginza (twelve floors of it) is the destination version; Sekaido in Shinjuku for art supplies at half price.",
  },
  {
    id: "s22",
    g: "Loft & Hands · Shibuya, Shinjuku, Ginza",
    t: "Beauty tools",
    m: "Panasonic heated eyelash curler, Shiseido makeup brushes, Green Bell tweezers and scissors. The floor to wander if you have half an hour.",
  },
  {
    id: "s23",
    g: "Loft & Hands · Shibuya, Shinjuku, Ginza",
    t: "Household gadgets",
    m: "The 'why doesn't this exist at home' floor: storage clips, drain covers, cleaning brushes, bento gear.",
  },

  // ---- Ginza ----
  {
    id: "s24",
    g: "Ginza · Uniqlo, Muji, Itoya",
    t: "Uniqlo basics",
    m: "The Ginza flagship is twelve floors. Airism, Ultra Light Down, UV-cut parkas — cheapest in the world here, and they hem trousers free while you shop.",
  },
  {
    id: "s25",
    g: "Ginza · Uniqlo, Muji, Itoya",
    t: "Muji",
    m: "Muji Ginza (six floors, plus a food hall and a hotel) or the big Yurakucho store next door. Travel goods, stationery, house slippers, aroma diffusers, and the pyjamas everyone raves about.",
  },
  {
    id: "s26",
    g: "Ginza · Uniqlo, Muji, Itoya",
    t: "Chopsticks",
    m: "Ginza Natsuno — hundreds of pairs from about ¥1,000, boxed. The tidiest gift you can carry home.",
  },

  // ---- Nihonbashi ----
  {
    id: "s27",
    g: "Nihonbashi · the old shops",
    t: "Kiya knives and scissors",
    m: "Kiya (木屋), going since 1792, in Coredo Muromachi. A calmer, more polished alternative to Kappabashi if you'd rather buy a knife in air conditioning — and a good pairing with a Nihonbashi/Ginza day.",
  },
  {
    id: "s28",
    g: "Nihonbashi · the old shops",
    t: "Japanese paper, cards, fans",
    m: "Haibara for washi paper and cards; Ibasen for hand fans. Small, flat, light — the easiest things to bring back.",
  },

  // ---- Electronics ----
  {
    id: "s29",
    g: "Electronics · Yodobashi / Bic Camera (Shinjuku, Akihabara)",
    t: "Insulated bottle (Zojirushi or Thermos)",
    m: "300–500ml, keeps ice all day, weighs nothing, about ¥3,000. Genuinely better than the ones sold at home.",
  },
  {
    id: "s30",
    g: "Electronics · Yodobashi / Bic Camera (Shinjuku, Akihabara)",
    t: "Careful with appliances",
    m: "Japan runs on 100V. Anything with a heating element or a motor — rice cookers, hair dryers, kettles — will run weakly or die on a 120V/240V supply. USB and battery things are fine. Check for a 'travel' or dual-voltage model before you buy.",
  },
  {
    id: "s31",
    g: "Electronics · Yodobashi / Bic Camera (Shinjuku, Akihabara)",
    t: "Camera gear, cables, SD cards",
    m: "Yodobashi Akiba and Bic Camera both do tax-free at a dedicated counter. Compare with home prices first though — the bargain isn't what it was.",
  },

  // ---- Cheap and late ----
  {
    id: "s32",
    g: "Don Quijote & 100-yen shops",
    t: "Don Quijote",
    m: "Open late, some branches 24 hours (Shibuya, Shinjuku Kabukicho, Asakusa). Loud and chaotic, but the cheapest place for snacks, cosmetics, Kit Kats and last-minute gifts — with its own tax-free counter upstairs.",
  },
  {
    id: "s33",
    g: "Don Quijote & 100-yen shops",
    t: "Daiso / Seria / Can Do",
    m: "¥110 a piece. Travel bottles, chopsticks, storage bags, tenugui, phone bits. The Daiso in Harajuku is the big one. Do a gift sweep here before you spend real money elsewhere.",
  },
];

/** Packing checklist. Written for a hot, humid, typhoon-season September. */
export const PACKING_SEED: ListItem[] = [
  // ---- Documents ----
  {
    id: "p01",
    g: "Documents & money",
    t: "Passport",
    m: "Valid well past the trip. Photo of the ID page saved in your phone, and one copy left with someone at home. You also need the physical passport in your bag every day if you want tax-free shopping — a photo won't do.",
  },
  {
    id: "p02",
    g: "Documents & money",
    t: "★ Eyeglass prescription — including your PD",
    m: "This is what lets you walk into JINS or Zoff and walk out with ¥6,000 glasses. You need SPH, CYL and AXIS for each eye, plus your PD (pupillary distance) — prescriptions often leave PD off, so ask your optician for it before you fly. Tap ✎ on this line and type your numbers straight in here, so they're on your phone and everyone's. Photograph the paper copy too.",
  },
  {
    id: "p03",
    g: "Documents & money",
    t: "Spare glasses / contacts + solution",
    m: "Enough contacts for the whole trip — you can't get your brand over the counter without a Japanese prescription.",
  },
  {
    id: "p04",
    g: "Documents & money",
    t: "Visit Japan Web QR codes",
    m: "Register immigration and customs online before you fly and screenshot the two QR codes. Airport wifi queues are not the place to be loading a website.",
  },
  {
    id: "p05",
    g: "Documents & money",
    t: "Flight, hotel and booking confirmations — offline",
    m: "Screenshots, not links. They're in the Bookings and Stays tabs too, and this app works offline once you've opened it.",
  },
  {
    id: "p06",
    g: "Documents & money",
    t: "Travel insurance details",
    m: "Policy number and the emergency phone number, saved offline.",
  },
  {
    id: "p07",
    g: "Documents & money",
    t: "Cash — and a plan for getting more",
    m: "Japan takes cards far more than it used to, but small restaurants, temples, markets and some buses are still cash only. 7-Eleven ATMs take foreign cards, are everywhere, and give the best rate — don't change money at the airport beyond a small float.",
  },
  {
    id: "p08",
    g: "Documents & money",
    t: "Cards — and a backup card kept separately",
    m: "Tell the bank you're travelling so nothing gets frozen on day one.",
  },
  {
    id: "p09",
    g: "Documents & money",
    t: "Suica set up in Apple Wallet",
    m: "Add a Suica to Apple Wallet before you fly and top it up with a card — no queue, no deposit, tap onto every train, bus and convenience store. (Android phones bought outside Japan can't do this; get a physical Welcome Suica at the airport instead.)",
  },

  // ---- Health ----
  {
    id: "p10",
    g: "Health & toiletries",
    t: "Prescription medication in its original packaging",
    m: "Bring the pharmacy label and a doctor's letter. Japan is strict: anything containing pseudoephedrine (Sudafed, some cold medicine, Vicks inhalers), codeine, and many ADHD medications are restricted or banned outright. Check yours against the rules before you pack, and apply for a Yakkan Shoumei permit if you're bringing a large supply.",
  },
  {
    id: "p11",
    g: "Health & toiletries",
    t: "Painkillers you actually like",
    m: "Japanese over-the-counter doses are low, and the packaging is all in Japanese.",
  },
  {
    id: "p12",
    g: "Health & toiletries",
    t: "Deodorant",
    m: "Bring your own. Japanese deodorant is very mild and you will be sweating.",
  },
  {
    id: "p13",
    g: "Health & toiletries",
    t: "Blister plasters for day one",
    m: "Then restock with Kizu Power Pad from any drugstore — see the Shopping tab.",
  },
  {
    id: "p14",
    g: "Health & toiletries",
    t: "Enough sunscreen for the first day only",
    m: "Buy the Japanese stuff when you land. It's better and half the price.",
  },
  {
    id: "p15",
    g: "Health & toiletries",
    t: "Hand sanitiser and tissues",
    m: "Plenty of public toilets have no soap, and almost none have paper towels.",
  },
  {
    id: "p16",
    g: "Health & toiletries",
    t: "Skip most toiletries",
    m: "Every hotel gives you a toothbrush, razor, shampoo and often pyjamas. Business hotels always do. Pack light and buy what you're missing.",
  },

  // ---- Clothes ----
  {
    id: "p17",
    g: "Clothes · September in Japan",
    t: "Light, breathable tops — more than you think",
    m: "September is hot and humid, roughly 28–32°C and sticky. Pack for high summer, not autumn. You'll change twice some days; most hotels have a coin laundry for about ¥300 a load, so pack fewer and wash more.",
  },
  {
    id: "p18",
    g: "Clothes · September in Japan",
    t: "Shoes you've already broken in",
    m: "20,000 steps a day, most of it on concrete and station stairs. This is the item that ruins trips.",
  },
  {
    id: "p19",
    g: "Clothes · September in Japan",
    t: "Slip-on shoes",
    m: "You take your shoes off constantly — temples, ryokan, some restaurants, any tatami room, changing rooms in shops. Laces get old fast.",
  },
  {
    id: "p20",
    g: "Clothes · September in Japan",
    t: "Socks with no holes in them",
    m: "Said sincerely: you'll be standing around in just your socks in public, repeatedly.",
  },
  {
    id: "p21",
    g: "Clothes · September in Japan",
    t: "Packable rain jacket",
    m: "September is typhoon season. A light waterproof plus a folding umbrella (buy one there) beats a big coat.",
  },
  {
    id: "p22",
    g: "Clothes · September in Japan",
    t: "A light layer for indoors",
    m: "Trains, restaurants and department stores are air-conditioned hard. Going from 32°C to 20°C ten times a day is the actual weather challenge.",
  },
  {
    id: "p23",
    g: "Clothes · September in Japan",
    t: "One smarter outfit",
    m: "For a nicer dinner or anywhere with a dress code. Nothing formal — just not shorts and a day pack.",
  },
  {
    id: "p24",
    g: "Clothes · September in Japan",
    t: "Hat and sunglasses",
    m: "Very little shade in Tokyo and the September sun is still fierce.",
  },
  {
    id: "p25",
    g: "Clothes · September in Japan",
    t: "Swimsuit — only if there's a pool",
    m: "Public onsen are nude and separated by gender, so a swimsuit is for hotel pools and private baths only. Note that visible tattoos are still refused at many onsen.",
  },
  {
    id: "p26",
    g: "Clothes · September in Japan",
    t: "Leave the suitcase half empty",
    m: "Knives, ceramics, snacks, Uniqlo and glasses all come back with you. Check your airline's weight limit before you shop, not after.",
  },

  // ---- Tech ----
  {
    id: "p27",
    g: "Tech",
    t: "Chargers and a plug adapter",
    m: "Japan uses Type A plugs (two flat pins, same as the US) at 100V. Most chargers are 100–240V — check the small print on the brick. UK and EU plugs need an adapter; US plugs fit as they are.",
  },
  {
    id: "p28",
    g: "Tech",
    t: "Power bank — in your carry-on",
    m: "Airlines require power banks in the cabin, never in checked luggage. Navigation and photos will flatten your phone by mid-afternoon.",
  },
  {
    id: "p29",
    g: "Tech",
    t: "eSIM or pocket wifi, bought before you fly",
    m: "An eSIM (Ubigi, Airalo, Sakura Mobile) is usually the cheapest and simplest — install it at home, switch it on when you land. Free wifi in Japan is patchier than people expect.",
  },
  {
    id: "p30",
    g: "Tech",
    t: "Multi-port charger and short cables",
    m: "Hotel rooms are small and sockets are often behind the bed. One charger for the four devices between you.",
  },
  {
    id: "p31",
    g: "Tech",
    t: "Headphones",
    m: "Trains are silent — genuinely, nobody speaks or plays sound. Keep it that way.",
  },
  {
    id: "p32",
    g: "Tech",
    t: "Camera, spare battery, spare card",
    m: "If you're bringing a proper camera. Charge everything the night before travel days.",
  },

  // ---- Day bag ----
  {
    id: "p33",
    g: "Day bag",
    t: "Small backpack or tote",
    m: "Big enough for a bottle, a layer and shopping. Anything bigger and you'll be asked to wear it on your front on the train.",
  },
  {
    id: "p34",
    g: "Day bag",
    t: "A hand towel",
    m: "For hands after the restroom and for the humidity. Everyone carries one — buy a tenugui when you're there.",
  },
  {
    id: "p35",
    g: "Day bag",
    t: "A small bag for rubbish",
    m: "There are almost no public bins in Japan. You carry your rubbish until you find a convenience store or get back to the hotel.",
  },
  {
    id: "p36",
    g: "Day bag",
    t: "Coin purse",
    m: "You'll be buried in ¥1, ¥5, ¥10 and ¥100 coins within two days. A ¥500 coin is real money — don't lose them in a pocket.",
  },
  {
    id: "p37",
    g: "Day bag",
    t: "Refillable water bottle",
    m: "Tap water is safe everywhere. Vending machines are on every corner if you'd rather not.",
  },
  {
    id: "p38",
    g: "Day bag",
    t: "Foldable tote",
    m: "Shops charge for bags and you'll buy things unplanned. Get a Shupatto on day one — see the Shopping tab.",
  },

  // ---- Last 48 hours ----
  {
    id: "p39",
    g: "The last 48 hours",
    t: "Check in online and download the boarding passes",
    m: "To the phone's wallet, not just an email.",
  },
  {
    id: "p40",
    g: "The last 48 hours",
    t: "Download an offline map of Tokyo",
    m: "Google Maps → your profile → Offline maps → select the whole city. Saves you when the eSIM sulks underground.",
  },
  {
    id: "p41",
    g: "The last 48 hours",
    t: "Screenshot the Visit Japan Web QR codes",
    m: "Both of them — immigration and customs.",
  },
  {
    id: "p42",
    g: "The last 48 hours",
    t: "Tell the bank you're travelling",
    m: "For every card you're bringing, including the backup.",
  },
  {
    id: "p43",
    g: "The last 48 hours",
    t: "Charge everything, including the power bank",
    m: "And pack the cables last so they don't get left on the side.",
  },
  {
    id: "p44",
    g: "The last 48 hours",
    t: "Weigh the suitcase",
    m: "Check the airline's limit now, while you can still take something out.",
  },
  {
    id: "p45",
    g: "The last 48 hours",
    t: "Open this app once while you're online",
    m: "That caches it on the phone, so the itinerary, stays and these lists all work with no signal.",
  },
];
