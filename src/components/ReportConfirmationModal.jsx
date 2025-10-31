import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { 
  AlertTriangle, 
  X, 
  Flag, 
  CheckCircle, 
  Loader2,
  AlertCircle,
  Shield
} from 'lucide-react'

export default function ReportConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  postId, 
  postAuthor,
  isLoading = false,
  reportReasons = [],
  selectedReason = 'spam',
  onReasonChange,
  reportDetails = '',
  onDetailsChange
}) {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [finalReason, setFinalReason] = useState(selectedReason)
  const [finalDetails, setFinalDetails] = useState(reportDetails)

  useEffect(() => {
    if (isOpen) {
      setShowConfirmation(false)
      setFinalReason(selectedReason)
      setFinalDetails(reportDetails)
    }
  }, [isOpen, selectedReason, reportDetails])

  const handleConfirm = () => {
    setShowConfirmation(true)
  }

  const handleFinalSubmit = () => {
    onConfirm({
      postId,
      reason: finalReason,
      details: finalDetails
    })
  }

  const handleCancel = () => {
    setShowConfirmation(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md"
        >
          <Card className="glass-card dark:glass-card border-0 shadow-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                    <Flag className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                      {!showConfirmation ? 'Report Post' : 'Confirm Report'}
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      {!showConfirmation 
                        ? `Report post by ${postAuthor?.name || 'Unknown User'}`
                        : 'Are you sure you want to submit this report?'
                      }
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {!showConfirmation ? (
                <>
                  {/* Report Reason Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Reason for reporting
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {reportReasons.map((reason) => (
                        <Button
                          key={reason}
                          variant={finalReason === reason ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setFinalReason(reason)
                            onReasonChange?.(reason)
                          }}
                          className={`text-xs ${
                            finalReason === reason 
                              ? 'bg-red-600 hover:bg-red-700 text-white' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          {reason}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Additional details (optional)
                    </label>
                    <Input
                      placeholder="Provide more context about why you're reporting this post..."
                      value={finalDetails}
                      onChange={(e) => {
                        setFinalDetails(e.target.value)
                        onDetailsChange?.(e.target.value)
                      }}
                      className="min-h-[80px] resize-none"
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {finalDetails.length}/500 characters
                    </p>
                  </div>

                  {/* Warning Message */}
                  <div className="flex items-start space-x-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                      <p className="font-medium">Please use this feature responsibly</p>
                      <p className="text-xs mt-1">
                        False reports may result in account restrictions. Only report content that violates our community guidelines.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Confirmation Content */}
                  <div className="text-center space-y-4">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                      <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        Confirm Report Submission
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-slate-400">
                        You are about to report this post for: <strong>{finalReason}</strong>
                      </p>
                    </div>

                    {finalDetails && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Your message:</p>
                        <p className="text-sm text-gray-700 dark:text-slate-300 italic">
                          "{finalDetails}"
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-slate-400">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>This report will be reviewed by our moderation team</span>
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                
                {!showConfirmation ? (
                  <Button
                    onClick={handleConfirm}
                    disabled={!finalReason || isLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    onClick={handleFinalSubmit}
                    disabled={isLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Submitting Report...
                      </>
                    ) : (
                      <>
                        <Flag className="w-4 h-4 mr-2" />
                        Submit Report
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
