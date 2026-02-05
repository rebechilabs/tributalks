import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { NewsletterForm } from "@/components/common/NewsletterForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Calendar, Users, CheckCircle2 } from "lucide-react";

const benefits = [
  {
    icon: Calendar,
    title: "Toda terça às 07h07",
    description: "Receba pontualmente as principais atualizações tributárias da semana."
  },
  {
    icon: Users,
    title: "+4 mil assinantes",
    description: "Junte-se à comunidade de empresários que se mantêm informados."
  },
  {
    icon: CheckCircle2,
    title: "Conteúdo curado",
    description: "Apenas o que realmente importa para o seu negócio, sem spam."
  }
];

export default function NewsletterPage() {
  return (
    <DashboardLayout title="TribuTalks News">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3">📬 TribuTalks News</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A newsletter semanal que mantém você atualizado sobre a Reforma Tributária 
            e suas implicações para o seu negócio.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="text-center">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-base">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{benefit.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Subscription Form */}
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Inscreva-se gratuitamente</CardTitle>
            <CardDescription>
              Receba nossa newsletter toda terça-feira às 07h07
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewsletterForm />
          </CardContent>
        </Card>

        {/* What to expect */}
        <div className="mt-12 text-center">
          <h2 className="text-xl font-semibold mb-4">O que você vai receber</h2>
          <ul className="text-muted-foreground space-y-2 max-w-md mx-auto text-left">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span>Resumo semanal das mudanças na Reforma Tributária</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span>Prazos importantes que afetam sua empresa</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span>Dicas práticas de planejamento tributário</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span>Análises exclusivas dos nossos especialistas</span>
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
