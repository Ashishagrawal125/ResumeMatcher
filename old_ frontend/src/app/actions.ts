'use server';

import {
  matchResumeToJobDescription,
} from '@/ai/flows/match-resume-to-job-description';
import type { MatchResumeToJobDescriptionInput, MatchResumeToJobDescriptionOutput } from '@/ai/flows/match-resume-to-job-description-types';
import {
  generateFeedbackEmail,
} from '@/ai/flows/generate-feedback-email';
import type { GenerateFeedbackEmailInput, GenerateFeedbackEmailOutput } from '@/ai/flows/generate-feedback-email-types';
import { bulkGenerateFeedback } from '@/ai/flows/bulk-generate-feedback';
import type { BulkGenerateFeedbackInput, BulkGenerateFeedbackOutput } from '@/ai/flows/bulk-generate-feedback-types';


type MatchActionResult = {
  data?: MatchResumeToJobDescriptionOutput;
  error?: string;
};

export async function handleMatchResume(
  input: MatchResumeToJobDescriptionInput
): Promise<MatchActionResult> {
  try {
    const result = await matchResumeToJobDescription(input);
    return { data: result };
  } catch (e: any) {
    console.error(e);
    // Provide a user-friendly error message
    return { error: e.message || 'An unexpected error occurred. Please try again.' };
  }
}

type FeedbackActionResult = {
  data?: GenerateFeedbackEmailOutput;
  error?: string;
};

export async function handleGenerateFeedback(
  input: GenerateFeedbackEmailInput
): Promise<FeedbackActionResult> {
  try {
    const result = await generateFeedbackEmail(input);
    return { data: result };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'An unexpected error occurred. Please try again.' };
  }
}

type BulkFeedbackActionResult = {
    data?: BulkGenerateFeedbackOutput;
    error?: string;
}

export async function handleBulkGenerateFeedback(
    input: BulkGenerateFeedbackInput
): Promise<BulkFeedbackActionResult> {
    try {
        const result = await bulkGenerateFeedback(input);
        return { data: result };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'An unexpected error occurred. Please try again.' };
    }
}
