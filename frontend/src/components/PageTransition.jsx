import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

const variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

const transition = {
  duration: 0.08,
  ease: 'easeOut'
}

function PageTransition({ children }) {
  const ref = useRef(null)

  // The page header is overlaid on top of the scrolling content so that
  // content passes underneath its frosted glass. Header heights differ per
  // page (back button, eyebrow, title, subtitle), so measure rather than
  // hardcode, and publish the value as --header-h for the CSS to pad with.
  useEffect(() => {
    const root = ref.current
    if (!root) return

    const header = root.querySelector('.page-header, .home-header')
    const page = root.querySelector('.page')
    if (!header || !page) return

    const apply = () => {
      page.style.setProperty('--header-h', `${header.offsetHeight}px`)
    }

    apply()

    const observer = new ResizeObserver(apply)
    observer.observe(header)
    return () => observer.disconnect()
  })

  return (
    <motion.div
      ref={ref}
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
