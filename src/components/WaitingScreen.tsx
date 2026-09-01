import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useAudioPlayer } from 'expo-audio';
import { colors } from '../theme';

const waitingVideo = require('../../assets/waiting-video.mp4');
const waitingAudio = require('../../assets/waiting-audio.mp3');

export function WaitingScreen() {
  const player = useVideoPlayer(waitingVideo, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  const audioPlayer = useAudioPlayer(waitingAudio);
  React.useEffect(() => {
    audioPlayer.loop = true;
    audioPlayer.play();
    return () => audioPlayer.pause();
  }, [audioPlayer]);

  return (
    <View style={styles.container}>
      <VideoView style={styles.video} player={player} nativeControls={false} contentFit="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  video: { width: '100%', height: '100%' },
});
