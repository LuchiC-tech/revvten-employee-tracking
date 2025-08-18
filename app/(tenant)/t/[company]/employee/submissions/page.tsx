export default function EmployeeSubmissionsPage({ params }: { params: { company: string } }) {
	return <h1 className="text-3xl font-bold">Employee Submissions — Company: {params.company}</h1>;
}


