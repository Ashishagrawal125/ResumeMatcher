'use server';
/**
 * @fileOverview Processes a bulk of resumes to generate feedback emails.
 *
 * - bulkGenerateFeedback - A function that handles the entire bulk processing workflow.
 */

import { ai } from '@/ai/genkit';
import {
  BulkGenerateFeedbackInputSchema,
  BulkGenerateFeedbackOutputSchema,
  type BulkGenerateFeedbackInput,
  type BulkGenerateFeedbackOutput,
} from './bulk-generate-feedback-types';
import { parseUploadedResume } from './parse-uploaded-resume';
import { matchResumeToJobDescription } from './match-resume-to-job-description';
import { generateFeedbackEmail } from './generate-feedback-email';
import { generateTool } from 'genkit';
import { readFileSync } from 'fs';

// Helper to convert data URI to plain text
function dataUriToText(dataUri: string): string {
    const base64Encoded = dataUri.split(',')[1];
    if (!base64Encoded) {
        throw new Error('Invalid data URI: Missing Base64 content.');
    }
    const buffer = Buffer.from(base64Encoded, 'base64');

    // For simplicity, we'll assume text files. For real-world apps,
    // you'd want to handle PDF/DOCX parsing here.
    return buffer.toString('utf-8');
}


export async function bulkGenerateFeedback(
  input: BulkGenerateFeedbackInput
): Promise<BulkGenerateFeedbackOutput> {
  return bulkGenerateFeedbackFlow(input);
}

export const bulkGenerateFeedbackFlow = ai.defineFlow(
  {
    name: 'bulkGenerateFeedbackFlow',
    inputSchema: BulkGenerateFeedbackInputSchema,
    outputSchema: BulkGenerateFeedbackOutputSchema,
  },
  async ({ resumes, jobDescriptionText, relevancyThreshold }) => {
    const results = await Promise.all(
      resumes.map(async resume => {
        try {
          const resumeText = dataUriToText(resume.resumeDataUri);

          // 1. Parse Resume
          const parsedResume = await parseUploadedResume({
            resumeText: resumeText,
          });

          // 2. Match to Job Description
          const matchResult = await matchResumeToJobDescription({
            resumeText,
            jobDescriptionText,
          });

          // 3. Determine Status
          const status =
            matchResult.relevancyScore >= relevancyThreshold ? 'SELECTED' : 'REJECTED';

          // 4. Generate Feedback Email
          const feedbackEmail = await generateFeedbackEmail({
            resumeText,
            jobDescriptionText,
            candidateName: parsedResume.personalInformation?.name || 'Candidate',
            status,
          });
          
          return {
            filename: resume.filename,
            parsedResume,
            matchResult,
            feedbackEmail,
            status,
          };

        } catch (error: any) {
          console.error(`Error processing ${resume.filename}:`, error);
          return {
            filename: resume.filename,
            status: 'ERROR' as const,
            error: error.message || 'An unknown error occurred.',
          };
        }
      })
    );

    return results;
  }
);
