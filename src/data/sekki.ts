/**
 * 七十二候 — the seventy-two microseasons of the classical Japanese calendar.
 * Five days each, three to a solar term (節気), and computable entirely
 * offline: the boundaries here are the traditional dates (they drift by at
 * most a day with the actual solar terms — close enough for calligraphy).
 *
 * The family learns that Japan has seventy-two seasons, not four.
 */

export interface Microseason {
  /** first day, as MM-DD */
  start: string
  /** the season's name in kanji, as written vertically on the Journey header */
  kanji: string
  /** romanized reading */
  reading: string
  /** what it means */
  en: string
  /** the parent solar term */
  sekki: string
}

/** Calendar-ordered (January onward) for straightforward lookup. */
export const microseasons: Microseason[] = [
  // 小寒 Shōkan — minor cold
  { start: '01-05', kanji: '芹乃栄', reading: 'seri sunawachi sakau', en: 'Parsley flourishes', sekki: '小寒' },
  { start: '01-10', kanji: '水泉動', reading: 'shimizu atataka o fukumu', en: 'Springs thaw beneath the ice', sekki: '小寒' },
  { start: '01-15', kanji: '雉始雊', reading: 'kiji hajimete naku', en: 'Pheasants start to call', sekki: '小寒' },
  // 大寒 Daikan — major cold
  { start: '01-20', kanji: '款冬華', reading: 'fuki no hana saku', en: 'Butterburs bud', sekki: '大寒' },
  { start: '01-25', kanji: '水沢腹堅', reading: 'sawamizu kōri tsumeru', en: 'Ice thickens on streams', sekki: '大寒' },
  { start: '01-30', kanji: '鶏始乳', reading: 'niwatori hajimete toya ni tsuku', en: 'Hens start laying', sekki: '大寒' },
  // 立春 Risshun — beginning of spring
  { start: '02-04', kanji: '東風解凍', reading: 'harukaze kōri o toku', en: 'East wind melts the ice', sekki: '立春' },
  { start: '02-09', kanji: '黄鶯睍睆', reading: 'kōō kenkan su', en: 'Bush warblers start singing', sekki: '立春' },
  { start: '02-14', kanji: '魚上氷', reading: 'uo kōri o izuru', en: 'Fish emerge from the ice', sekki: '立春' },
  // 雨水 Usui — rainwater
  { start: '02-19', kanji: '土脉潤起', reading: 'tsuchi no shō uruoi okoru', en: 'Rain moistens the soil', sekki: '雨水' },
  { start: '02-24', kanji: '霞始靆', reading: 'kasumi hajimete tanabiku', en: 'Mist starts to linger', sekki: '雨水' },
  { start: '03-01', kanji: '草木萌動', reading: 'sōmoku mebae izuru', en: 'Grass sprouts, trees bud', sekki: '雨水' },
  // 啓蟄 Keichitsu — insects awaken
  { start: '03-06', kanji: '蟄虫啓戸', reading: 'sugomori mushi to o hiraku', en: 'Hibernating insects surface', sekki: '啓蟄' },
  { start: '03-11', kanji: '桃始笑', reading: 'momo hajimete saku', en: 'First peach blossoms', sekki: '啓蟄' },
  { start: '03-16', kanji: '菜虫化蝶', reading: 'namushi chō to naru', en: 'Caterpillars become butterflies', sekki: '啓蟄' },
  // 春分 Shunbun — spring equinox
  { start: '03-21', kanji: '雀始巣', reading: 'suzume hajimete sukuu', en: 'Sparrows start to nest', sekki: '春分' },
  { start: '03-26', kanji: '桜始開', reading: 'sakura hajimete saku', en: 'First cherry blossoms', sekki: '春分' },
  { start: '03-31', kanji: '雷乃発声', reading: 'kaminari sunawachi koe o hassu', en: 'Distant thunder', sekki: '春分' },
  // 清明 Seimei — pure and clear
  { start: '04-05', kanji: '玄鳥至', reading: 'tsubame kitaru', en: 'Swallows return', sekki: '清明' },
  { start: '04-10', kanji: '鴻雁北', reading: 'kōgan kaeru', en: 'Wild geese fly north', sekki: '清明' },
  { start: '04-15', kanji: '虹始見', reading: 'niji hajimete arawaru', en: 'First rainbows', sekki: '清明' },
  // 穀雨 Kokuu — grain rain
  { start: '04-20', kanji: '葭始生', reading: 'ashi hajimete shōzu', en: 'First reeds sprout', sekki: '穀雨' },
  { start: '04-25', kanji: '霜止出苗', reading: 'shimo yamite nae izuru', en: 'Last frost; rice seedlings grow', sekki: '穀雨' },
  { start: '04-30', kanji: '牡丹華', reading: 'botan hana saku', en: 'Peonies bloom', sekki: '穀雨' },
  // 立夏 Rikka — beginning of summer
  { start: '05-05', kanji: '蛙始鳴', reading: 'kawazu hajimete naku', en: 'Frogs start singing', sekki: '立夏' },
  { start: '05-10', kanji: '蚯蚓出', reading: 'mimizu izuru', en: 'Worms surface', sekki: '立夏' },
  { start: '05-15', kanji: '竹笋生', reading: 'takenoko shōzu', en: 'Bamboo shoots sprout', sekki: '立夏' },
  // 小満 Shōman — lesser ripening
  { start: '05-21', kanji: '蚕起食桑', reading: 'kaiko okite kuwa o hamu', en: 'Silkworms feast on mulberry', sekki: '小満' },
  { start: '05-26', kanji: '紅花栄', reading: 'benibana sakau', en: 'Safflowers bloom', sekki: '小満' },
  { start: '05-31', kanji: '麦秋至', reading: 'mugi no toki itaru', en: 'Wheat ripens', sekki: '小満' },
  // 芒種 Bōshu — grain in ear
  { start: '06-06', kanji: '螳螂生', reading: 'kamakiri shōzu', en: 'Praying mantises hatch', sekki: '芒種' },
  { start: '06-11', kanji: '腐草為螢', reading: 'kusaretaru kusa hotaru to naru', en: 'Rotted grass becomes fireflies', sekki: '芒種' },
  { start: '06-16', kanji: '梅子黄', reading: 'ume no mi kibamu', en: 'Plums turn yellow', sekki: '芒種' },
  // 夏至 Geshi — summer solstice
  { start: '06-21', kanji: '乃東枯', reading: 'natsukarekusa karuru', en: 'Self-heal withers', sekki: '夏至' },
  { start: '06-27', kanji: '菖蒲華', reading: 'ayame hana saku', en: 'Irises bloom', sekki: '夏至' },
  { start: '07-02', kanji: '半夏生', reading: 'hange shōzu', en: 'Crow-dipper sprouts', sekki: '夏至' },
  // 小暑 Shōsho — lesser heat
  { start: '07-07', kanji: '温風至', reading: 'atsukaze itaru', en: 'Warm winds arrive', sekki: '小暑' },
  { start: '07-12', kanji: '蓮始開', reading: 'hasu hajimete hiraku', en: 'First lotus blossoms', sekki: '小暑' },
  { start: '07-17', kanji: '鷹乃学習', reading: 'taka sunawachi waza o narau', en: 'Young hawks learn to fly', sekki: '小暑' },
  // 大暑 Taisho — greater heat
  { start: '07-23', kanji: '桐始結花', reading: 'kiri hajimete hana o musubu', en: 'Paulownia sets seed', sekki: '大暑' },
  { start: '07-29', kanji: '土潤溽暑', reading: 'tsuchi uruōte mushiatsushi', en: 'Damp earth, humid air', sekki: '大暑' },
  { start: '08-03', kanji: '大雨時行', reading: 'taiu tokidoki furu', en: 'Great rains sometimes fall', sekki: '大暑' },
  // 立秋 Risshū — beginning of autumn
  { start: '08-08', kanji: '涼風至', reading: 'suzukaze itaru', en: 'Cool winds arrive', sekki: '立秋' },
  { start: '08-13', kanji: '寒蝉鳴', reading: 'higurashi naku', en: 'Evening cicadas sing', sekki: '立秋' },
  { start: '08-18', kanji: '蒙霧升降', reading: 'fukaki kiri matō', en: 'Thick fog descends', sekki: '立秋' },
  // 処暑 Shosho — the heat eases
  { start: '08-23', kanji: '綿柎開', reading: 'wata no hana shibe hiraku', en: 'Cotton flowers open', sekki: '処暑' },
  { start: '08-28', kanji: '天地始粛', reading: 'tenchi hajimete samushi', en: 'The heat begins to die down', sekki: '処暑' },
  { start: '09-02', kanji: '禾乃登', reading: 'kokumono sunawachi minoru', en: 'Rice ripens', sekki: '処暑' },
  // 白露 Hakuro — white dew
  { start: '09-08', kanji: '草露白', reading: 'kusa no tsuyu shiroshi', en: 'Dew glistens white on grass', sekki: '白露' },
  { start: '09-13', kanji: '鶺鴒鳴', reading: 'sekirei naku', en: 'Wagtails sing', sekki: '白露' },
  { start: '09-18', kanji: '玄鳥去', reading: 'tsubame saru', en: 'Swallows leave', sekki: '白露' },
  // 秋分 Shūbun — autumn equinox
  { start: '09-23', kanji: '雷乃収声', reading: 'kaminari sunawachi koe o osamu', en: 'Thunder falls silent', sekki: '秋分' },
  { start: '09-28', kanji: '蟄虫坏戸', reading: 'mushi kakurete to o fusagu', en: 'Insects seal their burrows', sekki: '秋分' },
  { start: '10-03', kanji: '水始涸', reading: 'mizu hajimete karuru', en: 'Fields are drained', sekki: '秋分' },
  // 寒露 Kanro — cold dew
  { start: '10-08', kanji: '鴻雁来', reading: 'kōgan kitaru', en: 'Wild geese return', sekki: '寒露' },
  { start: '10-13', kanji: '菊花開', reading: 'kiku no hana hiraku', en: 'Chrysanthemums bloom', sekki: '寒露' },
  { start: '10-18', kanji: '蟋蟀在戸', reading: 'kirigirisu to ni ari', en: 'Crickets chirp by the door', sekki: '寒露' },
  // 霜降 Sōkō — frost falls
  { start: '10-23', kanji: '霜始降', reading: 'shimo hajimete furu', en: 'First frost', sekki: '霜降' },
  { start: '10-28', kanji: '霎時施', reading: 'kosame tokidoki furu', en: 'Light rains sometimes fall', sekki: '霜降' },
  { start: '11-02', kanji: '楓蔦黄', reading: 'momiji tsuta kibamu', en: 'Maples and ivy turn gold', sekki: '霜降' },
  // 立冬 Rittō — beginning of winter
  { start: '11-07', kanji: '山茶始開', reading: 'tsubaki hajimete hiraku', en: 'Camellias bloom', sekki: '立冬' },
  { start: '11-12', kanji: '地始凍', reading: 'chi hajimete kōru', en: 'The land starts to freeze', sekki: '立冬' },
  { start: '11-17', kanji: '金盞香', reading: 'kinsenka saku', en: 'Daffodils bloom', sekki: '立冬' },
  // 小雪 Shōsetsu — lesser snow
  { start: '11-22', kanji: '虹蔵不見', reading: 'niji kakurete miezu', en: 'Rainbows hide', sekki: '小雪' },
  { start: '11-27', kanji: '朔風払葉', reading: 'kitakaze konoha o harau', en: 'North wind strips the leaves', sekki: '小雪' },
  { start: '12-02', kanji: '橘始黄', reading: 'tachibana hajimete kibamu', en: 'Tachibana citrus turns yellow', sekki: '小雪' },
  // 大雪 Taisetsu — greater snow
  { start: '12-07', kanji: '閉塞成冬', reading: 'sora samuku fuyu to naru', en: 'Cold sets in; winter begins', sekki: '大雪' },
  { start: '12-12', kanji: '熊蟄穴', reading: 'kuma ana ni komoru', en: 'Bears retire to their dens', sekki: '大雪' },
  { start: '12-16', kanji: '鱖魚群', reading: 'sake no uo muragaru', en: 'Salmon gather upstream', sekki: '大雪' },
  // 冬至 Tōji — winter solstice
  { start: '12-21', kanji: '乃東生', reading: 'natsukarekusa shōzu', en: 'Self-heal sprouts', sekki: '冬至' },
  { start: '12-26', kanji: '麋角解', reading: 'sawashika no tsuno otsuru', en: 'Deer shed their antlers', sekki: '冬至' },
  { start: '12-31', kanji: '雪下出麦', reading: 'yuki watarite mugi nobiru', en: 'Wheat sprouts under snow', sekki: '冬至' },
]

/** The microseason for a YYYY-MM-DD date (Japan's calendar, so pass a JST date). */
export function microseasonFor(dateStr: string): Microseason {
  const mmdd = dateStr.slice(5)
  let current = microseasons[microseasons.length - 1] // Jan 1–4 belongs to 雪下出麦
  for (const season of microseasons) {
    if (season.start <= mmdd) current = season
  }
  return current
}
