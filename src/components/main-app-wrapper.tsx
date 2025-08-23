interface MainAppWrapperProps {
  children: React.ReactNode;
}

export function MainAppWrapper({ children }: MainAppWrapperProps) {
  return <>{children}</>;
}