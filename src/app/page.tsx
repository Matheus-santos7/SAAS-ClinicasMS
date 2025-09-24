import {
  ArrowRight,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle,
  FileText,
  Shield,
  Stethoscope,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";

export default function Home() {
  return (
    <div className="from-background via-secondary/50 to-background min-h-screen bg-gradient-to-br">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-primary rounded-lg p-2">
              <Stethoscope className="text-primary-foreground h-6 w-6" />
            </div>
            <span className="text-primary text-2xl font-bold">SynClinic</span>
          </div>
          <Link href={ROUTES.LOGIN}>
            <Button variant="outline">Fazer Login</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-foreground mb-6 text-5xl leading-tight font-bold md:text-6xl">
              Eleve o nível da sua gestão. 
            <span className="text-primary block">SynClinic.</span>
          </h1>
          <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-xl leading-relaxed">
              Diga adeus às planilhas e à papelada. Nossa plataforma integra tudo o que você precisa para gerenciar pacientes
               e agendamentos de forma inteligente, segura e 100% online.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href={ROUTES.LOGIN}>
              <Button size="lg" className="px-8 py-4 text-lg">
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
              Ver Demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-16 text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
            Tudo que sua clínica precisa
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Funcionalidades completas para modernizar e otimizar a gestão da sua
            clínica
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="transition-shadow duration-300 hover:shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Calendar className="text-primary h-8 w-8" />
              </div>
              <h3 className="text-card-foreground mb-3 text-xl font-semibold">
                Agendamentos Inteligentes
              </h3>
              <p className="text-muted-foreground">
                Sistema de agendamento com verificação automática de
                disponibilidade e notificações.
              </p>
            </CardContent>
          </Card>

          <Card className="transition-shadow duration-300 hover:shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Users className="text-primary h-8 w-8" />
              </div>
              <h3 className="text-card-foreground mb-3 text-xl font-semibold">
                Gestão de Pacientes
              </h3>
              <p className="text-muted-foreground">
                Cadastro completo, histórico médico e busca avançada para
                encontrar pacientes rapidamente.
              </p>
            </CardContent>
          </Card>

          <Card className="transition-shadow duration-300 hover:shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <FileText className="text-primary h-8 w-8" />
              </div>
              <h3 className="text-card-foreground mb-3 text-xl font-semibold">
                Prontuário Eletrônico
              </h3>
              <p className="text-muted-foreground">
                Anamnese digital, evolução do tratamento e documentos
                organizados em um só lugar.
              </p>
            </CardContent>
          </Card>

          <Card className="transition-shadow duration-300 hover:shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <BarChart3 className="text-primary h-8 w-8" />
              </div>
              <h3 className="text-card-foreground mb-3 text-xl font-semibold">
                Dashboard Analytics
              </h3>
              <p className="text-muted-foreground">
                Relatórios financeiros, métricas de atendimento e insights para
                sua clínica crescer.
              </p>
            </CardContent>
          </Card>

          <Card className="transition-shadow duration-300 hover:shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Shield className="text-primary h-8 w-8" />
              </div>
              <h3 className="text-card-foreground mb-3 text-xl font-semibold">
                Segurança Total
              </h3>
              <p className="text-muted-foreground">
                Dados protegidos com criptografia, backup automático e
                conformidade com a LGPD.
              </p>
            </CardContent>
          </Card>

          <Card className="transition-shadow duration-300 hover:shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Building2 className="text-primary h-8 w-8" />
              </div>
              <h3 className="text-card-foreground mb-3 text-xl font-semibold">
                Multi-clínica
              </h3>
              <p className="text-muted-foreground">
                Gerencie múltiplas clínicas com dados isolados e configurações
                personalizadas.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      {/* Seção de Benefícios */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-muted/30 rounded-2xl px-8 py-16 md:px-16">
            <div className="grid gap-12 md:grid-cols-2 md:items-center">
              <div>
                <h2 className="text-foreground mb-6 text-3xl font-bold md:text-4xl">
                  Por que escolher o SynClinic?
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Redução de 80% nas faltas e cancelamentos de última hora
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Aumento de 40% na produtividade da equipe médica
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Economia de 4 horas semanais em tarefas administrativas
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Melhoria de 95% na satisfação dos pacientes
                    </span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="bg-muted/50 aspect-video rounded-lg p-8">
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="text-primary mx-auto mb-4 h-16 w-16" />
                      <h3 className="text-foreground text-xl font-semibold">
                        Resultados Comprovados
                      </h3>
                      <p className="text-muted-foreground mt-2">
                        Mais de 1000 clínicas confiam em nossa solução
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="bg-primary py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-primary-foreground mb-6 text-3xl font-bold md:text-4xl">
            Pronto para modernizar sua clínica?
          </h2>
          <p className="text-primary-foreground/90 mx-auto mb-8 max-w-2xl text-xl">
            Junte-se a centenas de profissionais que já transformaram sua gestão
            com o SynClinic
          </p>
          <Link href={ROUTES.LOGIN}>
            <Button
              size="lg"
              variant="secondary"
              className="bg-background text-foreground hover:bg-secondary px-8 py-4 text-lg"
            >
              Começar Agora - É Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card text-card-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center space-x-2">
                <div className="bg-primary rounded-lg p-2">
                  <Stethoscope className="text-primary-foreground h-5 w-5" />
                </div>
                <span className="text-xl font-bold">SynClinic</span>
              </div>
              <p className="text-muted-foreground">
                Sistema completo de gestão para clínicas médicas e
                odontológicas.
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Funcionalidades</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>Agendamentos</li>
                <li>Gestão de Pacientes</li>
                <li>Prontuário Eletrônico</li>
                <li>Relatórios</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Suporte</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>Central de Ajuda</li>
                <li>Documentação</li>
                <li>Contato</li>
                <li>Treinamentos</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Empresa</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>Sobre Nós</li>
                <li>Política de Privacidade</li>
                <li>Termos de Uso</li>
                <li>LGPD</li>
              </ul>
            </div>
          </div>
          <div className="border-border text-muted-foreground mt-8 border-t pt-8 text-center">
            <p>&copy; 2025 SynClinic. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
