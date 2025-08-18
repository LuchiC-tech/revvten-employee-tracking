"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignupPage({ params }: { params: { company: string } }) {
	const router = useRouter();
	const search = useSearchParams();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [department, setDepartment] = useState("Sales");
	const [displayName, setDisplayName] = useState("");
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
			const { data, error } = await supabase.auth.signUp({ email, password });
			if (error) throw error;
			// Validate company access code for this tenant (early feedback)
			const validate = await fetch(`/api/auth/validate-code`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ companyLoginId: params.company.toLowerCase(), code }),
			});
			if (!validate.ok) throw new Error(await validate.text());
			// send OTP or rely on email confirmation depending on project settings
			await fetch(`/api/auth/send-verify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }).catch(() => {});
			// move to verify screen, passing context
			router.replace(`/t/${params.company}/auth/verify?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}&department=${encodeURIComponent(department)}&display=${encodeURIComponent(displayName || email.split('@')[0])}`);
		} catch (e: any) {
			setMsg(e?.message || "Sign up failed");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-[70vh] bg-gradient-to-b from-blue-50 to-white">
			<div className="mx-auto max-w-md p-6 pb-20 pt-16">
				<div className="rounded-2xl border border-blue-100 bg-white/70 p-8 shadow-sm backdrop-blur">
					<h1 className="mb-1 text-center text-2xl font-bold text-blue-700">Create account for {params.company}</h1>
					<p className="mb-6 text-center text-sm text-blue-900/70">We’ll verify your email and bind your role with the company code.</p>
					<div className="space-y-3">
						<Input placeholder="Work email" value={email} onChange={(e) => setEmail(e.target.value)} />
						<Input type="password" placeholder="Set password" value={password} onChange={(e) => setPassword(e.target.value)} />
						<Input placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
						<Input placeholder="Display name (optional)" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
						<Input placeholder="Company access code" value={code} onChange={(e) => setCode(e.target.value)} />
						<Button className="h-10 w-full bg-blue-600 text-white hover:bg-blue-700" onClick={onSubmit} disabled={!email || !password || !code || loading}>{loading ? "Creating…" : "Create Account"}</Button>
						{msg ? <p className="text-center text-sm text-red-600">{msg}</p> : null}
					</div>
				</div>
				<p className="mt-4 text-center text-xs text-blue-900/60">You’ll receive a one-time code to verify your email.</p>
			</div>
		</div>
	);
}


