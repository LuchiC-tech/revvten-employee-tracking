'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function AdminTabs() {
	const pathname = usePathname();
	const tabs = [
		{ href: '/revv-admin/queue', label: 'Queue' },
		{ href: '/revv-admin/grading', label: 'Grading' },
		{ href: '/revv-admin/lessons', label: 'Lessons' },
		{ href: '/revv-admin/tenants', label: 'Tenants' },
		{ href: '/revv-admin/audit', label: 'Audit' },
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


