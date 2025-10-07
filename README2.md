# Análise Aprofundada do Código-Fonte (Revisão Detalhada)

A seguir, uma análise revisada, conectando diretamente os pontos de melhoria com os arquivos espe- [X] Implementados índices otimizados: `clinic_id_idx`, `type_idx`, `unique_category_per_clinic`.

- [x] Criadas relações bidirecionais: `clinic ↔ categories ↔ transactions`.
- [x] Função de seed para popular categorias padrão automaticamente.icos do seu projeto.

## 1. Coesão de Componentes e Padrão de UI

Notei uma pequena inconsistência no padrão de desenvolvimento de componentes de formulário, o que pode dificultar a manutenção.

**Ponto de Melhoria**: Padronização de Formulários com react-hook-form e shadcn/ui.

**Observação**: O projeto utiliza de forma excelente o react-hook-form com zod e os componentes de formulário do shadcn/ui em arquivos como `upsert-doctor-form.tsx` e `AnamnesisForm.tsx/_components/anamnese/AnamnesisForm.tsx`. No entanto, o `BudgetModal.tsx` foi implementado com `useState` para cada campo e elementos HTML nativos, fugindo do padrão.

**Sugestão**: Refatorar o `BudgetModal.tsx` para usar `Form`, `FormField`, `FormControl`, `Input` e `Select` de shadcn/ui, gerenciando seu estado com `useForm`. Isso centralizará a lógica de validação com Zod e manterá a consistência visual e de desenvolvimento.

## 2. Lógica de Acesso a Dados e Performance

A forma como os dados são consultados no servidor é boa, mas pode ser otimizada para reduzir a carga no banco e no cliente.

**Ponto de Melhoria**: Otimização de Queries no Dashboard.

**Observação**: O arquivo `get-dashboard.ts` faz um excelente uso de `Promise.all` para executar queries em paralelo. No entanto, a query `dailyAppointmentsData` busca os dados e o tratamento para gerar os 21 dias do gráfico é feito no client-side, dentro de `appointments-chart.tsx`.

**Sugestão**: A query SQL pode ser aprimorada para já retornar os dias sem agendamentos com valor 0 dentro do intervalo desejado, utilizando funções de série de datas do PostgreSQL (`generate_series`). Isso simplificaria a lógica no frontend, que apenas consumiria os dados prontos, e transferiria o processamento para o banco, que é otimizado para isso.

## 3. Segurança e Validação de Acesso (IDOR)

A segurança é um ponto crítico, e a centralização das validações é fundamental para evitar falhas.

**Ponto de Melhoria**: Centralizar a validação de pertencimento à clínica.

**Observação**: A validação de que um recurso pertence à clínica do usuário está sendo feita corretamente, mas de forma repetida em várias Server Actions. Por exemplo, `delete-patient/index.ts`, `upsert-anamnesis/index.ts` e `upsert-evolution/index.ts` contêm lógicas similares que buscam o recurso no banco para depois chamar `validateClinicResourceAccess`.

**Sugestão**: Criar uma _factory function_ ou um _middleware_ no `lib/next-safe-action.ts` que receba o nome da tabela e o ID do recurso. Essa função faria a busca e a validação de forma genérica antes de executar a lógica principal da action. Isso eliminaria a duplicação de código e garantiria que a checagem de segurança nunca seja esquecida.

## 4. Gerenciamento de Estado do Cliente

O uso do Zustand é um ponto forte, mas pode ser ainda melhor aproveitado para simplificar a comunicação entre componentes.

**Ponto de Melhoria**: Unificar o estado dos modais de agendamento.

**Observação**: O arquivo `appointment-store.ts` gerencia tanto a visualização de um agendamento existente (`selectedAppointment`) quanto a criação de um novo (`newAppointmentSlot`).

**Sugestão**: Unificar para usar um único estado de modal (ex: `isModalOpen`) e um único estado para os dados do modal (`modalData`), que poderia conter um agendamento existente ou os dados de um novo slot. Isso simplificaria os componentes que disparam os modais, como `AgendaView.tsx`, que hoje precisa de uma lógica para "clicar e agendar" (`handleSelectSlot`).

## Cronograma Revisado e Detalhado (4 Horas/Dia)

Com base nesta análise mais profunda, segue um cronograma reestruturado e mais realista.

### ✅ Semana 1: Foco em Backend e Segurança (20 horas)

**Dia 1 (4h): Análise e Implementação de Índices no BD**

- [x] Revisar todas as queries em `src/data/*.ts` para identificar colunas usadas em cláusulas `WHERE` e `JOIN`.
- [x] Adicionar índices para `clinicId`, `doctorId` e `patientId` nas tabelas relevantes (`appointments`, `patients`, `doctors`, etc.) no arquivo `src/db/schema.ts`.

**Justificativa**: Queries lentas são o principal gargalo de performance. Indexar chaves estrangeiras é a otimização de maior impacto.

**Dia 2 (4h): Implementação de Soft Deletes**

- [x] Adicionar a coluna `deletedAt: timestamp('deleted_at')` em `patientsTable` e `appointmentsTable` no `schema.ts`.
- [x] Modificar a Server Action `deletePatient` para fazer um update no campo `deletedAt`.
- [x] Ajustar as queries em `src/data/patients.ts` e `src/data/appointments.ts` para sempre filtrar registros onde `deletedAt IS NULL`.

**Justificativa**: Evita a perda de dados históricos, que são cruciais para relatórios e integridade do sistema.

**Dia 3 (4h): Centralização da Validação de Acesso (Middleware)**

- [ ] Criar uma nova _factory function_ em `src/lib/next-safe-action.ts` que receba como parâmetro o ID de um recurso e a tabela.
- [ ] A função deverá buscar o recurso, usar a `validateClinicResourceAccess` de `src/helpers/session.ts` e, se for válido, prosseguir com a action.

**Justificativa**: Princípio DRY (Don't Repeat Yourself). Centraliza uma regra de negócio crítica de segurança, tornando o sistema menos propenso a falhas.

**Dia 5 (4h): Aplicando o Middleware de Segurança**

- [ ] Refatorar pelo menos 3 Server Actions (ex: `deletePatient`, `upsertAnamnesis`, `deleteDoctor`) para utilizar a nova função criada no dia anterior.

**Justificativa**: Conclui a implementação da melhoria de segurança e limpa o código das actions.

### ✅ Semana 2: Foco em Frontend e Performance (20 horas)

**Dia 6 (4h): Skeletons e Loading States no Dashboard**

- [ ] Utilizar o `Skeleton.tsx` para criar estados de carregamento para os `StatsCards` e `TopDoctors` na página de Dashboard.

**Justificativa**: Melhora a percepção de performance (_perceived performance_), mostrando ao usuário que o conteúdo está sendo carregado.

**Dia 7 (4h): Refatoração do Formulário de Anamnese**

- [ ] Em `AnamnesisForm.tsx/_components/anamnese/AnamnesisForm.tsx`, criar um array de configuração para os campos de _textarea_ e _checkbox_.
- [ ] Mapear (`.map()`) esse array para renderizar os campos dinamicamente, em vez de chamar `renderTextarea` e `renderCheckbox` manualmente para cada um.

**Justificativa**: Reduz drasticamente a verbosidade do componente, tornando-o mais fácil de ler e de adicionar novos campos no futuro.

**Dia 8 (4h): Refatoração do BudgetModal (UI)**

- [ ] Substituir os elementos HTML nativos em `BudgetModal.tsx` pelos componentes equivalentes do shadcn/ui (`Dialog`, `Input`, `Select`, `Button`).

**Justificativa**: Consistência visual e de código com o resto da aplicação.

**Dia 9 (4h): Refatoração do BudgetModal (Lógica)**

- [ ] Integrar `react-hook-form` e `zod` no `BudgetModal.tsx` para gerenciar o estado e a validação do formulário.

**Justificativa**: Consistência no padrão de desenvolvimento de formulários, facilitando a manutenção.

**Dia 10 (4h): Status e Cores no Calendário**

- [ ] Adicionar a coluna `status` à tabela `appointmentsTable` no `schema.ts`.
- [ ] No `AgendaView.tsx`, usar a cor do médico (`doctor.color`) para colorir o evento no calendário, e talvez aplicar um padrão (ex: borda tracejada) para agendamentos com status "pendente".

**Justificativa**: Melhora a visualização da agenda, tornando-a mais informativa e fácil de interpretar rapidamente.

### ✅ Melhorias de Relacionamentos e Integridade Implementadas

**Melhoria 1: CHECK Constraint para documentsTable**

- [x] Implementado CHECK constraint na `documentsTable` para garantir que pelo menos um dos campos `anamnesisId` ou `evolutionId` esteja preenchido.
- [x] Evita documentos "órfãos" sem referência a nenhuma tabela.

**Melhoria 2: Adição de treatmentId na appointmentsTable**

- [x] Adicionada coluna `treatmentId` na `appointmentsTable` com referência opcional para `treatmentsTable`.
- [x] Permite vincular agendamentos a tratamentos contínuos originados de orçamentos.
- [x] Criado índice `appointments_treatment_id_idx` para otimizar consultas.
- [x] Implementadas relações bidirecionais entre `appointments` e `treatments`.

**Benefícios alcançados:**

- **Integridade referencial**: Documentos sempre vinculados a anamnese ou evolução
- **Rastreabilidade**: Agendamentos podem ser parte de orçamentos (avaliação) ou tratamentos (execução)
- **Performance**: Novos índices otimizam consultas por relacionamentos
- **Flexibilidade**: Um agendamento pode ter tanto `budgetId` (primeira consulta) quanto `treatmentId` (sessões de tratamento)

**Estrutura final dos relacionamentos:**

```
Orçamento → Tratamento → Agendamentos (sessões)
    ↓           ↓            ↓
Agendamento → Agendamento → Agendamento
(avaliação)   (execução)   (follow-up)
```

### ✅ Refinamentos do Módulo Financeiro Implementados

**Melhoria 3: Campo finalPriceInCents em budgetItemsTable**

- [x] Adicionado campo `finalPriceInCents` materializado na `budgetItemsTable`.
- [x] Elimina necessidade de cálculos repetidos (priceInCents - discountInCents).
- [x] Otimiza queries de agregação para calcular total de orçamentos.
- [x] Melhora performance em relatórios financeiros.

**Melhoria 4: Tabela transactionCategoriesTable e relacionamentos**

- [x] Criada tabela `transactionCategoriesTable` para padronizar categorias.
- [x] Substituído campo `category` por `categoryId` com referência forte.
- [x] Mantido campo `subcategory` para flexibilidade adicional.
- [x] Implementados índices otimizados: `clinic_id_idx`, `type_idx`, `unique_category_per_clinic`.
- [x] Criadas relações bidirecionais: `clinic ↔ categories ↔ transactions`.
- [x] Função de seed para popular categorias padrão automaticamente.

**Benefícios alcançados:**

- **Consistência de dados**: Categorias padronizadas evitam duplicatas e erros de digitação
- **Performance financeira**: Campo materializado acelera cálculos de orçamentos
- **Flexibilidade gerencial**: Clínicas podem gerenciar suas próprias categorias
- **Relatórios otimizados**: Agregações mais rápidas por categoria
- **Escalabilidade**: Sistema preparado para múltiplas clínicas com categorias independentes

**Categorias padrão implementadas no seed:**

_Receitas (3 categorias):_

- Receita de Consultas
- Receita de Tratamentos
- Receita de Procedimentos

_Despesas (6 categorias):_

- Salários e Encargos
- Materiais de Consumo
- Equipamentos e Manutenção
- Aluguel e Utilidades
- Marketing e Publicidade
- Impostos e Taxas

**Processo automatizado:** As categorias são criadas automaticamente no processo de seed para cada clínica, garantindo consistência e eliminando a necessidade de scripts de migração separados.
