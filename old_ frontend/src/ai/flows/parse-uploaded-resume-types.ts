import {z} from 'genkit';

export const ParseUploadedResumeInputSchema = z.object({
  resumeText: z
    .string()
    .describe(
      "The text content of the resume, extracted from the uploaded file."
    ),
});
export type ParseUploadedResumeInput = z.infer<typeof ParseUploadedResumeInputSchema>;

export const ParseUploadedResumeOutputSchema = z.object({
  personalInformation: z.object({
    name: z.string().describe("The applicant's full name.").optional(),
    email: z.string().email("Invalid email format.").describe("The applicant's email address.").optional(),
    phone: z.string().describe("The applicant's phone number.").optional(),
    linkedin: z.string().describe("The applicant's LinkedIn profile URL.").optional(),
  }).describe("The applicant's personal information.").optional(),
  experience: z.array(
    z.object({
      title: z.string().describe("The job title.").optional(),
      company: z.string().describe("The company name.").optional(),
      dates: z.string().describe("The start and end dates of the job.").optional(),
      description: z.string().describe("A description of the job responsibilities and accomplishments.").optional(),
    })
  ).describe("The applicant's work experience.").optional(),
  education: z.array(
    z.object({
      degree: z.string().describe("The degree name.").optional(),
      university: z.string().describe("The university name.").optional(),
      dates: z.string().describe("The start and end dates of the education.").optional(),
      description: z.string().describe("A description of the education.").optional(),
    })
  ).describe("The applicant's education.").optional(),
  skills: z.array(z.string().describe("A skill.")).describe("The applicant's skills.").optional(),
});
export type ParseUploadedResumeOutput = z.infer<typeof ParseUploadedResumeOutputSchema>;
