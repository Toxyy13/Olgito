import React from 'react';
import { WaitingScreen } from '../src/components/WaitingScreen';

// AuthGate (u app/_layout.tsx) odmah preusmerava odavde na pravi ekran
// na osnovu stanja prijave — ovaj ekran se praktično nikad ne vidi.
export default function Index() {
  return <WaitingScreen />;
}
