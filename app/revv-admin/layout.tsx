import { AdminAuthGate } from "@/components/guards/AdminAuthGate";
import { SessionDebug } from "@/components/SessionDebug";
import { AdminTabs } from "@/components/admin/AdminTabs";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	return (
		<AdminAuthGate>
			<div>
				<AdminTabs />
				{children}
				<SessionDebug />
			</div>
		</AdminAuthGate>
	);
}


