import { createSupabaseBrowser } from '@/lib/supabase/browser'

export async function createSubmission(assessmentId: string, videoKey?: string) {
	const supabase = createSupabaseBrowser()
	const { data, error } = await supabase.rpc('create_submission', {
		_assessment_id: assessmentId,
		_video_url_original: videoKey ?? null,
		_thumbnail_url: null,
		_artifacts: []
	})
	if (error) throw error
	return data
}

export async function uploadSubmission(opts: {
	file: File
	companyId: string
	department: string
	lessonSlug: string
	submissionId: string
	emailLocal?: string
}) {
	const supabase = createSupabaseBrowser()
	const date = new Date().toISOString().slice(0,10)
	const ext = (opts.file.name.split('.').pop() || 'mp4').toLowerCase()
	const emailLocal = (opts.emailLocal || 'user').replace(/[^a-z0-9._-]/gi, '')
	const key = `${opts.companyId}/${opts.department}/${opts.lessonSlug}/${date}_${emailLocal}_${opts.submissionId}.${ext}`

	const { error } = await supabase.storage
		.from('tenant-submissions')
		.upload(key, opts.file, { upsert: false })
	if (error) throw error

	return key
}


