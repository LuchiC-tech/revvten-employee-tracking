import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { ManagerTabs } from "@/components/manager/ManagerTabs";
import { UnknownCompany } from "@/components/guards/UnknownCompany";
import { fetchCompanyBySlug } from "@/lib/tenant/fetchCompany";

type CompanyLite = { id: string; name: string; company_login_id: string };

export default async function ManagerLayout({ children, params }: { children: ReactNode; params: { company: string } }) {
	const supabase = createSupabaseServer();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	const company = await fetchCompanyBySlug(params.company);
	if (!company) {
		return (
			<div className="container mx-auto p-6">
				<UnknownCompany companyLoginId={params.company} />
			</div>
		);
	}

	if (!user) {
		redirect(`/t/${company.company_login_id}/auth/login`);
	}

	const { data: profile } = await supabase
		.from("revvten.profiles")
		.select("user_id, company_id, email, role, department")
		.eq("user_id", user.id)
		.eq("company_id", company.id)
		.maybeSingle();

	const isBoundToThisCompany = profile?.company_id === company.id;
	const isManager = profile?.role === "manager" || profile?.role === "revv_admin";

	if (!isBoundToThisCompany) {
		redirect(`/t/${company.company_login_id}/auth/login`);
	}

	if (!isManager) {
		redirect(`/t/${company.company_login_id}/auth/login?role=manager`);
	}

	return (
		<div className="container mx-auto p-6">
			<h1 className="mb-4 text-3xl font-bold">Manager</h1>
			<ManagerTabs company={params.company} />
			{children}
		</div>
	);
}


