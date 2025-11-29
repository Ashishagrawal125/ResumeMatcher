'use server';

/**
 * @fileOverview A resume parsing AI agent.
 *
 * - parseUploadedResume - A function that handles the resume parsing process.
 */

import {ai} from '@/ai/genkit';
import { ParseUploadedResumeInputSchema, ParseUploadedResumeOutputSchema, type ParseUploadedResumeInput, type ParseUploadedResumeOutput } from './parse-uploaded-resume-types';


export async function parseUploadedResume(input: ParseUploadedResumeInput): Promise<ParseUploadedResumeOutput> {
  return parseUploadedResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseUploadedResumePrompt',
  input: {schema: ParseUploadedResumeInputSchema},
  output: {schema: ParseUploadedResumeOutputSchema},
  prompt: `You are an expert resume parser. You will extract information from the resume and return it in JSON format.

  Resume text: {{{resumeText}}}`,
});

const parseUploadedResumeFlow = ai.defineFlow(
  {
    name: 'parseUploadedResumeFlow',
    inputSchema: ParseUploadedResumeInputSchema,
    outputSchema: ParseUploadedResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
