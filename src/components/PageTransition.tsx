import { motion, Variants } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  nodeKey?: string; // Optional key to force remounting for certain transitions
}

const PageTransition = ({ children, className = "", nodeKey }: PageTransitionProps) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      },
      transitionEnd: {
        transform: "none",
        opacity: 1,
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 }
    }
  };
  
  return (
    <motion.div
      key={nodeKey}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;