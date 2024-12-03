'use client';

import { useSearchParams } from 'next/navigation';
import React from 'react';
import SecretSantaApp from './SecretSantaApp';

export default function Page() {
  const searchParams = useSearchParams();
  const initialGameCode = searchParams.get('code');
  
  return <SecretSantaApp initialGameCode={initialGameCode} />;
}