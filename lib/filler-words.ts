// Common filler words to detect in speech
export const fillerWords = [
  "um",
  "uh",
  "like",
  "you know",
  "so",
  "actually",
  "basically",
  "literally",
  "right",
  "i mean",
  "kind of",
  "sort of",
  "just",
  "well",
  "okay",
  "hmm",
]

// Function to count filler words in a transcript
export function countFillerWords(transcript: string): { [key: string]: number } {
  const lowerText = transcript.toLowerCase()
  const counts: { [key: string]: number } = {}

  fillerWords.forEach((word) => {
    // Create a regex that matches the word as a whole word
    const regex = new RegExp(`\\b${word}\\b`, "gi")
    const matches = lowerText.match(regex)
    if (matches) {
      counts[word] = matches.length
    }
  })

  return counts
}

// Function to get total filler word count
export function getTotalFillerWordCount(counts: { [key: string]: number }): number {
  return Object.values(counts).reduce((sum, count) => sum + count, 0)
}

// Function to get the most common filler words
export function getMostCommonFillerWords(
  counts: { [key: string]: number },
  limit = 3,
): Array<{ word: string; count: number }> {
  return Object.entries(counts)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}
