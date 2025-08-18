"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { writeSession } from "@/lib/session";

export default function LoginPage({ params }: { params: { company: string } }) {
	const router = useRouter();
	const search = useSearchParams();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [code, setCode] = useState("");
	const [loading, setLoading] = useState(false);
	const [msg, setMsg] = useState("");

	useEffect(() => {
		const e = search.get("email");
		if (e) setEmail(e);
	}, [search]);

	async function onSubmit() {
		try {
			setLoading(true);
			setMsg("");
			// Perform auth and bind on the server so cookies are correctly set for SSR
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password, companyLoginId: params.company.toLowerCase(), code }),
			});
			if (!res.ok) {
				const msg = await res.text();
				throw new Error(msg || 'Login failed');
			}
			const role = res.headers.get('x-role') || 'employee';
			// Bridge tokens to server cookies in case Supabase cookie-based auth is disabled/misconfigured
			try {
				const supabase = createSupabaseBrowser();
				const { data: { session } } = await supabase.auth.getSession();
				if (session?.access_token && session?.refresh_token) {
					await fetch('/api/auth/sync', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ access_token: session.access_token, refresh_token: session.refresh_token })
					});
				}
			} catch {}
			writeSession({ role: role as any, email, company: params.company.toLowerCase(), extra: {} });
			router.replace(role === 'manager' ? `/t/${params.company}/manager/overview` : `/t/${params.company}/employee/home`);
		} catch (e: any) {
			setMsg(e?.message || 'Login failed');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-[70vh] bg-gradient-to-b from-blue-50 to-white">
			<div className="mx-auto max-w-md p-6 pb-20 pt-16">
				<div className="rounded-2xl border border-blue-100 bg-white/70 p-8 shadow-sm backdrop-blur">
					<h1 className="mb-1 text-center text-2xl font-bold text-blue-700">Log in to {params.company}</h1>
					<p className="mb-6 text-center text-sm text-blue-900/70">Enter your credentials and company access code.</p>
					<div className="space-y-3">
						<Input placeholder="Work email" value={email} onChange={(e) => setEmail(e.target.value)} />
						<Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
						<Input placeholder="Company access code" value={code} onChange={(e) => setCode(e.target.value)} />
						<Button className="h-10 w-full bg-blue-600 text-white hover:bg-blue-700" onClick={onSubmit} disabled={!email || !password || !code || loading}>{loading ? "Signing in…" : "Log in"}</Button>
						{msg ? <p className="text-center text-sm text-red-600">{msg}</p> : null}
					</div>
				</div>
				<p className="mt-4 text-center text-xs text-blue-900/60">Use your company’s current access code to pick your role for this session.</p>
			</div>
		</div>
	);
}


