import { motion } from "framer-motion";
import { cardVariants } from "../motion/transitions";

function SectionCard({ title, children }) {
  return (
    <motion.section
      variants={cardVariants}
      className="interactive-card group rounded-[1.75rem] border border-gray-700 bg-gray-800 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.3)] hover:border-brand-500/45"
    >
      <h2 className="mb-3 text-base font-semibold text-white md:text-lg">{title}</h2>
      <div className="text-sm leading-7 text-gray-200">{children}</div>
    </motion.section>
  );
}

export default SectionCard;
