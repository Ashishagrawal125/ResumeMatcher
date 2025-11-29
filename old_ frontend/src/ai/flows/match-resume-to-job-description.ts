'use server';
/**
 * @fileOverview Matches a resume to a job description and provides a relevancy score.
 *
 * - matchResumeToJobDescription - A function that handles the resume matching process.
 */

import {ai} from '@/ai/genkit';
import { MatchResumeToJobDescriptionInputSchema, MatchResumeToJobDescriptionOutputSchema, type MatchResumeToJobDescriptionInput, type MatchResumeToJobDescriptionOutput } from './match-resume-to-job-description-types';


export async function matchResumeToJobDescription(
  input: MatchResumeToJobDescriptionInput
): Promise<MatchResumeToJobDescriptionOutput> {
  return matchResumeToJobDescriptionFlow(input);
}

const matchResumeToJobDescriptionPrompt = ai.definePrompt({
  name: 'matchResumeToJobDescriptionPrompt',
  input: {schema: MatchResumeToJobDescriptionInputSchema},
  output: {schema: MatchResumeToJobDescriptionOutputSchema},
  prompt: `You are an AI resume matcher. Given a resume and a job description, you will output a relevancy score (0-100) and a summary explaining the score.

Resume:
{{resumeText}}

Job Description:
{{jobDescriptionText}}

Output the relevancy score and summary in JSON format. The relevancy score is a number between 0 and 100. The summary explains the relevancy score, highlighting key matching skills and experiences.
`,
});

const matchResumeToJobDescriptionFlow = ai.defineFlow(
  {
    name: 'matchResumeToJobDescriptionFlow',
    inputSchema: MatchResumeToJobDescriptionInputSchema,
    outputSchema: MatchResumeToJobDescriptionOutputSchema,
  },
  async input => {
    const {output} = await matchResumeToJobDescriptionPrompt(input);
    return output!;
  }
);
