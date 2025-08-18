export default function ManagerLeaderboardsPage({ params }: { params: { company: string } }) {
	return <h1 className="text-3xl font-bold">Manager Leaderboards — Company: {params.company}</h1>;
}


