export const BUCKET_TENANT_SUBMISSIONS = "tenant-submissions" as const;
export const BUCKET_PUBLIC_LESSONS = "public-lessons" as const;

export type PublicLessonScope = "global" | "company";

export function getEmailLocalPart(email: string): string {
	const at = email.indexOf("@");
	return (at === -1 ? email : email.slice(0, at)).toLowerCase();
}

export function formatDateYYYYMMDD(date: Date = new Date()): string {
	const yyyy = String(date.getFullYear());
	const mm = String(date.getMonth() + 1).padStart(2, "0");
	const dd = String(date.getDate()).padStart(2, "0");
	return `${yyyy}-${mm}-${dd}`;
}

export function sanitizePathSegment(input: string): string {
	return input
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9-]/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$ /g, "");
}

export function normalizeExtension(ext: string): string {
	const cleaned = ext.startsWith(".") ? ext.slice(1) : ext;
	if (cleaned.includes("/") || cleaned.includes("\\")) {
		throw new Error("Invalid file extension");
	}
	return cleaned.toLowerCase();
}

export function buildTenantSubmissionPath(params: {
	companyId: string;
	department: string;
	lessonSlug: string;
	email: string;
	submissionId: string | number;
	ext: string;
	date?: Date;
}): string {
	const companyId = sanitizePathSegment(params.companyId);
	const department = sanitizePathSegment(params.department);
	const lessonSlug = sanitizePathSegment(params.lessonSlug);
	const emailLocal = sanitizePathSegment(getEmailLocalPart(params.email));
	const submissionId = String(params.submissionId).replace(/[^a-zA-Z0-9-_.]/g, "");
	const ext = normalizeExtension(params.ext);
	const dateStr = formatDateYYYYMMDD(params.date ?? new Date());
	return `${companyId}/${department}/${lessonSlug}/${dateStr}_${emailLocal}_${submissionId}.${ext}`;
}

export function buildPublicLessonPath(params: { scope: PublicLessonScope; lessonSlug: string; companyId?: string; ext?: string }): string {
	const lessonSlug = sanitizePathSegment(params.lessonSlug);
	const ext = normalizeExtension(params.ext ?? "pdf");
	if (params.scope === "global") {
		return `global/${lessonSlug}.${ext}`;
	}
	const companyId = sanitizePathSegment(params.companyId || "");
	if (!companyId) throw new Error("companyId required for company-scoped public lesson path");
	return `${companyId}/${lessonSlug}.${ext}`;
}

export function isTenantSubmissionKey(key: string): boolean {
	return /^[a-z0-9-]{2,}\/[a-z0-9-]+\/[a-z0-9-]+\/[0-9]{4}-[0-9]{2}-[0-9]{2}_[a-z0-9-]+_[A-Za-z0-9_.-]+\.[A-Za-z0-9]+$/.test(key);
}

export function isPublicLessonKey(key: string): boolean {
	return /^global\/[a-z0-9-]+\.[A-Za-z0-9]+$/.test(key) || /^[a-z0-9-]{2,}\/[a-z0-9-]+\.[A-Za-z0-9]+$/.test(key);
}


