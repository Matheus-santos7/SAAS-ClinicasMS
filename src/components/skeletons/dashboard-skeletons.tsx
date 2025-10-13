import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// =================================
// DASHBOARD SKELETONS
// =================================

/**
 * Skeleton para os cards de estatísticas (Stats Cards)
 */
export const StatsCardsSkeleton = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-1 h-7 w-16" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

/**
 * Skeleton para o gráfico de agendamentos
 */
export const AppointmentsChartSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Área do gráfico */}
          <div className="relative h-[300px] w-full">
            <div className="absolute inset-0 flex items-end justify-between px-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="w-8"
                  style={{
                    height: `${Math.random() * 200 + 50}px`,
                  }}
                />
              ))}
            </div>
          </div>
          {/* Legenda */}
          <div className="flex justify-center gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Skeleton para o top de médicos
 */
export const TopDoctorsSkeleton = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-6 w-8" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Skeleton para o top de especialidades
 */
export const TopSpecialtiesSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Skeleton para a tabela de agendamentos de hoje
 */
export const TodayAppointmentsSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Cabeçalho da tabela */}
          <div className="grid grid-cols-4 gap-4 border-b pb-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12" />
          </div>
          {/* Linhas da tabela */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4 py-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
          {/* Skeleton para paginação */}
          <div className="flex items-center justify-between border-t pt-4">
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Skeleton para date picker
 */
export const DatePickerSkeleton = () => {
  return <Skeleton className="h-10 w-48" />;
};

// =================================
// SKELETONS COMPOSTOS
// =================================

/**
 * Skeleton completo do dashboard - combina todos os elementos
 */
export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <DatePickerSkeleton />
      </div>

      {/* Stats Cards */}
      <StatsCardsSkeleton />

      {/* Agendamentos de hoje */}
      <TodayAppointmentsSkeleton />

      {/* Grid desktop - Gráfico + Top Doctors */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2.25fr_1fr]">
          <AppointmentsChartSkeleton />
          <TopDoctorsSkeleton />
        </div>

        {/* Top Especialidades */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[2.25fr_1fr]">
          <div></div> {/* Espaço vazio para manter o layout */}
          <TopSpecialtiesSkeleton />
        </div>
      </div>
    </div>
  );
};

// =================================
// SKELETONS GENÉRICOS REUTILIZÁVEIS
// =================================

/**
 * Skeleton genérico para cards com lista
 */
export const ListCardSkeleton = ({
  title = true,
  items = 3,
  showProgress = false,
}: {
  title?: boolean;
  items?: number;
  showProgress?: boolean;
}) => {
  return (
    <Card>
      {title && (
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: items }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-8" />
              </div>
              {showProgress && <Skeleton className="h-2 w-full rounded-full" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Skeleton genérico para tabelas
 */
export const TableSkeleton = ({
  columns = 4,
  rows = 5,
  showPagination = false,
}: {
  columns?: number;
  rows?: number;
  showPagination?: boolean;
}) => {
  return (
    <div className="space-y-3">
      {/* Cabeçalho */}
      <div
        className="grid gap-4 border-b pb-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-16" />
        ))}
      </div>

      {/* Linhas */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4 py-2"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 w-20" />
          ))}
        </div>
      ))}

      {/* Paginação */}
      {showPagination && (
        <div className="flex items-center justify-between border-t pt-4">
          <Skeleton className="h-4 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      )}
    </div>
  );
};
