-- Example bucket and RLS policies for Supabase Storage (apply in your Supabase project)
-- Buckets:
--   tenant-submissions (private)
--   public-lessons (public)

-- NOTE: Replace auth.role() checks with your real auth once wired.

-- Public lessons readable by anyone
-- Set bucket public via dashboard OR use storage.objects policies like:
-- create policy "Public read for public-lessons"
-- on storage.objects for select
-- using ( bucket_id = 'public-lessons' );

-- Tenant submissions: only allow writes/reads for correct tenant and role
-- Path format: {companyId}/{department}/{lessonSlug}/{YYYY-MM-DD}_{emailLocal}_{submissionId}.{ext}
-- Example guard (pseudo):
-- using (
--   bucket_id = 'tenant-submissions'
--   and (auth.role() in ('employee','manager','revv_admin'))
--   and (position((auth.jwt() ->> 'company') in storage.filename(name)) = 1)
-- );

-- You will refine these when real auth claims are available.


