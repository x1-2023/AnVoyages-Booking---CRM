import { ReactNode } from 'react';

interface AdminPageProps {
  children: ReactNode;
}

export default function AdminPage({ children }: AdminPageProps) {
  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-5 px-3 pb-28 pt-4 sm:px-4 md:space-y-6 md:px-6 md:pb-8 md:pt-6">
      {children}
    </div>
  );
}
