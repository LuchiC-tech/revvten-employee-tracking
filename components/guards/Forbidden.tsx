import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function Forbidden({ title = "Forbidden", description, action }: { title?: string; description?: string; action?: { href: string; label: string } }) {
	return (
		<Card className="max-w-md">
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{description ? <CardDescription>{description}</CardDescription> : null}
			</CardHeader>
			<CardContent>
				{action ? (
					<Link href={action.href}>
						<Button>{action.label}</Button>
					</Link>
				) : null}
			</CardContent>
		</Card>
	);
}


