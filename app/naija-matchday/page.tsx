import type { Metadata } from 'next';
import { NaijaMatchday } from '@/components/naija/NaijaMatchday';

export const metadata: Metadata = {
  title: 'Naija Matchday | NPFL fan pulse and club calls',
  description: 'Choose your Nigerian club, make your matchday call, and see the fan pulse across the NPFL.',
};

export default function NaijaMatchdayPage() {
  return <NaijaMatchday />;
}
