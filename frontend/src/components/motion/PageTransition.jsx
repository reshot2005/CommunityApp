import { motion } from "framer-motion";
import { pageVariants } from "./transitions";

function PageTransition({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
