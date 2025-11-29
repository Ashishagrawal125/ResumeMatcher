'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Loader2, Sparkles, FileUp, ClipboardPaste } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  parseUploadedResume,
} from '@/ai/flows/parse-uploaded-resume';
import type { ParseUploadedResumeOutput } from '@/ai/flows/parse-uploaded-resume-types';
import { z } from 'zod';

async function handleParseResume(dataUri: string): Promise<{ data?: ParseUploadedResumeOutput, error?: string }> {
  try {
    const result = await parseUploadedResume({ resumeDataUri: dataUri });
    return { data: result };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'An unexpected error occurred.' };
  }
}

export default function ResumeParsingPage() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ParseUploadedResumeOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<{ resumeFile: FileList }>({
    resolver: zodResolver(z.object({
      resumeFile: z.instanceof(FileList).refine(files => files.length > 0, 'A resume file is required.'),
    })),
  });

  const onSubmit = (values: { resumeFile: FileList }) => {
    const file = values.resumeFile[0];
    if (file) {
      setResult(null);
      const reader = new FileReader();
      reader.onload = event => {
        const dataUri = event.target?.result as string;
        startTransition(async () => {
          const response = await handleParseResume(dataUri);
          if (response.error) {
            toast({
              variant: 'destructive',
              title: 'Parsing Failed',
              description: response.error,
            });
          } else if (response.data) {
            setResult(response.data);
          }
        });
      };
      reader.onerror = () => {
        toast({
          variant: 'destructive',
          title: 'Error reading file',
          description: 'Could not read the uploaded file. Please try again.',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
          AI Resume Parser
        </h1>
        <p className="text-lg md:text-xl text-foreground/80">
          Upload a resume (PDF, DOCX) and our AI will extract the key information into a structured format.
        </p>
      </div>
      <div className="grid lg:grid-cols-2 gap-12">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Resume</CardTitle>
                <CardDescription>Select a file from your device.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="resumeFile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Resume File</FormLabel>
                      <FormControl>
                        <Input 
                            type="file" 
                            accept=".pdf,.doc,.docx" 
                            onChange={(e) => field.onChange(e.target.files)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" disabled={isPending} className="w-full mt-6">
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Parsing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Parse Resume
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </form>
        </Form>
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Parsed Information</CardTitle>
              <CardDescription>
                The structured data from the resume will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPending && (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              )}
              {result && (
                <div className="space-y-4 animate-in fade-in-50 duration-500 max-h-[60vh] overflow-y-auto">
                    <pre className="bg-secondary/50 p-4 rounded-lg text-sm">{JSON.stringify(result, null, 2)}</pre>
                    <Button onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                        toast({ title: 'Copied JSON to clipboard!' });
                    }} className="w-full">
                        <ClipboardPaste className="mr-2" />
                        Copy JSON
                    </Button>
                </div>
              )}
               {!isPending && !result && (
                    <div className="flex items-center justify-center text-center text-sm text-foreground/60 p-12 bg-secondary/50 rounded-lg">
                        <p>Upload a resume to see the parsed output.</p>
                    </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
