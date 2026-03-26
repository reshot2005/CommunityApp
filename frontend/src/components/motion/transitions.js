export const pageTransition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1]
};

export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      ...pageTransition,
      when: "beforeChildren",
      staggerChildren: 0.08
    }
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

export const sectionVariants = {
  initial: { opacity: 0, y: 18 },
  animate: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      ...pageTransition,
      delay
    }
  })
};

export const cardVariants = {
  initial: { opacity: 0, y: 24 },
  animate: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      ...pageTransition,
      delay: 0.06 * index
    }
  })
};
