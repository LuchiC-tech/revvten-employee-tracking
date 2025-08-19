"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function TenantBrand({ slug, label, className, style }: { slug: string; label: string; className?: string; style?: React.CSSProperties }) {
	const pathname = usePathname() || "";
	const isManager = pathname.includes("/manager/");
	const target = isManager ? `/t/${slug}/manager/overview` : `/t/${slug}/employee/home`;
	return (
		<Link href={target} prefetch className={className ?? "inline-flex items-center gap-2"} style={style}>
			<span className="font-semibold">{label}</span>
		</Link>
	);
}
