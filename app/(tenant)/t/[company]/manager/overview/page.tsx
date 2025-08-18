import { createSupabaseServer } from "@/lib/supabase/server";
import { fetchCompanyBySlug } from "@/lib/tenant/fetchCompany";

export default async function ManagerOverviewPage({ params }: { params: { company: string } }) {
	const company = await fetchCompanyBySlug(params.company);
	const supabase = createSupabaseServer();
	const { data: { user } } = await supabase.auth.getUser();

	let counts: any = null;
	if (user && company) {
		// Example card data placeholder; wire real metrics later
		counts = { employees: '—', submissions: '—', activeLessons: '—' };
	}

	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<h1 className="text-3xl font-bold text-blue-700">Manager Overview</h1>
				<p className="text-sm text-blue-900/70">Company: {params.company}</p>
			</div>
			<div className="grid gap-4 sm:grid-cols-3">
				<div className="rounded-2xl border border-blue-100 bg-white/70 p-5 shadow-sm">
					<p className="text-xs text-blue-900/70">Employees</p>
					<p className="text-lg font-semibold">{counts?.employees}</p>
				</div>
				<div className="rounded-2xl border border-blue-100 bg-white/70 p-5 shadow-sm">
					<p className="text-xs text-blue-900/70">Submissions</p>
					<p className="text-lg font-semibold">{counts?.submissions}</p>
				</div>
				<div className="rounded-2xl border border-blue-100 bg-white/70 p-5 shadow-sm">
					<p className="text-xs text-blue-900/70">Active Lessons</p>
					<p className="text-lg font-semibold">{counts?.activeLessons}</p>
				</div>
			</div>
			<div className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm">
				<h2 className="mb-1 text-xl font-semibold text-blue-700">Recent activity</h2>
				<p className="text-sm text-blue-900/70">As employees submit lessons, you’ll see trends and leaderboards here.</p>
			</div>
		</div>
	);
}


