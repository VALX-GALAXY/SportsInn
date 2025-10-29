import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star } from 'lucide-react'

const ConfettiAnimation = ({ isActive, onComplete }) => {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (isActive) {
      // Create confetti particles
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -50,
        rotation: Math.random() * 360,
        scale: Math.random() * 0.5 + 0.5,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)],
        shape: Math.random() > 0.5 ? 'trophy' : 'star',
        velocity: {
          x: (Math.random() - 0.5) * 4,
          y: Math.random() * 3 + 2
        }
      }))
      
      setParticles(newParticles)

      // Auto cleanup after animation
      const timer = setTimeout(() => {
        setParticles([])
        onComplete?.()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isActive, onComplete])

  if (!isActive) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ 
              x: particle.x, 
              y: particle.y, 
              opacity: 1,
              scale: particle.scale,
              rotate: particle.rotation
            }}
            animate={{ 
              x: particle.x + particle.velocity.x * 100,
              y: particle.y + particle.velocity.y * 100,
              opacity: 0,
              scale: particle.scale * 0.3,
              rotate: particle.rotation + 360
            }}
            transition={{ 
              duration: 3,
              ease: "easeOut"
            }}
            exit={{ opacity: 0 }}
            className="absolute"
            style={{
              color: particle.color
            }}
          >
            {particle.shape === 'trophy' ? (
              <Trophy className="w-4 h-4" />
            ) : (
              <Star className="w-4 h-4" />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Success Message */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ 
          type: "spring", 
          damping: 15, 
          stiffness: 300,
          delay: 0.5 
        }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              damping: 10, 
              stiffness: 300,
              delay: 0.7 
            }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Application Submitted!
            </h3>
            <p className="text-gray-600">
              Your tournament application has been successfully submitted.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default ConfettiAnimation
