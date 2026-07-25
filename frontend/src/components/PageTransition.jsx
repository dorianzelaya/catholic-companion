import { motion } from 'framer-motion'

const variants = {
  initial: { opacity: 0, x: 15 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -15 }
}

const transition = {
  duration: 0.12,
  ease: 'easeInOut'
}

function PageTransition({ children }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
      style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      {children}
    </motion.div>
  )
}

export default PageTransition