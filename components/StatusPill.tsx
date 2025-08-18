import { cn } from "@/lib/utils";

export type Status = "Pending" | "In Review" | "Scored" | "Returned";

export function StatusPill({ status }: { status: Status }) {
	const color =
		status === "Pending"
			? "bg-yellow-100 text-yellow-800"
			: status === "In Review"
			? "bg-blue-100 text-blue-800"
			: status === "Scored"
			? "bg-green-100 text-green-800"
			: "bg-red-100 text-red-800";
	return <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", color)}>{status}</span>;
}


