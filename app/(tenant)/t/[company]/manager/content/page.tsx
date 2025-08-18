export default function ManagerContentPage({ params }: { params: { company: string } }) {
	return <h1 className="text-3xl font-bold">Manager Content — Company: {params.company}</h1>;
}


