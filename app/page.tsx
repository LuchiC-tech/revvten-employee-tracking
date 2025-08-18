"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isValidCompanySlug } from "@/lib/utils";

function TenantGateInner() {
	const router = useRouter();
	const search = useSearchParams();
	const [slug, setSlug] = useState("");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const err = search.get("error");
		if (err) setError(err);
	}, [search]);

	return (
		<main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
			<div className="mx-auto flex max-w-xl flex-col items-stretch justify-center gap-6 p-6 pb-20 pt-24">
				<div className="rounded-2xl border border-blue-100 bg-white/70 p-8 shadow-sm backdrop-blur">
					<h1 className="mb-1 text-center text-3xl font-bold text-blue-700">Welcome to RevvTen</h1>
					<p className="mb-6 text-center text-sm text-blue-900/70">Enter your company’s unique login ID to continue.</p>
					<div className="space-y-2">
						<label className="text-sm font-medium text-blue-900">Company Login ID</label>
						<Input placeholder="e.g. board" value={slug} onChange={(e) => setSlug(e.target.value)} />
						{error ? <p className="text-sm text-red-600">{error}</p> : null}
					</div>
					<Button
						className="mt-4 h-10 w-full bg-blue-600 text-white hover:bg-blue-700"
						onClick={() => {
							if (!isValidCompanySlug(slug)) {
								setError("Invalid Company Login ID");
								return;
							}
							router.push(`/t/${slug.toLowerCase()}`);
						}}
					>
						Continue
					</Button>
				</div>
				<p className="text-center text-xs text-blue-900/60">Secure by design with Supabase Auth and RLS</p>
			</div>
		</main>
	);
}

export default function TenantGatePage() {
	return (
		<Suspense>
			<TenantGateInner />
		</Suspense>
	);
}
