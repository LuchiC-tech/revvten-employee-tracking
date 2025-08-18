import { type ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}

export function isValidCompanySlug(slug: string | undefined | null): slug is string {
	if (!slug) return false;
	// allow lowercase letters, numbers, and hyphens, 2-32 length
	return /^[a-z0-9-]{2,32}$/.test(slug);
}

export type TenantBrand = {
	name: string;
	primaryColor: string;
	logoText: string;
};

export const TENANT_BRANDS: Record<string, TenantBrand> = {
	board: { name: "Board", primaryColor: "#2563eb", logoText: "Board" },
	acme: { name: "Acme", primaryColor: "#16a34a", logoText: "Acme" },
};

export function getBrandForSlug(slug: string): TenantBrand {
	return TENANT_BRANDS[slug] ?? { name: slug, primaryColor: "#0ea5e9", logoText: slug };
}


