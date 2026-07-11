/** The food field guide — what to order, and how brave you need to be. */

export interface Dish {
  id: string
  name: string
  jp: string
  desc: string
  kidMeter: 1 | 2 | 3 | 4 | 5 // 5 = kids will fight over it, 1 = adventurer's badge
  where: string
}

export const kidMeterLabel: Record<Dish['kidMeter'], string> = {
  5: 'Kid magnet',
  4: 'Easy yes',
  3: 'Worth a try',
  2: 'Brave bite',
  1: 'Adventurer’s badge',
}

export const dishes: Dish[] = [
  { id: 'ramen', name: 'Ramen', jp: 'ラーメン', desc: 'Order from a vending machine, slurp loudly (it’s polite!). Shōyu (soy) or shio (salt) broths are the gentlest starting points.', kidMeter: 5, where: 'Everywhere; Ichiran’s booths are a fun first time' },
  { id: 'kaitenzushi', name: 'Conveyor-belt sushi', jp: '回転寿司', desc: 'Touchscreen ordering, plates by mini-shinkansen, tamago and cucumber rolls for the cautious, ¥120 a plate. The gateway drug to real sushi.', kidMeter: 5, where: 'Uobei, Genki, Kura, Sushiro chains' },
  { id: 'onigiri', name: 'Onigiri', jp: 'おにぎり', desc: 'Rice triangles with hidden fillings. Tuna-mayo is the universal favorite. Learn the wrapper-pull numbers 1-2-3 and the seaweed stays crisp.', kidMeter: 5, where: 'Any konbini, ¥120–200' },
  { id: 'tamagosando', name: 'Egg sando', jp: 'たまごサンド', desc: 'The pillowy convenience-store egg-salad sandwich with a global fan club. Breakfast of champions.', kidMeter: 5, where: 'Konbini, famously 7-Eleven' },
  { id: 'karaage', name: 'Karaage', jp: '唐揚げ', desc: 'Japanese fried chicken — juicier and gingerier than any nugget. Sold hot at konbini counters and izakaya everywhere.', kidMeter: 5, where: 'Konbini hot case, izakaya, food stalls' },
  { id: 'takoyaki', name: 'Takoyaki', jp: 'たこ焼き', desc: 'Molten octopus dough-balls flipped at blinding speed, painted with sauce and dancing bonito flakes. WAIT before biting — the inside is lava.', kidMeter: 4, where: 'Osaka street stands, festival stalls' },
  { id: 'okonomiyaki', name: 'Okonomiyaki', jp: 'お好み焼き', desc: '"Grilled how you like it" — a savory cabbage pancake cooked on your table’s griddle. Kids get spatulas. Chaos is the recipe.', kidMeter: 4, where: 'Osaka & Kyoto specialty houses' },
  { id: 'curry', name: 'Japanese curry', jp: 'カレーライス', desc: 'Thick, mild, brown, beloved. Order amakuchi (sweet) for kids, add a katsu cutlet for glory. The safest dinner in the country.', kidMeter: 5, where: 'CoCo Ichibanya chain, everywhere' },
  { id: 'udon', name: 'Udon', jp: 'うどん', desc: 'Fat, bouncy wheat noodles in gentle broth. Kitsune udon (sweet fried tofu on top) is a kid classic — the fox’s favorite food.', kidMeter: 4, where: 'Marugame Seimen chain, temple towns' },
  { id: 'tonkatsu', name: 'Tonkatsu', jp: 'とんかつ', desc: 'Panko-crusted pork cutlet with rice, endless shredded cabbage, and a sesame-grinding ritual for the sauce. Deeply satisfying.', kidMeter: 4, where: 'Dedicated katsu restaurants, department store floors' },
  { id: 'gyoza', name: 'Gyōza', jp: '餃子', desc: 'Crisp-bottomed pork dumplings. A plate of six vanishes in ninety seconds. Order two plates per person, minimum.', kidMeter: 5, where: 'Ramen shops, izakaya, gyōza specialists' },
  { id: 'mochi', name: 'Fresh mochi & dango', jp: '餅・団子', desc: 'Warm pounded-rice chew, dusted or skewered. Small bites for little kids — it’s famously sticky. The Nara pounding show makes it theater.', kidMeter: 4, where: 'Nakatanidou in Nara, temple streets' },
  { id: 'taiyaki', name: 'Taiyaki', jp: 'たい焼き', desc: 'Fish-shaped waffle filled with sweet red bean or custard. Eaten head-first or tail-first — this divides the nation. Pick a side.', kidMeter: 5, where: 'Street stalls, shopping arcades' },
  { id: 'matcha-sweets', name: 'Matcha everything', jp: '抹茶スイーツ', desc: 'Kyoto runs on green tea: matcha soft-serve, parfaits, KitKats. Start with a soft-serve "mix" (matcha + vanilla) if the full green is too grassy.', kidMeter: 3, where: 'Uji & Kyoto tea shops' },
  { id: 'kakigori', name: 'Kakigōri', jp: 'かき氷', desc: 'Shaved ice like fresh snow under fruit syrups and condensed milk. A summer religion; in winter, swap for hot taiyaki.', kidMeter: 5, where: 'Cafés & festivals, summer' },
  { id: 'yakitori', name: 'Yakitori', jp: '焼き鳥', desc: 'Charcoal chicken skewers by the stick under lantern light. Momo (thigh) and tsukune (meatball) are the crowd-pleasers. Say "tare" for sauce.', kidMeter: 4, where: 'Omoide Yokochō, izakaya alleys' },
  { id: 'unagi', name: 'Unagi', jp: 'うなぎ', desc: 'Grilled freshwater eel lacquered with sweet soy, over rice. Sounds scary, tastes like candy teriyaki. A classic "I can’t believe I like eel" moment.', kidMeter: 2, where: 'Specialty unagi houses' },
  { id: 'takotamago', name: 'Tako tamago', jp: 'たこ卵', desc: 'A whole candied baby octopus with a quail egg tucked inside its head, on a stick. The Nishiki Market dare. Photograph first; there will be witnesses.', kidMeter: 1, where: 'Nishiki Market, Kyoto' },
  { id: 'natto', name: 'Nattō', jp: '納豆', desc: 'Fermented soybeans: sticky, stringy, smells like a locker room, beloved nationally at breakfast. The ultimate adventurer’s badge. Stir 50 times, commit fully.', kidMeter: 1, where: 'Breakfast sets, konbini' },
  { id: 'purin', name: 'Purin', jp: 'プリン', desc: 'Japanese crème caramel in a little glass or cup — silkier than any pudding at home. The konbini fridge hides world-class dessert for ¥150.', kidMeter: 5, where: 'Konbini, cafés' },
]
