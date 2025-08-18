"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
			const supabase = createSupabaseBrowser();
			const { error } = await supabase.auth.signInWithPassword({ email, password });
			if (error) throw error;

			// Resolve company and existing department to preserve it when rebinding
			const { data: companyData } = await supabase.rpc('resolve_company_by_login', { _login: params.company.toLowerCase() });
			const company: any = Array.isArray(companyData) ? (companyData as any)[0] : (companyData as any);
			if (!company?.id) throw new Error('Unknown tenant');

			const { data: userRes } = await supabase.auth.getUser();
			const userId = userRes?.user?.id;
			if (!userId) throw new Error('Session not established');

			const { data: existing } = await supabase
				.from('revvten.profiles')
				.select('department')
				.eq('user_id', userId)
				.eq('company_id', company.id)
				.maybeSingle();
			const departmentSafe = existing?.department || 'Sales';
			const displayName = (email.split('@')[0] || 'User');

			// Single authoritative bind: validates code and sets role
			const { data: bindData, error: bindErr } = await supabase.rpc('bind_profile_with_code', {
				_company_login_id: params.company.toLowerCase(),
				_plain_code: code,
				_display_name: displayName,
				_department: departmentSafe,
			} as any);
			if (bindErr) throw bindErr;
			const role = (bindData as any)?.role || 'employee';

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


