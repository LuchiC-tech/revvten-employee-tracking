import Link from "next/link";
import { getBrandForSlug } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function TenantHomePage({ params }: { params: { company: string } }) {
	const brand = getBrandForSlug(params.company);
	return (
		<div className="space-y-8 rounded-2xl border border-blue-100 bg-white/70 p-8 shadow-sm backdrop-blur">
			<div>
				<h1 className="text-3xl font-bold text-blue-700">{brand.name}</h1>
				<p className="text-sm text-blue-900/70">You’re accessing the {params.company} tenant.</p>
			</div>
			<div className="grid gap-3 sm:grid-cols-2">
				<Link href={`/t/${params.company}/auth/login`} className="block">
					<Button className="h-11 w-full bg-blue-600 text-white hover:bg-blue-700">Log in</Button>
				</Link>
				<Link href={`/t/${params.company}/auth/signup`} className="block">
					<Button className="h-11 w-full" variant="outline">Sign up</Button>
				</Link>
			</div>
			<p className="text-xs text-blue-900/60">Company-first onboarding. Your role and access are enforced by RLS.</p>
		</div>
	);
}


