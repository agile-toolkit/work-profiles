// Work Profiles has no dependency on the Moving Motivators package, so
// this emoji mapping is duplicated locally from
// moving-motivators/src/data/motivators.ts — keep the two in sync if
// Moving Motivators' taxonomy ever changes.
const MOTIVATOR_EMOJI: Record<string, string> = {
  curiosity: '🔍',
  honor: '🏅',
  acceptance: '❤️',
  mastery: '🎯',
  power: '⚡',
  freedom: '🦋',
  relatedness: '🤝',
  order: '📋',
  goal: '🌟',
  status: '🏆',
}

export function motivatorEmoji(id: string): string {
  return MOTIVATOR_EMOJI[id] ?? '❓'
}
