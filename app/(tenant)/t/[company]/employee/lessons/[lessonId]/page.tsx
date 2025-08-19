"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/browser";

type SubmissionRow = { id: string; company_id: string; user_id: string; lesson_id: string; status: string };

export default function LessonDetailPage({ params }: { params: { company: string; lessonId: string } }) {
  const router = useRouter();
  const slug = String(params.company || "").toLowerCase();
  const lessonId = params.lessonId;
  const supabase = useMemo(() => createSupabaseBrowser(), []);

  const [draft, setDraft] = useState<SubmissionRow | null>(null);
  const [files, setFiles] = useState<{ name: string; kind: "recording" | "artifact"; size: number }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function ensureDraft(): Promise<SubmissionRow> {
    if (draft) return draft;
    const { data, error } = await supabase.rpc("create_draft_submission", {
      _company_login_id: slug,
      _lesson_id: lessonId,
    } as any);
    if (error) throw new Error(error.message);
    const row = Array.isArray(data) ? (data as any)[0] : (data as any);
    setDraft(row);
    return row as SubmissionRow;
  }

  async function handlePick(kind: "recording" | "artifact", blob: File) {
    try {
      setUploading(true);
      setMessage(null);
      const row = await ensureDraft();

      // Who am I?
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id as string;
      if (!userId) throw new Error("No user session");

      // Compose storage path
      const path = `company/${row.company_id}/lesson/${row.lesson_id}/user/${userId}/submission/${row.id}/${blob.name}`;

      // Upload
      const { error: upErr } = await supabase.storage
        .from("revvten-submissions")
        .upload(path, blob, { upsert: true });
      if (upErr) throw new Error(upErr.message);

      // Register file in DB
      const { error: regErr } = await supabase.rpc("add_submission_file", {
        _submission_id: row.id,
        _kind: kind,
        _storage_path: path,
        _bytes: blob.size,
      } as any);
      if (regErr) throw new Error(regErr.message);

      setFiles((prev) => [...prev, { name: blob.name, kind, size: blob.size }]);
    } catch (e: any) {
      setMessage(e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit() {
    try {
      setSubmitting(true);
      setMessage(null);
      if (!draft) throw new Error("No draft yet");
      const { data, error } = await supabase.rpc("finalize_submission", { _submission_id: draft.id } as any);
      if (error) throw new Error(error.message);
      setMessage("Submitted — Pending review");
      setTimeout(() => router.replace(`/t/${slug}/employee/submissions`), 700);
    } catch (e: any) {
      setMessage(e?.message || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    // Best-effort: list existing DB-registered files for current draft if present
    (async () => {
      try {
        if (!draft) return;
        const { data, error } = await supabase
          .schema("revvten")
          .from("submission_files")
          .select("id, kind, storage_path, bytes")
          .eq("submission_id", draft.id);
        if (!error) {
          const mapped = (data || []).map((r: any) => ({
            name: String(r.storage_path).split("/").pop() || "file",
            kind: (r.kind as "recording" | "artifact") ?? "artifact",
            size: Number(r.bytes) || 0,
          }));
          setFiles(mapped);
        }
      } catch {}
    })();
  }, [draft, supabase]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lesson</h1>
        <Link className="text-sm text-blue-600 hover:underline" href={`/t/${slug}/employee/lessons`}>
          Back to lessons
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-xl border p-4">
            <div className="text-sm text-muted-foreground">Overview</div>
            <div className="mt-1 text-base">Complete the assessment by recording your screen and attaching any artifacts.</div>
          </div>

          <div className="rounded-xl border p-4">
            <div className="text-sm text-muted-foreground">Assessment PDF</div>
            <a className="mt-1 inline-block text-blue-600 hover:underline" href="/sample.pdf" target="_blank" rel="noreferrer">
              View instructions (PDF)
            </a>
          </div>

          <div className="rounded-xl border p-4">
            <div className="mb-2 text-sm text-muted-foreground">Upload your recording</div>
            <input type="file" accept="video/*" onChange={(e) => e.target.files && handlePick("recording", e.target.files[0])} disabled={uploading || submitting} />
          </div>

          <div className="rounded-xl border p-4">
            <div className="mb-2 text-sm text-muted-foreground">Add artifacts (optional)</div>
            <input type="file" multiple onChange={(e) => {
              const list = e.target.files;
              if (!list) return;
              Array.from(list).forEach((f) => handlePick("artifact", f));
            }} disabled={uploading || submitting} />
          </div>

          <div className="rounded-xl border p-4">
            <div className="mb-2 text-sm text-muted-foreground">Files</div>
            {files.length === 0 ? (
              <div className="text-sm text-muted-foreground">No files yet.</div>
            ) : (
              <ul className="text-sm">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between border-b py-1">
                    <span>{f.name} <span className="text-xs text-muted-foreground">({f.kind})</span></span>
                    <span className="text-xs text-muted-foreground">{(f.size / (1024 * 1024)).toFixed(1)} MB</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            className="h-10 rounded-md bg-blue-600 px-4 text-white disabled:opacity-50"
            onClick={onSubmit}
            disabled={submitting || uploading || !draft || files.length === 0}
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
          {message ? <div className="text-sm text-red-600">{message}</div> : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border p-4">
            <div className="text-sm text-muted-foreground">Lesson ID</div>
            <div className="mt-1 text-xs">{lessonId}</div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="text-sm text-muted-foreground">Company</div>
            <div className="mt-1 text-xs">{slug}</div>
          </div>
        </div>
      </div>
    </div>
  );
}


