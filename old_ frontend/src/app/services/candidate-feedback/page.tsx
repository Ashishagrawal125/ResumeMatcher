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
import { Loader2, Sparkles, Mail, ClipboardPaste, FileUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  GenerateFeedbackEmailInputSchema,
} from '@/ai/flows/generate-feedback-email-types';
import type { GenerateFeedbackEmailOutput } from '@/ai/flows/generate-feedback-email-types';
import { handleGenerateFeedback } from '@/app/actions';
import { z } from 'zod';

export default function CandidateFeedbackPage() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<GenerateFeedbackEmailOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof GenerateFeedbackEmailInputSchema>>({
    resolver: zodResolver(GenerateFeedbackEmailInputSchema),
    defaultValues: {
      resumeText: '',
      jobDescriptionText: '',
      candidateName: '',
      status: 'SELECTED',
    },
  });

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'resumeText'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        const text = event.target?.result as string;
        form.setValue(field, text);
        form.clearErrors(field);
      };
      reader.onerror = () => {
        toast({
          variant: 'destructive',
          title: 'Error reading file',
          description: 'Could not read the uploaded file. Please try again.',
        });
      };
      reader.readAsText(file);
    }
  };

  const onSubmit = (values: z.infer<typeof GenerateFeedbackEmailInputSchema>) => {
    setResult(null);
    startTransition(async () => {
      const response = await handleGenerateFeedback(values);
      if (response.error) {
        toast({
          variant: 'destructive',
          title: 'Generation Failed',
          description: response.error,
        });
      } else if (response.data) {
        setResult(response.data);
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
          Candidate Feedback Generator
        </h1>
        <p className="text-lg md:text-xl text-foreground/80">
          Generate personalized and constructive feedback emails for candidates instantly.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="candidateName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Candidate Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resumeText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold flex items-center gap-2">
                    <ClipboardPaste className="w-5 h-5" /> Candidate's Resume
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste the candidate's resume here..."
                      className="min-h-[200px] resize-y"
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
                  <FormLabel className="font-semibold flex items-center gap-2">
                    <ClipboardPaste className="w-5 h-5" /> Job Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste the job description here..."
                      className="min-h-[200px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="font-semibold">Candidate Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="SELECTED" />
                        </FormControl>
                        <FormLabel className="font-normal">Selected</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="REJECTED" />
                        </FormControl>
                        <FormLabel className="font-normal">Rejected</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" size="lg" disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Generate Email
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className="space-y-8">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="w-6 h-6 text-primary" /> Generated Email
                    </CardTitle>
                    <CardDescription>
                        The AI-generated email will appear here.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isPending && (
                        <div className="flex items-center justify-center p-12">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        </div>
                    )}
                    {result && (
                        <div className="space-y-4 animate-in fade-in-50 duration-500">
                             <div className="space-y-1">
                                <Label htmlFor='email-subject'>Subject</Label>
                                <div className="relative">
                                    <Input id="email-subject" readOnly value={result.subject} className="pr-10" />
                                    <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => copyToClipboard(result.subject)}>
                                        <ClipboardPaste className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor='email-body'>Body</Label>
                                <div className="relative">
                                    <Textarea id="email-body" readOnly value={result.body} className="min-h-[300px] resize-y" />
                                    <Button variant="ghost" size="icon" className="absolute right-1 top-2 h-8 w-8" onClick={() => copyToClipboard(result.body)}>
                                        <ClipboardPaste className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                    {!isPending && !result && (
                         <div className="flex items-center justify-center text-center text-sm text-foreground/60 p-12 bg-secondary/50 rounded-lg">
                            <p>Fill out the form to generate a feedback email.</p>
                         </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
