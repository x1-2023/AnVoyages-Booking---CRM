import { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface PublicRouteTransitionProps {
  children: ReactNode;
}

export default function PublicRouteTransition({ children }: PublicRouteTransitionProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className="public-page-shell">{children}</div>;
  }

  return (
    <motion.div
      className="public-page-shell"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
