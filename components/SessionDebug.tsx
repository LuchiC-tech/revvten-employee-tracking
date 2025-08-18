"use client";
import { readSession } from "@/lib/session";
import { useEffect, useState } from "react";

export function SessionDebug({ company }: { company?: string | null }) {
	const [mounted, setMounted] = useState(false);
	const [info, setInfo] = useState<ReturnType<typeof readSession> | null>(null);

	useEffect(() => {
		setMounted(true);
		setInfo(readSession());
		const interval = setInterval(() => setInfo(readSession()), 1000);
		return () => clearInterval(interval);
	}, []);

	if (process.env.NODE_ENV !== "development" || !mounted) return null;
	return (
		<div className="fixed bottom-2 right-2 rounded bg-black/80 px-3 py-1 text-xs text-white">
			{info ? (
				<span>
					role: {info.role} {info.email ? `(${info.email})` : ""} {info.company ? `@ ${info.company}` : ""}
				</span>
			) : (
				<span>role: {company ? `| company: ${company}` : ""}</span>
			)}
		</div>
	);
}


