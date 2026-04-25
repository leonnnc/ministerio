'use client';

import { useFirestoreSync } from '@/hooks/useFirestoreSync';

export default function FirestoreProvider({ children }: { children: React.ReactNode }) {
  useFirestoreSync();
  return <>{children}</>;
}
