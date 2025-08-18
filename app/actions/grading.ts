'use server'

import { createSupabaseAdmin } from '@/lib/supabase/server'

export async function publishScore(args: {
	submissionId: string
	rubric: any
	score: number
	feedback: string
}) {
	const admin = createSupabaseAdmin()
	const { data, error } = await admin.rpc('publish_score', {
		_submission_id: args.submissionId,
		_rubric_breakdown: args.rubric,
		_score: args.score,
		_feedback_md: args.feedback
	})
	if (error) throw error
	return data
}


