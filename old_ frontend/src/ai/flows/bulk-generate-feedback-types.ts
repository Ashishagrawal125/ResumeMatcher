import { z } from 'zod';
import { GenerateFeedbackEmailOutputSchema } from './generate-feedback-email-types';
import { MatchResumeToJobDescriptionOutputSchema } from './match-resume-to-job-description-types';
import { ParseUploadedResumeOutputSchema } from './parse-uploaded-resume-types';

export const BulkGenerateFeedbackInputSchema = z.object({
  jobDescriptionText: z.string().describe('The text content of the job description.'),
  resumes: z
    .array(
      z.object({
        filename: z.string(),
        resumeDataUri: z.string(),
      })
    )
    .describe('An array of resume files with their names and data URIs.'),
  relevancyThreshold: z
    .number()
    .min(0)
    .max(100)
    .describe(
      'The score threshold (0-100) to determine if a candidate is selected or rejected.'
    ),
});
export type BulkGenerateFeedbackInput = z.infer<typeof BulkGenerateFeedbackInputSchema>;

export const BulkGenerateFeedbackOutputSchema = z.array(
  z.object({
    filename: z.string(),
    parsedResume: ParseUploadedResumeOutputSchema.optional(),
    matchResult: MatchResumeToJobDescriptionOutputSchema.optional(),
    feedbackEmail: GenerateFeedbackEmailOutputSchema.optional(),
    status: z.enum(['SELECTED', 'REJECTED', 'ERROR']),
    error: z.string().optional(),
  })
);
export type BulkGenerateFeedbackOutput = z.infer<typeof BulkGenerateFeedbackOutputSchema>;
