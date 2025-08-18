import { TenantProvider } from "@/app/providers";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { SessionDebug } from "@/components/SessionDebug";
import { getBrandForSlug, isValidCompanySlug } from "@/lib/utils";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import { UnknownCompany } from "@/components/guards/UnknownCompany";
import { fetchCompanyBySlug } from "@/lib/tenant/fetchCompany";

export default async function TenantLayout({ children, params }: { children: React.ReactNode; params: { company: string } }) {
	if (!isValidCompanySlug(params.company)) {
		redirect("/?error=Invalid%20Company%20Login%20ID");
	}
	const company = await fetchCompanyBySlug(params.company);
	if (!company) {
 		return (
 			<div className="min-h-[60vh] p-6">
 				<UnknownCompany companyLoginId={params.company} />
 			</div>
 		);
 	}
	const brand = getBrandForSlug(params.company);
	return (
		<TenantProvider companyParam={company.company_login_id}>
			<div className="min-h-screen">
				<header className="flex items-center justify-between border-b p-4" style={{ borderColor: brand.primaryColor }}>
					<Link href={`/t/${company.company_login_id}`} className="text-xl font-bold" style={{ color: brand.primaryColor }}>
						{brand.logoText}
					</Link>
					<div className="flex items-center gap-3">
						<ThemeSwitcher />
						<LogoutButton />
					</div>
				</header>
				<main className="p-6">{children}</main>
				<SessionDebug company={company.company_login_id} />
			</div>
		</TenantProvider>
	);
}


