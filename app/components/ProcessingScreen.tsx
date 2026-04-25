import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { CheckCircle, Loader2 } from 'lucide-react'
import { supabase } from '../../src/lib/supabase'

const steps = [
  'Uploading file',
  'Reading receipt with AI',
  'Extracting important data',
  'Categorizing expense',
  'Preparing result',
]

export default function ProcessingScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentStep, setCurrentStep] = useState(0)

  // receiptId môže prísť cez navigate state
  const receiptId = location.state?.receiptId as string | undefined

  useEffect(() => {
    if (!receiptId) {
      // Ak nemáme receiptId, spusti len animáciu
      const interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < steps.length - 1) return prev + 1
          clearInterval(interval)
          setTimeout(() => navigate('/dashboard/receipts'), 1000)
          return prev
        })
      }, 1200)
      return () => clearInterval(interval)
    }

    // Ak máme receiptId, polluj Supabase kým status != done/error
    let stepIndex = 0
    const stepInterval = setInterval(() => {
      if (stepIndex < steps.length - 1) {
        stepIndex++
        setCurrentStep(stepIndex)
      }
    }, 1200)

    const pollInterval = setInterval(async () => {
      const { data } = await supabase
        .from('receipts')
        .select('status')
        .eq('id', receiptId)
        .single()

      if (data?.status === 'done' || data?.status === 'error') {
        clearInterval(pollInterval)
        clearInterval(stepInterval)
        setCurrentStep(steps.length - 1)
        setTimeout(() => navigate(`/dashboard/receipts/${receiptId}`), 1000)
      }
    }, 2000)

    return () => {
      clearInterval(stepInterval)
      clearInterval(pollInterval)
    }
  }, [navigate, receiptId])

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Scanning your receipt...</h1>
          <p className="text-gray-500">This may take a few seconds.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  index < currentStep ? 'bg-green-500' :
                  index === currentStep ? 'bg-blue-500' : 'bg-gray-200'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : index === currentStep ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  )}
                </div>
                <span className={index <= currentStep ? 'text-gray-800 font-medium' : 'text-gray-400'}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}