/** Side Quests v1 — three find-it micro-hunts per city, unlocked when the
 *  family is actually there. Ids and subjects are fixed by the plan; never
 *  rename an existing id (the story suite depends on the count per city). */

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
  // ---------- Hakone ----------
  {
    id: 'h-blackegg',
    city: 'Hakone',
    title: 'A real black egg',
    jp: '黒たまご',
    hint: 'At Ōwakudani, eggs boiled in the volcanic hot springs turn black as coal. Spot one — or better, eat one.',
  },
  {
    id: 'h-torii',
    city: 'Hakone',
    title: 'The lake torii, from the ship',
    jp: '芦ノ湖の鳥居',
    hint: 'From the deck of the pirate ship crossing Lake Ashi, find the red torii standing in the water, framed against the far shore.',
  },
  {
    id: 'h-switchback',
    city: 'Hakone',
    title: 'The great switchback swap',
    jp: 'スイッチバック',
    hint: 'On the Hakone Tozan train, catch the moment it reverses direction — the driver and conductor cross paths right past your window.',
  },
  // ---------- Kyoto ----------
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
]
