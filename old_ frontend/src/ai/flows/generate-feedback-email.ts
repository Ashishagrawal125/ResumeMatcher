'use server';

/**
 * @fileOverview Generates feedback emails for job candidates.
 *
 * - generateFeedbackEmail - A function that generates a feedback email.
 */

import { ai } from '@/ai/genkit';
import { GenerateFeedbackEmailInputSchema, GenerateFeedbackEmailOutputSchema, type GenerateFeedbackEmailInput, type GenerateFeedbackEmailOutput } from './generate-feedback-email-types';

export async function generateFeedbackEmail(
  input: GenerateFeedbackEmailInput
): Promise<GenerateFeedbackEmailOutput> {
  return generateFeedbackEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFeedbackEmailPrompt',
  input: { schema: GenerateFeedbackEmailInputSchema },
  output: { schema: GenerateFeedbackEmailOutputSchema },
  prompt: `You are an expert hiring manager. Write a personalized feedback email to a job candidate based on their resume, the job description, and their application status.

Candidate Name: {{{candidateName}}}
Resume:
{{{resumeText}}}

Job Description:
{{{jobDescriptionText}}}

Status: {{{status}}}

If the status is 'SELECTED', write a positive email congratulating them and outlining next steps.
If the status is 'REJECTED', write a polite and constructive email, providing specific feedback based on the resume and job description comparison.

Generate a subject line and the email body.
`,
});

const generateFeedbackEmailFlow = ai.defineFlow(
  {
    name: 'generateFeedbackEmailFlow',
    inputSchema: GenerateFeedbackEmailInputSchema,
    outputSchema: GenerateFeedbackEmailOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
