export default function ManagerOverviewPage({ params }: { params: { company: string } }) {
	return (
		<div className="space-y-4">
			<h1 className="text-3xl font-bold">Overview — {params.company}</h1>
			<p className="text-muted-foreground">Company average, department averages, participation, completions over time will show here.</p>
		</div>
	);
}


