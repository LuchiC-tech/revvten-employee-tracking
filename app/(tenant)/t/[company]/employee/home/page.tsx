export default function EmployeeHomePage({ params }: { params: { company: string } }) {
	return (
		<div className="space-y-4">
			<h1 className="text-3xl font-bold">My Fluency — {params.company}</h1>
			<p className="text-muted-foreground">Welcome. After your first graded submission, your total and department rank will appear here.</p>
			<div className="rounded-md border p-4">
				<p className="text-sm">This is a placeholder. Next: totals, tier, department leaderboard (names), and company rank number.</p>
			</div>
		</div>
	);
}


