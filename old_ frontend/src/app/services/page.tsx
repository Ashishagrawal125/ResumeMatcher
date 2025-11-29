import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight, BrainCircuit, ScanText, Mail, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const parsingImage = PlaceHolderImages.find(img => img.id === 'services-parsing');
const matchingImage = PlaceHolderImages.find(img => img.id === 'services-matching');
const feedbackImage = PlaceHolderImages.find(img => img.id === 'services-feedback');
const bulkFeedbackImage = PlaceHolderImages.find(img => img.id === 'services-bulk-feedback');


export default function ServicesPage() {
  const services = [
    {
      title: "AI Resume Parsing",
      description: "Automatically extract key information from any resume format. Our AI identifies contact details, work experience, education, skills, and more, structuring it for easy analysis.",
      icon: <ScanText className="w-8 h-8 text-primary" />,
      image: parsingImage,
      link: "/services/resume-parsing"
    },
    {
      title: "Intelligent Job Matching",
      description: "Go beyond keywords. Our generative AI understands context and skills to provide a nuanced match score between a resume and a job description, complete with a summary of strengths and weaknesses.",
      icon: <BrainCircuit className="w-8 h-8 text-primary" />,
      image: matchingImage,
      link: "/" // Link to home page where the tool is
    },
    {
      title: "Candidate Feedback",
      description: "Generate personalized and constructive feedback emails for candidates, whether they are selected or rejected, based on their resume and the job description.",
      icon: <Mail className="w-8 h-8 text-primary" />,
      image: feedbackImage,
      link: "/services/candidate-feedback"
    },
    {
      title: "Bulk Candidate Feedback",
      description: "Automate your workflow. Upload multiple resumes to generate tailored feedback emails for every single applicant based on a defined relevancy score.",
      icon: <Users className="w-8 h-8 text-primary" />,
      image: bulkFeedbackImage,
      link: "/services/bulk-feedback"
    }
  ]

  return (
    <div className="bg-background">
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">Our Services</h1>
          <p className="text-lg md:text-xl text-foreground/80">
            Leveraging cutting-edge AI to streamline your hiring process and help candidates find the perfect fit.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 mt-16 max-w-7xl mx-auto">
          {services.map((service) => (
            <Card key={service.title} className="flex flex-col overflow-hidden group hover:shadow-xl transition-shadow duration-300">
              {service.image && (
                 <Image
                    src={service.image.imageUrl}
                    alt={service.image.description}
                    width={600}
                    height={400}
                    className="w-full h-48 object-cover"
                    data-ai-hint={service.image.imageHint}
                />
              )}
              <CardHeader className="flex-row items-center gap-4">
                {service.icon}
                <CardTitle className="font-headline text-2xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>{service.description}</CardDescription>
              </CardContent>
              <div className="p-6 pt-0">
                <Link href={service.link} className="font-semibold text-primary flex items-center gap-2 group-hover:underline">
                  Learn More <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
