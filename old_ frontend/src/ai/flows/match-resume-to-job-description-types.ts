import {z} from 'genkit';

export const MatchResumeToJobDescriptionInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume.'),
  jobDescriptionText: z.string().describe('The text content of the job description.'),
});
export type MatchResumeToJobDescriptionInput = z.infer<
  typeof MatchResumeToJobDescriptionInputSchema
>;

export const MatchResumeToJobDescriptionOutputSchema = z.object({
  relevancyScore: z
    .number()
    .describe(
      'A score (0-100) indicating how well the resume matches the job description.'
    ),
  summary: z
    .string()
    .describe(
      'A brief summary explaining the relevancy score, highlighting key matching skills and experiences.'
    ),
});
export type MatchResumeToJobDescriptionOutput = z.infer<
  typeof MatchResumeToJobDescriptionOutputSchema
>;
