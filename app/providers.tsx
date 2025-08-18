"use client";
import { ThemeProvider } from "next-themes";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getBrandForSlug, isValidCompanySlug, type TenantBrand } from "@/lib/utils";

type TenantContextValue = {
	company: string | null;
	brand: TenantBrand | null;
};

const TenantContext = createContext<TenantContextValue>({ company: null, brand: null });

export function useTenant(): TenantContextValue {
	return useContext(TenantContext);
}

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
			{children}
		</ThemeProvider>
	);
}

export function TenantProvider({ children, companyParam }: { children: React.ReactNode; companyParam?: string }) {
	const [company, setCompany] = useState<string | null>(null);

	useEffect(() => {
		if (companyParam && isValidCompanySlug(companyParam)) {
			setCompany(companyParam);
		} else {
			setCompany(null);
		}
	}, [companyParam]);

	const brand = useMemo(() => (company ? getBrandForSlug(company) : null), [company]);

	const value = useMemo(() => ({ company, brand }), [company, brand]);

	return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}


