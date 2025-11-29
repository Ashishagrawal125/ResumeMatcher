'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, FileUp, ClipboardPaste } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleMatchResume } from '@/app/actions';
import type { MatchResumeToJobDescriptionOutput } from '@/ai/flows/match-resume-to-job-description-types';
import { Progress } from './ui/progress';

const formSchema = z.object({
  resumeText: z.string().min(50, 'Resume text is too short.'),
  jobDescriptionText: z.string().min(50, 'Job description is too short.'),
});

export default function MatchTool() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<MatchResumeToJobDescriptionOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resumeText: '',
      jobDescriptionText: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'resumeText') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        form.setValue(field, text);
        form.clearErrors(field);
      };
      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: "Error reading file",
          description: "Could not read the uploaded file. Please try again.",
        })
      };
      reader.readAsText(file);
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setResult(null);
    startTransition(async () => {
      const response = await handleMatchResume(values);
      if (response.error) {
        toast({
          variant: "destructive",
          title: "Matching Failed",
          description: response.error,
        });
      } else if (response.data) {
        setResult(response.data);
      }
    });
  };

  return (
    <>
      <Card className="w-full">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="resumeText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold flex items-center gap-2">
                        <ClipboardPaste className="w-5 h-5" /> Your Resume
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste your resume here..."
                          className="min-h-[300px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <div className="relative pt-2">
                         <Button asChild variant="outline" size="sm" className="absolute right-0 bottom-0">
                           <label htmlFor="resume-file" className="cursor-pointer flex items-center gap-2">
                            <FileUp className="w-4 h-4"/> Upload File
                           </label>
                         </Button>
                         <Input id="resume-file" type="file" className="sr-only" onChange={(e) => handleFileChange(e, 'resumeText')} accept=".txt,.md" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jobDescriptionText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold flex items-center gap-2">
                        <ClipboardPaste className="w-5 h-5" /> Job Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste the job description here..."
                          className="min-h-[300px] resize-y"
                          {...field}
                        />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-center">
                <Button type="submit" size="lg" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Matching...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Match Now
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isPending && (
         <Card className="w-full mt-8">
            <CardHeader>
                <CardTitle>Analyzing...</CardTitle>
                <CardDescription>Our AI is comparing your resume to the job description. This may take a moment.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="flex items-center justify-center p-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                 </div>
            </CardContent>
         </Card>
      )}

      {result && (
        <Card className="w-full mt-8 animate-in fade-in-50 duration-500">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Match Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-lg">Relevancy Score</h3>
                    <span className="font-bold text-3xl text-primary font-headline">{result.relevancyScore}%</span>
                </div>
                <Progress value={result.relevancyScore} className="w-full h-4" />
            </div>
            <div className="space-y-2">
                <h3 className="font-semibold text-lg">AI Summary & Feedback</h3>
                <div className="prose prose-sm max-w-none text-foreground/90 bg-secondary/50 rounded-lg p-4 border">
                    <p>{result.summary}</p>
                </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
