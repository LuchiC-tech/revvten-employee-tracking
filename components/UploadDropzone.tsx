"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function UploadDropzone() {
	const [fileName, setFileName] = useState<string | null>(null);
	return (
		<label
			className={cn(
				"flex w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-6 text-center",
				"hover:bg-muted"
			)}
		>
			<input
				type="file"
				className="hidden"
				onChange={(e) => {
					const file = e.target.files?.[0];
					setFileName(file ? file.name : null);
				}}
			/>
			<div className="text-sm text-muted-foreground">
				{fileName ? `Selected: ${fileName}` : "Drop a file or click to select"}
			</div>
		</label>
	);
}


