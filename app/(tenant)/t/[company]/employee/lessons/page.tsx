import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { fetchCompanyBySlug } from "@/lib/tenant/fetchCompany";

export default async function EmployeeLessonsPage({ params }: { params: { company: string } }) {
	const supabase = createSupabaseServer();
	const slug = String(params.company || "").toLowerCase();
	const company = await fetchCompanyBySlug(slug);

	// Fetch active lessons, then filter to global or this company
	const { data } = await (supabase as any)
		.schema("revvten")
		.from("lessons")
		.select("id,title,is_active,company_id")
		.eq("is_active", true);

	const lessons = (data || []).filter(
		(l: any) => !company?.id || l.company_id === null || l.company_id === company.id
	);

	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold">Lessons</h1>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{lessons.map((l: any) => (
					<Link key={l.id} href={`/t/${slug}/employee/lessons/${l.id}`} className="rounded-xl border p-4 hover:bg-muted">
						<div className="text-sm text-muted-foreground">{l.company_id ? "Company lesson" : "Global lesson"}</div>
						<div className="mt-1 text-base font-semibold">{l.title}</div>
						<div className="mt-2 text-xs text-muted-foreground">Open to start</div>
					</Link>
				))}
				{lessons.length === 0 ? (
					<div className="rounded-xl border p-6 text-sm text-muted-foreground">No active lessons yet.</div>
				) : null}
			</div>
		</div>
	);
}


