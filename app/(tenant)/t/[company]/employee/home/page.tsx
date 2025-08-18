import { createSupabaseServer } from "@/lib/supabase/server";
import { fetchCompanyBySlug } from "@/lib/tenant/fetchCompany";

export default async function EmployeeHomePage({ params }: { params: { company: string } }) {
	const company = await fetchCompanyBySlug(params.company);
	const supabase = createSupabaseServer();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	// Debug ping for SSR user visibility
	try {
		await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3002'}/api/auth/ping`, { cache: 'no-store' });
	} catch {}

	let profile: any = null;
	if (user && company) {
		const { data } = await supabase
			.from("revvten.profiles")
			.select("email, department, role, display_name")
			.eq("user_id", user.id)
			.eq("company_id", company.id)
			.maybeSingle();
		profile = data || null;
	}

	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<h1 className="text-3xl font-bold text-blue-700">Welcome{profile?.display_name ? `, ${profile.display_name}` : ""}</h1>
				<p className="text-sm text-blue-900/70">Company: {params.company}</p>
			</div>
			<div className="grid gap-4 sm:grid-cols-3">
				<div className="rounded-2xl border border-blue-100 bg-white/70 p-5 shadow-sm">
					<p className="text-xs text-blue-900/70">Department</p>
					<p className="text-lg font-semibold">{profile?.department || "—"}</p>
				</div>
				<div className="rounded-2xl border border-blue-100 bg-white/70 p-5 shadow-sm">
					<p className="text-xs text-blue-900/70">Role</p>
					<p className="text-lg font-semibold">{profile?.role || "employee"}</p>
				</div>
				<div className="rounded-2xl border border-blue-100 bg-white/70 p-5 shadow-sm">
					<p className="text-xs text-blue-900/70">Progress</p>
					<p className="text-lg font-semibold">First submission will unlock stats</p>
				</div>
			</div>
			<div className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm">
				<h2 className="mb-1 text-xl font-semibold text-blue-700">What’s next</h2>
				<p className="text-sm text-blue-900/70">Go to Lessons to get started. Your scores and rankings will appear here after your first graded submission.</p>
			</div>
		</div>
	);
}


