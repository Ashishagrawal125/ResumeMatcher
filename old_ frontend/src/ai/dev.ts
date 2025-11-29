import { config } from 'dotenv';
config();

import '@/ai/flows/match-resume-to-job-description.ts';
import '@/ai/flows/parse-uploaded-resume.ts';
import '@/ai/flows/generate-feedback-email';
import '@/ai/flows/bulk-generate-feedback';
