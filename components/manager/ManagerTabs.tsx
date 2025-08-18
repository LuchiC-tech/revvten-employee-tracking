'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function ManagerTabs({ company }: { company: string }) {
	const pathname = usePathname();
	const tabs = [
		{ href: `/t/${company}/manager/overview`, label: 'Overview' },
		{ href: `/t/${company}/manager/leaderboards`, label: 'Leaderboards' },
		{ href: `/t/${company}/manager/people`, label: 'People' },
		{ href: `/t/${company}/manager/content`, label: 'Content' },
	];

	return (
		<nav className="mb-6 flex gap-4 border-b pb-2 text-sm">
			{tabs.map((t) => {
				const active = pathname === t.href || pathname?.startsWith(t.href + '/');
				return (
					<Link key={t.href} href={t.href} className={cn('hover:underline', active ? 'font-semibold' : 'text-muted-foreground')}>
						{t.label}
					</Link>
				);
			})}
		</nav>
	);
}


