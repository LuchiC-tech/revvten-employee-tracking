"use client";
import { ReactNode, useMemo, useState } from "react";
import { isAdmin, readSession, writeSession } from "@/lib/session";
import { Forbidden } from "./Forbidden";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AdminAuthGate({ children }: { children: ReactNode }) {
	const [session] = useState(readSession());
	const authed = useMemo(() => isAdmin(session), [session]);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	if (authed) return <>{children}</>;

	return (
		<div className="flex min-h-[40vh] items-center justify-center">
			<Forbidden title="Admin sign-in required" description="Access to RevvTen Admin requires sign-in." action={{ href: "#", label: "Sign in as Admin" }} />
			<div className="ml-6 w-80 space-y-3">
				<Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
				<Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
				<Button onClick={() => writeSession({ role: "revv_admin", email: email || "admin@example.com" })}>Sign in as Admin</Button>
			</div>
		</div>
	);
}


