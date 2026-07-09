/** Packing lists, emergency numbers, and the allergy card data. */

export interface PackItem {
  id: string
  label: string
  note?: string
}

export interface PackGroup {
  id: string
  name: string
  emoji: string
  items: PackItem[]
}

export const packGroups: PackGroup[] = [
  {
    id: 'documents',
    name: 'Papers & Money',
    emoji: '🛂',
    items: [
      { id: 'passports', label: 'Passports ×4', note: 'Valid 6+ months. Photograph every passport page to the cloud.' },
      { id: 'esims', label: 'eSIMs installed', note: 'One per phone, activated before the flight.' },
      { id: 'suica', label: 'Suica in Apple Wallet', note: 'Set up for each family member before you land.' },
      { id: 'cash', label: 'Yen cash (~¥40,000 to start)', note: 'Or withdraw at a 7-Eleven ATM on arrival.' },
      { id: 'cards', label: 'Credit cards ×2 (no foreign fees)', note: 'Tell the bank you’re traveling.' },
      { id: 'insurance', label: 'Travel insurance docs', note: 'Policy number saved offline on both parents’ phones.' },
      { id: 'copies', label: 'Hotel addresses in Japanese', note: 'Saved in this app + screenshots for taxis.' },
    ],
  },
  {
    id: 'tech',
    name: 'Tech',
    emoji: '🔌',
    items: [
      { id: 'adapter', label: 'Plug adapters (Type A) ×2', note: 'Japan uses US-style two-prong, 100V.' },
      { id: 'battery', label: 'Power bank (big one)', note: 'Trains + maps + cameras drain phones by 2pm.' },
      { id: 'cables', label: 'Cables for everything' },
      { id: 'airtags', label: 'AirTags in every bag' },
      { id: 'camera', label: 'Camera + spare card', note: 'Or commit to phones. But charge nightly.' },
      { id: 'headphones', label: 'Kids’ headphones for the flight' },
    ],
  },
  {
    id: 'clothes',
    name: 'Clothes',
    emoji: '👕',
    items: [
      { id: 'walking-shoes', label: 'Broken-in walking shoes', note: '15,000–20,000 steps/day is normal here.' },
      { id: 'slip-ons', label: 'Slip-on shoes', note: 'Temples, ryokan, and restaurants: shoes off constantly.' },
      { id: 'layers', label: 'Layers, not bulk', note: 'Trains are warm, streets are not. Laundry is easy — hotels have coin machines.' },
      { id: 'rain', label: 'Packable rain jackets ×4', note: 'Konbini umbrellas (¥500) cover the rest.' },
      { id: 'nice-outfit', label: 'One nicer outfit each', note: 'For the ryokan kaiseki night.' },
      { id: 'socks', label: 'Good socks, no holes', note: 'Your socks will be on display at every temple. They will be judged.' },
    ],
  },
  {
    id: 'daypack',
    name: 'The Daypack',
    emoji: '🎒',
    items: [
      { id: 'trash-bag', label: 'Small trash bag', note: 'No public bins — carry it out like a local.' },
      { id: 'hand-towel', label: 'Small hand towels ×4', note: 'Many restrooms have no dryers. Locals all carry one.' },
      { id: 'wipes', label: 'Wet wipes & sanitizer' },
      { id: 'coin-purse', label: 'Coin purse', note: 'You will accumulate a shocking mass of coins.' },
      { id: 'snacks', label: 'Emergency kid snacks' },
      { id: 'meds', label: 'Meds pouch + band-aids', note: 'Bring your own children’s fever meds — brands differ.' },
      { id: 'journal', label: 'Trip journal + glue stick', note: 'For tickets, stamps, purikura, and gachapon inventories.' },
    ],
  },
  {
    id: 'kids',
    name: 'Kids’ Own Bags',
    emoji: '🦊',
    items: [
      { id: 'stamp-book', label: 'Eki-stamp notebook', note: 'Nearly every station & sight has a free collectible stamp. The great quest.' },
      { id: 'comfort', label: 'Comfort item that fits in a backpack' },
      { id: 'entertainment', label: 'Flight entertainment, downloaded' },
      { id: 'water-bottle', label: 'Water bottle', note: 'Refill at hotel; vending machines cover the gaps.' },
      { id: 'yen-wallet', label: 'Own wallet with souvenir yen', note: 'Their budget, their math, their gachapon decisions.' },
    ],
  },
]

export interface EmergencyItem {
  id: string
  label: string
  value: string
  detail?: string
}

export const emergencyItems: EmergencyItem[] = [
  { id: 'police', label: 'Police', value: '110', detail: 'Or walk to any kōban police box — they handle everything from crime to directions.' },
  { id: 'ambulance', label: 'Ambulance / Fire', value: '119', detail: 'Say "kyūkyūsha onegai shimasu" (ambulance please). English operators available in big cities.' },
  { id: 'jhelp', label: 'Japan Visitor Hotline (JNTO, 24/7)', value: '050-3816-2787', detail: 'English help for any tourist trouble: medical, lost passport, disasters.' },
  { id: 'coastguard', label: 'Coast Guard (sea emergencies)', value: '118' },
  { id: 'embassy', label: 'U.S. Embassy Tokyo', value: '03-3224-5000', detail: 'Lost passports: embassy in Tokyo or consulate in Osaka (06-6315-5900).' },
]

export interface Allergen {
  id: string
  en: string
  jp: string
}

export const allergens: Allergen[] = [
  { id: 'peanut', en: 'Peanuts', jp: 'ピーナッツ（落花生）' },
  { id: 'treenut', en: 'Tree nuts', jp: 'ナッツ類' },
  { id: 'egg', en: 'Eggs', jp: '卵' },
  { id: 'milk', en: 'Milk / dairy', jp: '乳製品' },
  { id: 'wheat', en: 'Wheat / gluten', jp: '小麦' },
  { id: 'soba', en: 'Buckwheat (soba!)', jp: 'そば' },
  { id: 'shellfish', en: 'Shrimp / crab', jp: 'エビ・カニ（甲殻類）' },
  { id: 'fish', en: 'Fish', jp: '魚' },
  { id: 'soy', en: 'Soy', jp: '大豆' },
  { id: 'sesame', en: 'Sesame', jp: 'ごま' },
]

/** Rough family budget guide, per day, in yen. */
export interface BudgetLine {
  id: string
  label: string
  amount: string
  note: string
}

export const budgetGuide: BudgetLine[] = [
  { id: 'food', label: 'Food for four', amount: '¥12,000–18,000', note: 'Konbini breakfast, casual lunch, one nice dinner.' },
  { id: 'transit', label: 'Local transit', amount: '¥2,000–4,000', note: 'Suica taps add up slowly; day passes help in Kyoto.' },
  { id: 'sights', label: 'Admissions', amount: '¥3,000–8,000', note: 'Temples ¥300–600; big attractions ¥2,000+; DisneySea is its own planet.' },
  { id: 'fun', label: 'Treats & gachapon', amount: '¥2,000–3,000', note: 'The joy budget. Protect it.' },
]
