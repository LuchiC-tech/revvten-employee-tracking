"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function VerifyPage({ params }: { params: { company: string } }) {
	const router = useRouter();
	const search = useSearchParams();
	const email = search.get("email") || "";
	const code = search.get("code") || "";
	const department = search.get("department") || "Sales";
	const display = search.get("display") || (email ? email.split('@')[0] : "User");
	const [token, setToken] = useState("");
	const [loading, setLoading] = useState(false);
	const [msg, setMsg] = useState("");

	const disabled = useMemo(() => !email || !token || !code, [email, token, code]);

	async function onVerify() {
		try {
			setLoading(true);
			setMsg("");
			const supabase = createSupabaseBrowser();
			const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' as any });
			if (error) throw error;
			// Bridge tokens to server cookies so SSR sees the session
			const { data: { session } } = await supabase.auth.getSession();
			if (!session?.access_token || !session?.refresh_token) throw new Error('Missing session tokens');
			await fetch('/api/auth/sync', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ access_token: session.access_token, refresh_token: session.refresh_token }),
				credentials: 'include',
			});
			// Bind profile with provided code; role derived by RPC
			const res = await fetch(`/api/auth/bind-with-code`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ companyLoginId: params.company.toLowerCase(), code, displayName: display, department }),
			});
			if (!res.ok) throw new Error(await res.text());
			const { role } = await res.json();
			await fetch('/api/auth/ping', { cache: 'no-store', credentials: 'include' }).catch(() => {});
			router.replace(role === 'manager' ? `/t/${params.company}/manager/overview` : `/t/${params.company}/employee/home`);
		} catch (e: any) {
			setMsg(e?.message || 'Verification failed');
		} finally {
			setLoading(false);
		}
	}

	// Fallback: if project is configured for Magic Links, detect session and finalize
	useEffect(() => {
		(async () => {
			try {
				const supabase = createSupabaseBrowser();
				const { data } = await supabase.auth.getUser();
				if (data.user) {
					setMsg('Session detected. Finalizing your signup…');
					setLoading(true);
					// Bridge tokens to server cookies for SSR guards
					const { data: { session } } = await supabase.auth.getSession();
					if (session?.access_token && session?.refresh_token) {
						await fetch('/api/auth/sync', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ access_token: session.access_token, refresh_token: session.refresh_token }),
							credentials: 'include',
						});
					}
					const res = await fetch(`/api/auth/bind-with-code`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ companyLoginId: params.company.toLowerCase(), code, displayName: display, department }),
					});
					if (!res.ok) throw new Error(await res.text());
					const { role } = await res.json();
					await fetch('/api/auth/ping', { cache: 'no-store', credentials: 'include' }).catch(() => {});
					router.replace(role === 'manager' ? `/t/${params.company}/manager/overview` : `/t/${params.company}/employee/home`);
				}
			} catch (e: any) {
				setMsg(e?.message || 'Automatic finalize failed. Enter your code below.');
			} finally {
				setLoading(false);
			}
		})();
	}, [params.company, code, department, display]);

	return (
		<div className="min-h-[70vh] bg-gradient-to-b from-blue-50 to-white">
			<div className="mx-auto max-w-md p-6 pb-20 pt-16">
				<div className="rounded-2xl border border-blue-100 bg-white/70 p-8 shadow-sm backdrop-blur">
					<h1 className="mb-1 text-center text-2xl font-bold text-blue-700">Verify your email</h1>
					<p className="mb-6 text-center text-sm text-blue-900/70">We sent a one-time code to {email}. If your email shows a magic link instead, click it and we’ll continue automatically.</p>
					<div className="space-y-3">
						<Input placeholder="One-time code" value={token} onChange={(e) => setToken(e.target.value)} />
						<Button className="h-10 w-full bg-blue-600 text-white hover:bg-blue-700" onClick={onVerify} disabled={disabled || loading}>{loading ? 'Verifying…' : 'Verify'}</Button>
						{msg ? <p className="text-center text-sm text-red-600">{msg}</p> : null}
					</div>
				</div>
				<p className="mt-4 text-center text-xs text-blue-900/60">After verification, we’ll bind your role and take you to your dashboard.</p>
			</div>
		</div>
	);
}


