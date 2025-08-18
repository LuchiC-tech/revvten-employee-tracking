import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function UnknownCompany({ companyLoginId }: { companyLoginId: string }) {
	return (
		<Card className="max-w-xl">
			<CardHeader>
				<CardTitle>Unknown company</CardTitle>
				<CardDescription>
					We couldn’t find a tenant for &quot;{companyLoginId}&quot;. Check the link or contact your program lead.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Link href="/">
					<Button>Go to home</Button>
				</Link>
			</CardContent>
		</Card>
	);
}


