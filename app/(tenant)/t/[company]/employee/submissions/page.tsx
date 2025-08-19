import Link from 'next/link'
import { createSupabaseServer } from '@/lib/supabase/server'
import { fetchCompanyBySlug } from '@/lib/tenant/fetchCompany'

export default async function EmployeeSubmissionsPage({ params }: { params: { company: string } }) {
	const supabase = createSupabaseServer()
	const slug = String(params.company || '').toLowerCase()
	const company = await fetchCompanyBySlug(slug)
	const { data: { user } } = await supabase.auth.getUser()

	let items: any[] = []
	if (user && company) {
		const { data } = await (supabase as any)
			.schema('revvten')
			.from('submissions')
			.select('id, lesson_id, status, created_at')
			.eq('user_id', user.id)
			.order('created_at', { ascending: false })
			.limit(10)
		items = data || []
	}

	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold">My Submissions</h1>
			{items.length === 0 ? (
				<div className="rounded-xl border p-6 text-sm text-muted-foreground">No submissions yet. Start a lesson from <Link className="text-blue-600 hover:underline" href={`/t/${slug}/employee/lessons`}>Lessons</Link>.</div>
			) : (
				<div className="rounded-xl border">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b bg-muted/50 text-left">
								<th className="p-2">ID</th>
								<th className="p-2">Lesson</th>
								<th className="p-2">Status</th>
								<th className="p-2">Created</th>
							</tr>
						</thead>
						<tbody>
							{items.map((s) => (
								<tr key={s.id} className="border-b">
									<td className="p-2 text-xs">{s.id}</td>
									<td className="p-2 text-xs">{s.lesson_id}</td>
									<td className="p-2">
										<span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">{s.status}</span>
									</td>
									<td className="p-2 text-xs">{new Date(s.created_at).toLocaleString()}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	)
}


