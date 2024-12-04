'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import SecretSantaApp from './SecretSantaApp';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}

function PageContent() {
  const searchParams = useSearchParams();
  const initialGameCode = searchParams.get('code');
  
  return <SecretSantaApp initialGameCode={initialGameCode} />;
}