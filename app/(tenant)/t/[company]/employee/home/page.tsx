import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

type Params = { company: string };

export default async function EmployeeHome({ params }: { params: Params }) {
	const supabase = createSupabaseServer();
	const slug = params.company.toLowerCase();

	// 1) Resolve company via RPC (public.resolve_company_by_login)
	const { data: cdata, error: compErr } = await supabase
		.rpc("resolve_company_by_login", { _login: slug });
	const company = Array.isArray(cdata) ? (cdata as any)[0] : (cdata as any);
	if (compErr || !company?.id) notFound();
	const companyId: string = company.id;

	// Read user for membership check
	const { data: userWrap } = await supabase.auth.getUser();
	const uid = userWrap?.user?.id as string | undefined;
	if (!uid) redirect(`/t/${slug}/auth/login`);

	// 2) Membership guard (revvten.company_users); no role gating
	const { data: membership } = await (supabase as any)
		.schema("revvten")
		.from("company_users")
		.select("id")
		.eq("company_id", companyId)
		.eq("user_id", uid)
		.maybeSingle();
	if (!membership) redirect(`/t/${slug}/auth/login`);

	// 3) Profile (department & role shown in header cards)
	const { data: profile } = await (supabase as any)
		.schema("revvten")
		.from("profiles")
		.select("department, role")
		.eq("company_id", companyId)
		.eq("user_id", uid)
		.maybeSingle();

	// 4) Active lessons (global or company-specific)
	const { data: allLessons } = await (supabase as any)
		.schema("revvten")
		.from("lessons")
		.select("id, title, company_id, created_at, is_active")
		.eq("is_active", true);
	const lessons = (allLessons || [])
		.filter((l: any) => l.company_id === null || l.company_id === companyId)
		.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
		.slice(0, 5);
	const nextLesson = lessons?.[0];

	// 5) Last 3 submissions for the current user (RLS handles user_id = auth.uid())
	const { data: subs } = await (supabase as any)
		.schema("revvten")
		.from("submissions")
		.select("id, status, created_at, lesson_id")
		.order("created_at", { ascending: false })
		.limit(3);
	const submissions = subs || [];
	const lessonIds = Array.from(new Set(submissions.map((s: any) => s.lesson_id).filter(Boolean)));
	let lessonTitleById: Record<string, string> = {};
	if (lessonIds.length > 0) {
		const { data: lessonRows } = await (supabase as any)
			.schema("revvten")
			.from("lessons")
			.select("id, title")
			.in("id", lessonIds as any);
		lessonTitleById = (lessonRows || []).reduce((acc: any, r: any) => {
			acc[r.id] = r.title;
			return acc;
		}, {} as Record<string, string>);
	}

	return (
		<div className="space-y-8">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="rounded-2xl border p-4">
					<div className="text-sm text-muted-foreground">Department</div>
					<div className="text-xl font-medium">
						{profile?.department ?? "—"}
					</div>
				</div>
				<div className="rounded-2xl border p-4">
					<div className="text-sm text-muted-foreground">Role</div>
					<div className="text-xl font-medium">
						{profile?.role ?? "employee"}
					</div>
				</div>
				<div className="rounded-2xl border p-4">
					<div className="text-sm text-muted-foreground">Progress</div>
					<div className="text-xl font-medium">
						{submissions.length ? "Keep going!" : "First submission will unlock stats"}
					</div>
				</div>
			</div>

			<div className="rounded-2xl border p-6 space-y-3">
				<div className="text-lg font-semibold">What’s next</div>
				{nextLesson ? (
					<div className="flex items-center justify-between">
						<div>
							<div className="text-sm text-muted-foreground">Next lesson</div>
							<div className="text-base font-medium">{nextLesson.title}</div>
						</div>
						<Link href={`/t/${slug}/employee/lessons/${nextLesson.id}`} className="inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium hover:bg-accent">
							Start
						</Link>
					</div>
				) : (
					<div className="text-sm">
						No lessons yet. <Link href={`/t/${slug}/employee/lessons`} className="underline">Browse all lessons</Link>
					</div>
				)}
			</div>

			{/* Lessons (quick list) */}
			<div className="rounded-2xl border p-6 space-y-4">
				<div className="flex items-center justify-between">
					<div className="text-lg font-semibold">Lessons</div>
					<Link href={`/t/${slug}/employee/lessons`} className="text-sm text-blue-600 hover:underline">View all</Link>
				</div>
				{lessons.length === 0 ? (
					<div className="text-sm text-muted-foreground">No active lessons yet.</div>
				) : (
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{lessons.slice(0, 6).map((l: any) => (
							<div key={l.id} className="rounded-xl border p-4">
								<div className="text-sm text-muted-foreground">{l.company_id ? "Company lesson" : "Global lesson"}</div>
								<div className="mt-1 text-base font-semibold">{l.title}</div>
								<div className="mt-3 flex items-center gap-2">
									<Link href={`/t/${slug}/employee/lessons/${l.id}`} className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-accent">Open</Link>
									<Link href={`/t/${slug}/employee/lessons/${l.id}`} className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700">Certify my skills</Link>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			<div className="rounded-2xl border p-6 space-y-4">
				<div className="text-lg font-semibold">Recent submissions</div>
				{!submissions.length ? (
					<div className="text-sm text-muted-foreground">
						Nothing yet—once you submit, you’ll see the last 3 attempts here.
					</div>
				) : (
					<ul className="divide-y">
						{submissions.map((s: any) => (
							<li key={s.id} className="py-3 flex items-center justify-between">
								<div className="space-y-0.5">
									<div className="font-medium">
										{lessonTitleById[s.lesson_id] ?? "Lesson"}
									</div>
									<div className="text-sm text-muted-foreground">
										{new Date(s.created_at).toLocaleString()}
									</div>
								</div>
								<span className="rounded-full border px-3 py-1 text-xs capitalize">
									{s.status}
								</span>
							</li>
						))}
					</ul>
				)}
				<div className="pt-2">
					<Link href={`/t/${slug}/employee/submissions`} className="inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium hover:bg-accent">
						View all submissions
					</Link>
				</div>
			</div>
		</div>
	);
}


