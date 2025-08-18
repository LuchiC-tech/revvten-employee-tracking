export type SessionRole = "employee" | "manager" | "revv_admin";

export type TenantScopedSession = {
	role: SessionRole;
	email: string;
	company?: string; // for employee/manager
	extra?: Record<string, unknown>;
};

const STORAGE_KEY = "revvten_session";

export function readSession(): TenantScopedSession | null {
	if (typeof window === "undefined") return null;
	try {
		const str = window.localStorage.getItem(STORAGE_KEY);
		return str ? (JSON.parse(str) as TenantScopedSession) : null;
	} catch {
		return null;
	}
}

export function writeSession(session: TenantScopedSession | null): void {
	if (typeof window === "undefined") return;
	if (!session) {
		window.localStorage.removeItem(STORAGE_KEY);
		return;
	}
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function isEmployeeForCompany(session: TenantScopedSession | null, company: string): boolean {
	return !!session && session.role === "employee" && session.company === company;
}

export function isManagerForCompany(session: TenantScopedSession | null, company: string): boolean {
	return !!session && session.role === "manager" && session.company === company;
}

export function isAdmin(session: TenantScopedSession | null): boolean {
	return !!session && session.role === "revv_admin";
}


