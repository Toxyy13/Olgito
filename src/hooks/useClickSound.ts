import { useAudioPlayer } from 'expo-audio';

const clickSound = require('../../assets/click-sound.mp3');

// Deljen zvuk klika za svako dugme u aplikaciji (koristi ga <Button>).
export function useClickSound() {
  const player = useAudioPlayer(clickSound);
  return () => {
    try {
      player.seekTo(0);
      player.play();
    } catch {
      // tiho ignoriši (npr. ako uređaj nema zvučni izlaz)
    }
  };
}
