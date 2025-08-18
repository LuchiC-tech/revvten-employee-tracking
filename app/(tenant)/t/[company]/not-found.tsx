'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function TenantNotFound() {
  const params = useParams<{ company?: string }>();
  const company = typeof params?.company === 'string' ? params.company : '';

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-2 text-3xl font-bold">404 — Not Found</h1>
      <p className="text-muted-foreground">
        This page does not exist for tenant{company ? ` “${company}”` : ''}.
      </p>
      <div className="mt-4">
        <Link href={company ? `/t/${company}` : '/'} className="underline">
          {company ? `Go back to ${company}` : 'Go home'}
        </Link>
      </div>
    </div>
  );
}


