/**
 * The family phrasebook. `jp` is what the speech synthesizer reads (kana or
 * kanji), `romaji` is what humans read aloud, `note` is when/how to use it.
 */

export interface Phrase {
  id: string
  en: string
  jp: string
  romaji: string
  note?: string
}

export interface PhraseCategory {
  id: string
  name: string
  jp: string
  emoji: string
  phrases: Phrase[]
}

export const phraseCategories: PhraseCategory[] = [
  {
    id: 'essentials',
    name: 'Essentials',
    jp: '基本',
    emoji: '🌸',
    phrases: [
      { id: 'hello', en: 'Hello', jp: 'こんにちは', romaji: 'konnichiwa', note: 'Daytime greeting. Morning: ohayō gozaimasu. Evening: konbanwa.' },
      { id: 'thanks', en: 'Thank you', jp: 'ありがとうございます', romaji: 'arigatō gozaimasu', note: 'The single most useful phrase in Japan. Use it constantly.' },
      { id: 'please', en: 'Please', jp: 'おねがいします', romaji: 'onegai shimasu', note: 'Attach to almost any request. "Kore, onegai shimasu" = this one, please.' },
      { id: 'excuse', en: 'Excuse me / sorry', jp: 'すみません', romaji: 'sumimasen', note: 'The Swiss Army knife: getting attention, apologizing, thanking, squeezing past.' },
      { id: 'yes', en: 'Yes', jp: 'はい', romaji: 'hai' },
      { id: 'no', en: 'No', jp: 'いいえ', romaji: 'iie', note: 'Often softened to "chotto…" (it’s a bit…) — Japanese rarely says a hard no.' },
      { id: 'ok', en: 'It’s okay / I’m fine', jp: 'だいじょうぶです', romaji: 'daijōbu desu', note: 'Also works to politely decline: "I’m good, thanks."' },
      { id: 'english', en: 'Do you speak English?', jp: 'えいごをはなせますか', romaji: 'eigo o hanasemasu ka' },
      { id: 'understand-not', en: 'I don’t understand', jp: 'わかりません', romaji: 'wakarimasen' },
      { id: 'goodbye', en: 'Goodbye', jp: 'さようなら', romaji: 'sayōnara', note: 'For casual partings, "bai bai" is completely normal.' },
    ],
  },
  {
    id: 'food',
    name: 'Eating',
    jp: '食事',
    emoji: '🍜',
    phrases: [
      { id: 'itadakimasu', en: 'Before eating (grace)', jp: 'いただきます', romaji: 'itadakimasu', note: 'Said before every meal — "I humbly receive." Kids saying this earns instant delight.' },
      { id: 'gochisosama', en: 'After eating (thanks for the meal)', jp: 'ごちそうさまでした', romaji: 'gochisōsama deshita', note: 'Say it to staff on the way out. It lands like a standing ovation.' },
      { id: 'oishii', en: 'Delicious!', jp: 'おいしい！', romaji: 'oishii!', note: 'Deploy generously.' },
      { id: 'this-please', en: 'This one, please (pointing)', jp: 'これをください', romaji: 'kore o kudasai', note: 'Point at the menu photo or plastic food model. Works everywhere.' },
      { id: 'four-people', en: 'A table for four, please', jp: 'よにんです', romaji: 'yonin desu', note: 'Hold up four fingers with it. Done.' },
      { id: 'kids-menu', en: 'Is there a children’s menu?', jp: 'こどもメニューはありますか', romaji: 'kodomo menyū wa arimasu ka' },
      { id: 'no-spicy', en: 'Not spicy, please', jp: 'からくしないでください', romaji: 'karakushinaide kudasai', note: 'Or just "karai wa dame" while pointing at the kids — universally understood.' },
      { id: 'allergy', en: 'I have an allergy to…', jp: 'アレルギーがあります', romaji: 'arerugī ga arimasu', note: 'Show the allergy card from the Kit tab — written Japanese is safest for allergies.' },
      { id: 'water', en: 'Water, please', jp: 'おみずをください', romaji: 'omizu o kudasai', note: 'Free water (and often free tea) is standard at restaurants.' },
      { id: 'check', en: 'The check, please', jp: 'おかいけいをおねがいします', romaji: 'okaikei o onegai shimasu', note: 'Usually you pay at the front register, not the table.' },
    ],
  },
  {
    id: 'transit',
    name: 'Getting Around',
    jp: '移動',
    emoji: '🚅',
    phrases: [
      { id: 'where-is', en: 'Where is …?', jp: '…はどこですか', romaji: '… wa doko desu ka', note: 'Say the place name first: "Toire wa doko desu ka" = where’s the toilet?' },
      { id: 'toilet', en: 'Where is the toilet?', jp: 'トイレはどこですか', romaji: 'toire wa doko desu ka', note: 'Department stores and konbini are your reliable friends.' },
      { id: 'station', en: 'Where is the station?', jp: 'えきはどこですか', romaji: 'eki wa doko desu ka' },
      { id: 'this-train', en: 'Does this train go to …?', jp: 'このでんしゃは…にいきますか', romaji: 'kono densha wa … ni ikimasu ka' },
      { id: 'how-much-far', en: 'How long does it take?', jp: 'どのくらいかかりますか', romaji: 'dono kurai kakarimasu ka' },
      { id: 'taxi', en: 'To this address, please (taxi)', jp: 'このじゅうしょまでおねがいします', romaji: 'kono jūsho made onegai shimasu', note: 'Show the address in Japanese on your phone. Taxi doors open themselves — don’t touch!' },
      { id: 'lost', en: 'We are lost', jp: 'みちにまよいました', romaji: 'michi ni mayoimashita', note: 'Ask at a kōban (police box) — helping lost travelers is literally their job.' },
    ],
  },
  {
    id: 'shopping',
    name: 'Shopping',
    jp: '買い物',
    emoji: '🎁',
    phrases: [
      { id: 'how-much', en: 'How much is this?', jp: 'これはいくらですか', romaji: 'kore wa ikura desu ka' },
      { id: 'just-looking', en: 'Just looking, thank you', jp: 'みているだけです', romaji: 'mite iru dake desu' },
      { id: 'card-ok', en: 'Can I pay by card?', jp: 'カードでいいですか', romaji: 'kādo de ii desu ka', note: 'Cards are widely accepted now, but small shops and shrines want cash.' },
      { id: 'bag-please', en: 'A bag, please', jp: 'ふくろをおねがいします', romaji: 'fukuro o onegai shimasu', note: 'Bags cost a few yen by law — they’ll ask, this is your answer.' },
      { id: 'tax-free', en: 'Is this tax-free?', jp: 'めんぜいできますか', romaji: 'menzei dekimasu ka', note: 'Over ¥5,000 in one store, passports in hand = 10% off for tourists.' },
      { id: 'cute', en: 'So cute!', jp: 'かわいい！', romaji: 'kawaii!', note: 'You will hear and say this five hundred times. Lean in.' },
    ],
  },
  {
    id: 'kids',
    name: 'Kids’ Corner',
    jp: '子ども',
    emoji: '🦊',
    phrases: [
      { id: 'sugoi', en: 'Wow! / Amazing!', jp: 'すごい！', romaji: 'sugoi!', note: 'The all-purpose amazement word. Roller coasters, whale sharks, vending machines.' },
      { id: 'yatta', en: 'We did it! / Yay!', jp: 'やった！', romaji: 'yatta!' },
      { id: 'ganbatte', en: 'You can do it!', jp: 'がんばって！', romaji: 'ganbatte!', note: 'Cheer each other up mountains, through long walks, and into trying weird food.' },
      { id: 'onaka', en: 'I’m hungry', jp: 'おなかがすいた', romaji: 'onaka ga suita', note: 'The most-used phrase of any family trip. Now available in Japanese.' },
      { id: 'nemui', en: 'I’m sleepy', jp: 'ねむい', romaji: 'nemui' },
      { id: 'janken', en: 'Rock-paper-scissors!', jp: 'じゃんけんぽん！', romaji: 'janken pon!', note: 'How all disputes are settled in Japan. Front seat, last mochi, whose turn — janken decides.' },
      { id: 'daisuki', en: 'I love it!', jp: 'だいすき！', romaji: 'daisuki!' },
      { id: 'mou-ikkai', en: 'One more time!', jp: 'もういっかい！', romaji: 'mō ikkai!', note: 'For rides, mochi demonstrations, and deer bows that must be repeated.' },
    ],
  },
  {
    id: 'help',
    name: 'Help',
    jp: '助け',
    emoji: '🏮',
    phrases: [
      { id: 'help', en: 'Help, please!', jp: 'たすけてください！', romaji: 'tasukete kudasai!' },
      { id: 'doctor', en: 'We need a doctor', jp: 'いしゃがひつようです', romaji: 'isha ga hitsuyō desu' },
      { id: 'hospital', en: 'Where is the hospital?', jp: 'びょういんはどこですか', romaji: 'byōin wa doko desu ka' },
      { id: 'police', en: 'Please call the police', jp: 'けいさつをよんでください', romaji: 'keisatsu o yonde kudasai' },
      { id: 'child-lost', en: 'Our child is lost', jp: 'こどもがまいごになりました', romaji: 'kodomo ga maigo ni narimashita', note: 'Go to any station staff, shop clerk, or kōban immediately — the system for lost kids is superb.' },
      { id: 'it-hurts', en: 'It hurts here', jp: 'ここがいたいです', romaji: 'koko ga itai desu', note: 'Point while saying it.' },
      { id: 'medicine', en: 'Where is a pharmacy?', jp: 'やっきょくはどこですか', romaji: 'yakkyoku wa doko desu ka', note: 'Look for 薬 (kusuri) signs — drugstores like Matsumoto Kiyoshi are everywhere.' },
    ],
  },
]

export const allPhrases: Phrase[] = phraseCategories.flatMap((c) => c.phrases)
