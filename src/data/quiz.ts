/** The Train Quiz — for quiet shinkansen minutes. All answers live in the field guide. */

export interface QuizQuestion {
  id: string
  q: string
  options: [string, string, string]
  answer: 0 | 1 | 2
  why: string
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'escalator',
    q: 'In Osaka, which side of the escalator do you stand on?',
    options: ['Left, like Tokyo', 'Right — Osaka does its own thing', 'The middle, arms out'],
    answer: 1,
    why: 'Tokyo stands left, Osaka stands right. Nobody fully agrees why — get it right and locals will quietly approve.',
  },
  {
    id: 'chopsticks',
    q: 'Which chopstick move is a big taboo?',
    options: ['Resting them across your bowl', 'Sticking them upright in rice', 'Asking for a fork'],
    answer: 1,
    why: 'Upright chopsticks in rice echo a funeral offering. Resting them across the bowl is fine, and forks are always fine.',
  },
  {
    id: 'deer',
    q: 'How do you get a Nara deer to bow to you?',
    options: ['Bow first, holding a cracker', 'Whistle three times', 'Show it a photo of another deer'],
    answer: 0,
    why: 'Bow with a shika-senbei in hand and many deer bow back. It’s the best ¥200 in Japan.',
  },
  {
    id: 'ambulance',
    q: 'You need an ambulance in Japan. What number do you call?',
    options: ['110', '911', '119'],
    answer: 2,
    why: '119 is fire & ambulance; 110 is police. (Yes, it’s 911 flipped — that’s the memory trick.)',
  },
  {
    id: 'taxi',
    q: 'What should you NEVER do to a Japanese taxi?',
    options: ['Pay with a card', 'Open or close the rear door yourself', 'Sit in the back seat'],
    answer: 1,
    why: 'The rear left door is automatic — the driver operates it. Touching it is the classic tourist move.',
  },
  {
    id: 'flush',
    q: 'On a Japanese toilet, what does the 大 button mean?',
    options: ['Big flush', 'Heated seat', 'Play music'],
    answer: 0,
    why: '大 means "big" and 小 means "small" — flush sizes. The music button is real too, but that’s 音.',
  },
  {
    id: 'shinkansen-nose',
    q: 'The Shinkansen’s long nose was designed by studying…',
    options: ['A swordfish', 'A kingfisher’s beak', 'A paper airplane'],
    answer: 1,
    why: 'An engineer who loved birdwatching copied the kingfisher, which dives into water without a splash. It fixed the train’s tunnel boom.',
  },
  {
    id: 'trash',
    q: 'There are almost no public trash cans in Japan. What do people do?',
    options: ['Carry their trash home', 'Leave it neatly stacked', 'Bury it'],
    answer: 0,
    why: 'Everyone carries trash home — which is why the daypack has a little trash bag in the packing list.',
  },
  {
    id: 'tray',
    q: 'At a shop register, where does your money go?',
    options: ['Directly into the clerk’s hand', 'On the little tray', 'Under the receipt'],
    answer: 1,
    why: 'The small tray (karuton) is for passing money both ways. Change comes back with two hands and a bow.',
  },
  {
    id: 'tipping',
    q: 'How much should you tip at a restaurant in Japan?',
    options: ['10%', '20% for great service', 'Nothing — tipping isn’t a thing'],
    answer: 2,
    why: 'There is no tipping in Japan. Leaving money usually gets a staff member chasing you down to return it.',
  },
  {
    id: 'slippers',
    q: 'The famous ryokan slipper mistake is…',
    options: ['Wearing slippers outside', 'Wearing the toilet slippers back to dinner', 'Wearing two left slippers'],
    answer: 1,
    why: 'Toilet slippers live in the bathroom. Forgetting to swap back and padding into dinner in them is a rite of passage.',
  },
  {
    id: 'blackegg',
    q: 'Eating one black egg at Ōwakudani supposedly adds…',
    options: ['Seven years to your life', 'One wish', 'Good exam luck'],
    answer: 0,
    why: 'The eggs turn black in the volcanic springs; legend says each adds seven years. The family math gets ambitious fast.',
  },
  {
    id: 'ryoanji',
    q: 'The rock garden at Ryōan-ji has 15 stones. How many can you see at once?',
    options: ['All 15, from the corner', 'Never more than 14', 'Only 7'],
    answer: 1,
    why: 'It was designed so one stone always hides. Five hundred years of visitors have tried to beat it. Go ahead and try.',
  },
  {
    id: 'janken',
    q: 'How are family disputes officially settled in Japan?',
    options: ['Janken (rock-paper-scissors)', 'Coin flip', 'The oldest wins'],
    answer: 0,
    why: 'Janken pon! Front seat, last mochi, first bath — janken settles everything in Japan, from playgrounds to game shows.',
  },
  {
    id: 'ekiben',
    q: 'What’s the correct thing to eat on a Shinkansen?',
    options: ['Nothing — no eating allowed', 'An ekiben boxed lunch from the platform', 'Only drinks'],
    answer: 1,
    why: 'Local trains frown on eating, but the Shinkansen is bento country: tray tables, ekiben, and the snack cart.',
  },
  {
    id: 'konbini-atm',
    q: 'Your foreign card needs cash. The most reliable ATM lives at…',
    options: ['Any bank branch', '7-Eleven', 'The train station kiosk'],
    answer: 1,
    why: '7-Eleven ATMs famously accept nearly every foreign card, 24/7. The konbini solves this problem too.',
  },
]
