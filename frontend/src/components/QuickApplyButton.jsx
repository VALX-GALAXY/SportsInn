import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { 
  Trophy, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ExternalLink
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '../components/ui/simple-toast'

const QuickApplyButton = ({ tournament, user, onApplicationSuccess }) => {
  const [isApplying, setIsApplying] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState('not_applied')
  const { toast } = useToast()

  const handleQuickApply = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to apply for tournaments",
        variant: "destructive"
      })
      return
    }

    setIsApplying(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setApplicationStatus('applied')
      onApplicationSuccess?.(tournament)
      
      toast({
        title: "Application Submitted!",
        description: `Successfully applied to ${tournament.title}`,
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Application Failed",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsApplying(false)
    }
  }

  const getStatusInfo = () => {
    switch (applicationStatus) {
      case 'applied':
        return {
          icon: CheckCircle,
          text: 'Applied',
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        }
      case 'rejected':
        return {
          icon: XCircle,
          text: 'Rejected',
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        }
      case 'approved':
        return {
          icon: Trophy,
          text: 'Approved',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        }
      default:
        return null
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <div className="relative">
        {/* Main Button */}
        <Button
          onClick={handleQuickApply}
          disabled={isApplying || applicationStatus !== 'not_applied'}
          className={`relative overflow-hidden rounded-full px-6 py-3 shadow-lg transition-all duration-300 hover:scale-105 ${
            applicationStatus === 'not_applied'
              ? 'bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          <AnimatePresence mode="wait">
            {isApplying ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Applying...</span>
              </motion.div>
            ) : statusInfo ? (
              <motion.div
                key="status"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <statusInfo.icon className="w-4 h-4" />
                <span>{statusInfo.text}</span>
              </motion.div>
            ) : (
              <motion.div
                key="apply"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                <span>Quick Apply</span>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>

        {/* Tournament Info Tooltip */}
        {tournament && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-full right-0 mb-4 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                    {tournament.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {tournament.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-auto"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  ₹{tournament.entryFee?.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(tournament.startDate).toLocaleDateString()}
                </div>
              </div>

              {statusInfo && (
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusInfo.bgColor} ${statusInfo.color}`}>
                  <statusInfo.icon className="w-3 h-3" />
                  {statusInfo.text}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default QuickApplyButton
