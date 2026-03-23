# 🏥 SynClinic

## 📋 **Visão Geral do Projeto**

O **SynClinic** é um **sistema de gestão médica/odontológica** completo, desenvolvido em **Next.js 15** com **TypeScript**. É uma aplicação web para clínicas gerenciarem pacientes, Dentistas, agendamentos e prontuários Dentistas.

## 🏗️ **Arquitetura e Stack Tecnológica**

### **Frontend & Framework:**

- **Next.js 15** com App Router
- **TypeScript** para tipagem estática
- **TailwindCSS** para estilização
- **Shadcn/UI** para componentes de interface
- **React Hook Form** + **Zod** para formulários e validação

### **Backend & Banco de Dados:**

- **Drizzle ORM** para manipulação do banco
- **PostgreSQL** como banco de dados
- **Better Auth** para autenticação
- **Next Safe Action** para server actions seguras

### **Outras Ferramentas:**

- **Stripe** para pagamentos/assinaturas
- **Recharts** para gráficos e dashboards
- **React Query** para cache de dados
- **Sonner** para notificações

## 🏢 **Funcionalidades Principais**

### **1. Sistema de Autenticação:**

- Login com email/senha
- Login com Google
- Gestão de sessões seguras
- Sistema de planos (Essential, Premium)

### **2. Gestão de Clínicas:**

- Criação e configuração de clínicas
- Sistema multi-tenant (cada usuário pertence a uma clínica)

### **3. Gestão de Dentistas/Dentistas:**

- Cadastro completo de profissionais
- Especialidades odontológicas
- Definição de horários de trabalho
- Preços de consulta por profissional

### **4. Gestão de Pacientes:**

- Cadastro completo (nome, email, telefone, CPF, sexo)
- Sistema de busca avançada (nome, CPF)
- Paginação inteligente
- Páginas de detalhes individuais

### **5. Sistema de Agendamentos:**

- Criação de consultas
- Verificação de disponibilidade automática
- Gestão de horários por Dentista
- Integração com calendário

### **6. Prontuário Eletrônico:**

- **Fichas de Anamnese** completas com questionários estruturados
- **Quadro de Evolução** para acompanhamento do tratamento
- Sistema de documentos anexos

### **7. Dashboard Analytics:**

- Estatísticas de receita
- Gráficos de agendamentos
- Ranking de Dentistas mais ativos
- Métricas por especialidade

## 📁 **Estrutura do Projeto**

```
src/
├── app/                          # App Router do Next.js
│   ├── (protected)/             # Rotas protegidas
│   │   ├── dashboard/           # Dashboard principal
│   │   ├── doctors/             # Gestão de Dentistas
│   │   ├── patients/            # Gestão de pacientes
│   │   │   └── [patientId]/     # Detalhes do paciente
│   │   ├── appointments/        # Gestão de agendamentos
│   │   └── clinic-form/         # Configuração da clínica
│   └── authentication/          # Páginas de login
├── actions/                     # Server Actions
├── components/ui/               # Componentes reutilizáveis
├── db/                         # Configuração do banco
│   └── schema.ts               # Schema das tabelas
├── lib/                        # Utilitários
└── providers/                  # Context providers
```

## 🗄️ **Modelo de Dados**

### **Principais Entidades:**

- **Users** - Usuários do sistema
- **Clinics** - Clínicas médicas
- **Doctors** - Dentistas/Dentistas
- **Patients** - Pacientes
- **Appointments** - Agendamentos
- **Anamnesis** - Fichas de anamnese
- **Evolution** - Quadro de evolução
- **Documents** - Documentos anexos

### **Relacionamentos:**

- Usuários pertencem a clínicas
- Dentistas e pacientes pertencem a clínicas
- Agendamentos ligam pacientes e Dentistas
- Anamnese e evolução pertencem a pacientes

## 🚀 **Funcionalidades Avançadas**

### **Sistema de Busca:**

- Busca por nome ou CPF
- Filtros avançados
- Debounce para performance

### **Paginação:**

- Sistema server-side
- URL parameters para navegação
- Performance otimizada

### **Formulários Inteligentes:**

- Validação em tempo real
- Máscaras para CPF e telefone
- Campos condicionais

### **Dashboard Analytics:**

- Gráficos de receita e agendamentos
- Estatísticas em tempo real
- Ranking de profissionais

## 🔐 **Segurança**

- Autenticação robusta com Better Auth
- Validação server-side com Zod
- Controle de acesso por clínica
- Actions seguras com Next Safe Action

## 📱 **Interface Moderna**

- Design responsivo
- Dark/Light mode
- Componentes acessíveis (Radix UI)
- UX intuitiva com navegação por tabs

## 🚀 **Como Executar**

```bash
# Instalar dependências
npm install

# Configurar banco de dados
npm run db:migrate

# Executar em desenvolvimento
npm run dev
```

## 📚 **Roteiro de Desenvolvimento**

### Aula 01: Setup do Projeto ✅

- [x] Inicialização do projeto Next.js
- [x] Configuração de ferramentas (ESlint, Prettier, Tailwind)
- [x] Configuração do Drizzle e banco de dados
- [x] Configuração do shadcn/ui

### Aula 02: Autenticação e Configurações ✅

- [x] Tela de login e criação de conta
- [x] Login com e-mail e senha
- [x] Login com o Google
- [x] Fundamentos do Next.js (Rotas, Páginas, Layouts)
- [x] Criação de clínica

### Aula 03: Gerenciamento de Profissionais ✅

- [x] Sidebar e Route Groups
- [x] Página de Dentistas
- [x] Criação de Dentistas & NextSafeAction
- [x] Listagem de Dentistas
- [x] Atualização de Dentistas
- [x] Deleção de Dentistas

### Aula 04: Gerenciamento de Pacientes 🚧

- [x] Criação de pacientes
- [x] Edição de pacientes
- [x] Listagem de pacientes com busca e paginação
- [x] Deleção de pacientes
- [x] Páginas de detalhes do paciente
- [x] Sistema de prontuário com anamnese
- [x] Criação de agendamentos
- [x] Listagem de agendamentos
- [x] Deleção de agendamentos

---

**SynClinic** - Sistema completo e profissional para gestão de clínicas médicas/odontológicas! 🦷✨
