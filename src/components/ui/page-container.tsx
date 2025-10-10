export const PageContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="w-full space-y-6 p-6">{children}</div>;
};

export const PageHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex w-full items-center justify-between">{children}</div>
  );
};

export const PageHeaderContent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div className="w-full space-y-1">{children}</div>;
};

export const PageTitle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <h1 className={`text-2xl font-bold${className ? ` ${className}` : ""}`}>
      {children}
    </h1>
  );
};

export const PageDescription = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <p
      className={`text-muted-foreground text-sm${className ? ` ${className}` : ""}`}
    >
      {children}
    </p>
  );
};

export const PageActions = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`flex items-center gap-2${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
};

export const PageContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="space-y-6">{children}</div>;
};
