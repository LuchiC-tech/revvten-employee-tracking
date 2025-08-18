'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function EmployeeTabs({ company }: { company: string }) {
	const pathname = usePathname();
	const tabs = [
		{ href: `/t/${company}/employee/home`, label: 'Home' },
		{ href: `/t/${company}/employee/lessons`, label: 'Lessons' },
		{ href: `/t/${company}/employee/submissions`, label: 'Submissions' },
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


