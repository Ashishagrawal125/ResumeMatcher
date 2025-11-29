import { z } from 'zod';

export const GenerateFeedbackEmailInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume.'),
  jobDescriptionText: z.string().describe('The text content of the job description.'),
  candidateName: z.string().describe("The candidate's name.").optional(),
  status: z.enum(['SELECTED', 'REJECTED']).describe('The selection status of the candidate.'),
});
export type GenerateFeedbackEmailInput = z.infer<typeof GenerateFeedbackEmailInputSchema>;

export const GenerateFeedbackEmailOutputSchema = z.object({
  subject: z.string().describe('The subject line of the email.'),
  body: z.string().describe('The body of the email.'),
});
export type GenerateFeedbackEmailOutput = z.infer<typeof GenerateFeedbackEmailOutputSchema>;
