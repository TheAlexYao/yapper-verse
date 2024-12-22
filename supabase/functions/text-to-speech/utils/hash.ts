export function createTextHash(text: string, languageCode: string, voiceGender: string, speed: string = 'normal'): string {
  const data = `${text}-${languageCode}-${voiceGender}-${speed}`;
  return Array.from(
    new Uint8Array(
      crypto.subtle.digestSync('MD5', new TextEncoder().encode(data))
    )
  )
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}