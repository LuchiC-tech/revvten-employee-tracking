export function getEmailLocalPart(email: string): string {
	const at = email.indexOf("@");
	return (at === -1 ? email : email.slice(0, at)).toLowerCase();
}

export function formatDateYYYYMMDD(date: Date = new Date()): string {
	const yyyy = String(date.getFullYear());
	const mm = String(date.getMonth() + 1).padStart(2, "0");
	const dd = String(date.getDate()).padStart(2, "0");
	return `${yyyy}-${mm}-${dd}`;
}



