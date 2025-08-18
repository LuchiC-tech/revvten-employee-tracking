export default function EmployeeLessonsPage({ params }: { params: { company: string } }) {
	return <h1 className="text-3xl font-bold">Employee Lessons — Company: {params.company}</h1>;
}


