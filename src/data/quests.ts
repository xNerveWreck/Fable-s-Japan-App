/** Side Quests v1 — find-it micro-hunts per city, unlocked when the
 *  family is actually there. Never rename an existing id (the story suite
 *  depends on the count per city — Tokyo has four, update it if that moves). */

export interface Quest {
  id: string
  city: string
  title: string
  jp: string
  hint: string
}

export const quests: Quest[] = [
  // ---------- Tokyo ----------
  {
    id: 't-dragon',
    city: 'Tokyo',
    title: 'The dragon fountain',
    jp: '水舎の龍',
    hint: 'At Sensō-ji’s purification fountain, a bronze dragon spouts the water you rinse your hands with. Find him mid-roar.',
  },
  {
    id: 't-hachiko',
    city: 'Tokyo',
    title: 'Hachikō’s folded ear',
    jp: '忠犬ハチ公',
    hint: 'Look close at the Hachikō statue by Shibuya Station — one bronze ear droops, folded down since the day he was cast.',
  },
  {
    id: 't-cornsoup',
    city: 'Tokyo',
    title: 'Hot corn soup from a machine',
    jp: 'コーンスープ',
    hint: 'Somewhere in Tokyo a vending machine sells hot canned corn soup right beside the cold drinks. Find one and hold the warm can.',
  },
  {
    id: 't-yanakacat',
    city: 'Tokyo',
    title: 'A carved cat of Yanaka',
    jp: '谷中の猫',
    hint: 'Yanaka Ginza is Tokyo’s cat town — seven carved wooden cats hide along the shopping street, on rooftops and shopfronts. Find even one and you’re in the club.',
  },
  // ---------- Kyoto ----------
  {
    id: 'k-float',
    city: 'Kyoto',
    title: 'A wheel taller than a parent',
    jp: '山鉾の車輪',
    hint: 'The Gion Matsuri floats roll on wooden wheels taller than a grown-up. Stand next to one (politely, from the side) and check who wins.',
  },
  {
    id: 'k-fox',
    city: 'Kyoto',
    title: 'The fox with a key',
    jp: '鍵をくわえた狐',
    hint: 'Among the stone foxes at Fushimi Inari, one holds a key in its teeth — the key to the rice granary. Find that one.',
  },
  {
    id: 'k-minitorii',
    city: 'Kyoto',
    title: 'A wish on a mini torii',
    jp: '願い鳥居',
    hint: 'Palm-sized wooden torii hang at the shrine stalls, each one painted with someone’s wish. Spot one and read what it hopes for.',
  },
  {
    id: 'k-bell',
    city: 'Kyoto',
    title: 'The tram’s parting bell',
    jp: '嵐電の鐘',
    hint: 'Just before the Randen tram pulls away, the driver rings a hand bell. Listen for it as the doors close.',
  },
  // ---------- Nara ----------
  {
    id: 'n-bow',
    city: 'Nara',
    title: 'The deer that bows first',
    jp: '先にお辞儀する鹿',
    hint: 'Most deer bow for a cracker. Find one polite enough to bow before you even show the senbei.',
  },
  {
    id: 'n-lantern',
    city: 'Nara',
    title: 'A lantern carved with a deer',
    jp: '鹿の灯籠',
    hint: 'Among Nara’s hundreds of stone lanterns, a few panels are carved with running deer instead of plain squares. Spot one.',
  },
  {
    id: 'n-stack',
    city: 'Nara',
    title: 'The senbei seller’s leaning tower',
    jp: '煎餅の塔',
    hint: 'At the cracker stalls, the senbei get stacked into tall, faintly leaning towers. Find the tallest one still standing.',
  },
  // ---------- Osaka ----------
  {
    id: 'o-glico',
    city: 'Osaka',
    title: 'The whole family, Glico-style',
    jp: 'グリコポーズ',
    hint: 'Strike the Glico Man’s arms-up finish-line pose together, right under the sign at Dōtonbori. All four of you, arms up.',
  },
  {
    id: 'o-crab',
    city: 'Osaka',
    title: 'The giant waving claw',
    jp: '動くカニの爪',
    hint: 'The huge mechanical crab above Dōtonbori waves one claw on a loop. Catch it mid-wave.',
  },
  {
    id: 'o-flip',
    city: 'Osaka',
    title: 'A takoyaki flip, mid-air',
    jp: 'たこ焼きの妙技',
    hint: 'Watch a takoyaki cook flick the batter balls with two picks — catch one caught mid-flip, spinning in the air.',
  },
  {
    id: 'o-daruma',
    city: 'Osaka',
    title: 'The tiniest daruma',
    jp: '一番小さい達磨',
    hint: 'Katsuōji’s hillside holds thousands of daruma dolls, tucked into ledges, lanterns, and tree roots. Somewhere is one smaller than your thumb. Find it.',
  },
]
