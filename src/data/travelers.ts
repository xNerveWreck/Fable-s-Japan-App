/** The four travelers — names, animal mascots, and their ink colors. */

export interface Traveler {
  id: string
  name: string
  animal: string
  color: 'sakura' | 'pine' | 'gold' | 'indigo'
}

export const animals = [
  { id: 'fox', emoji: '🦊', label: 'Fox', jp: '狐' },
  { id: 'deer', emoji: '🦌', label: 'Deer', jp: '鹿' },
  { id: 'crane', emoji: '🦢', label: 'Crane', jp: '鶴' },
  { id: 'crab', emoji: '🦀', label: 'Crab', jp: '蟹' },
  { id: 'rabbit', emoji: '🐇', label: 'Rabbit', jp: '兎' },
  { id: 'tanuki', emoji: '🦝', label: 'Tanuki', jp: '狸' },
] as const

export const animalEmoji = (id: string) => animals.find((a) => a.id === id)?.emoji ?? '🌸'

export const inkColors = ['sakura', 'pine', 'gold', 'indigo'] as const
