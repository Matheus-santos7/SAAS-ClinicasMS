import Image from "next/image";

/**
 * Componente de loading sutil para exibir enquanto os dados da página são carregados.
 * Mostra o logo da clínica com uma animação de pulsação suave.
 */
export default function Loading() {
  return (
    <div className="flex h-full min-h-[calc(100vh-100px)] w-full flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center">
        <Image
          src="/logo.png"
          alt="Carregando..."
          width={200}
          height={120}
          priority
          className="animate-heartbeat" // Usando a nova animação
        />
      </div>
    </div>
  );
}