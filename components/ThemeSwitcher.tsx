"use client";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeSwitcher() {
	const { theme, setTheme } = useTheme();
	const next = theme === "light" ? "dark" : "light";
	return (
		<Button variant="outline" size="sm" onClick={() => setTheme(next)}>
			Theme: {theme ?? "system"} → {next}
		</Button>
	);
}


