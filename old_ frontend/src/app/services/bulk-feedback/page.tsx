'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Sparkles,
  FileUp,
  ClipboardPaste,
  FileCheck2,
  FileX2,
  AlertTriangle,
  Mail,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import {
  handleBulkGenerateFeedback,
} from '@/app/actions';
import type { BulkGenerateFeedbackOutput } from '@/ai/flows/bulk-generate-feedback-types';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FormSchema = z.object({
  jobDescriptionText: z.string().min(50, 'Job description is too short.'),
  resumeFiles: z
    .instanceof(FileList)
    .refine(files => files.length > 0, 'At least one resume file is required.'),
  relevancyThreshold: z.number().min(0).max(100),
});

type FormValues = z.infer<typeof FormSchema>;

export default function BulkFeedbackPage() {
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<BulkGenerateFeedbackOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      jobDescriptionText: '',
      relevancyThreshold: 75,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResults(null);
    
    const resumePromises = Array.from(values.resumeFiles).map(file => {
      return new Promise<{ filename: string; resumeDataUri: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
          if (e.target?.result) {
            resolve({ filename: file.name, resumeDataUri: e.target.result as string });
          } else {
            reject(new Error(`Failed to read file: ${file.name}`));
          }
        };
        reader.onerror = () => reject(new Error(`Error reading file: ${file.name}`));
        reader.readAsDataURL(file);
      });
    });

    startTransition(async () => {
        try {
            const resumes = await Promise.all(resumePromises);
            const response = await handleBulkGenerateFeedback({
              jobDescriptionText: values.jobDescriptionText,
              relevancyThreshold: values.relevancyThreshold,
              resumes,
            });

            if (response.error) {
                toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: response.error,
                });
            } else if (response.data) {
                setResults(response.data);
            }
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'File Reading Error',
                description: error.message || 'Could not process uploaded files.',
            });
        }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        toast({
            title: "Copied to clipboard!",
        })
    });
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
          Bulk Candidate Feedback
        </h1>
        <p className="text-lg md:text-xl text-foreground/80">
          Upload multiple resumes, set a relevancy threshold, and automatically generate personalized feedback for every applicant.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <Card>
            <CardHeader>
                <CardTitle>Processing Details</CardTitle>
                <CardDescription>Provide job details and resumes to begin.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="jobDescriptionText"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="font-semibold flex items-center gap-2">
                                    <ClipboardPaste className="w-5 h-5" /> Job Description
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                    placeholder="Paste the job description here..."
                                    className="min-h-[150px] resize-y"
                                    {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="resumeFiles"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold flex items-center gap-2"><FileUp className="w-5 h-5" /> Candidate Resumes</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="file"
                                            multiple
                                            accept=".txt,.md"
                                            onChange={(e) => field.onChange(e.target.files)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="relevancyThreshold"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="font-semibold">Selection Threshold: <span className="text-primary font-bold">{field.value}%</span></FormLabel>
                                <FormControl>
                                    <Slider
                                        min={0}
                                        max={100}
                                        step={5}
                                        value={[field.value]}
                                        onValueChange={(vals) => field.onChange(vals[0])}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" size="lg" disabled={isPending} className="w-full">
                        {isPending ? (
                            <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing Resumes...
                            </>
                        ) : (
                            <>
                            <Sparkles className="mr-2 h-4 w-4" /> Generate All Feedback
                            </>
                        )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>

        <div className="space-y-8">
            <Card className="h-full min-h-[400px]">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="w-6 h-6 text-primary" /> Generated Feedback
                    </CardTitle>
                    <CardDescription>
                        Results for each candidate will appear here after processing.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isPending && (
                        <div className="flex items-center justify-center p-12">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        </div>
                    )}
                    {results && (
                        <Accordion type="single" collapsible className="w-full animate-in fade-in-50 duration-500">
                           {results.map((result, index) => (
                             <AccordionItem value={`item-${index}`} key={index}>
                               <AccordionTrigger>
                                 <div className="flex items-center gap-3 w-full">
                                    {result.status === 'SELECTED' && <FileCheck2 className="w-5 h-5 text-green-600" />}
                                    {result.status === 'REJECTED' && <FileX2 className="w-5 h-5 text-red-600" />}
                                    {result.status === 'ERROR' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                                    <span className="truncate flex-1 text-left">{result.filename}</span>
                                    {result.matchResult && (
                                        <Badge variant={result.status === 'SELECTED' ? 'default' : 'destructive'} className="ml-auto mr-4">{result.matchResult.relevancyScore}%</Badge>
                                    )}
                                     {result.status === 'ERROR' && (
                                        <Badge variant="destructive" className="ml-auto mr-4">Error</Badge>
                                    )}
                                 </div>
                               </AccordionTrigger>
                               <AccordionContent className="p-4 bg-secondary/30 rounded-b-md">
                                 {result.status === 'ERROR' ? (
                                    <p className="text-red-600 font-medium">{result.error}</p>
                                 ) : result.feedbackEmail ? (
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <Label htmlFor={`email-subject-${index}`}>Subject</Label>
                                            <div className="relative">
                                                <Input id={`email-subject-${index}`} readOnly value={result.feedbackEmail.subject} className="pr-10 bg-background" />
                                                <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => copyToClipboard(result.feedbackEmail!.subject)}>
                                                    <ClipboardPaste className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor={`email-body-${index}`}>Body</Label>
                                            <div className="relative">
                                                <Textarea id={`email-body-${index}`} readOnly value={result.feedbackEmail.body} className="min-h-[200px] resize-y bg-background" />
                                                <Button variant="ghost" size="icon" className="absolute right-1 top-2 h-8 w-8" onClick={() => copyToClipboard(result.feedbackEmail!.body)}>
                                                    <ClipboardPaste className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                 ) : null}
                               </AccordionContent>
                             </AccordionItem>
                           ))}
                        </Accordion>
                    )}
                    {!isPending && !results && (
                         <div className="flex items-center justify-center text-center text-sm text-foreground/60 p-12 bg-secondary/50 rounded-lg">
                            <p>Fill out the form and upload resumes to begin.</p>
                         </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
