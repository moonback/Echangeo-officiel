import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface StepperProps {
  currentStep: number;
  totalSteps: number;
  steps: Array<{ id: number; label: string }>;
}

const Stepper: React.FC<StepperProps> = ({ currentStep, totalSteps, steps }) => {
  return (
    <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex-1 flex items-center">
            <motion.div
              className={`relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                currentStep > step.id 
                  ? 'bg-green-500 text-white' 
                  : currentStep === step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {currentStep > step.id ? (
                <Check className="w-4 h-4" />
              ) : (
                step.id
              )}
            </motion.div>
            
            <div className="ml-3 text-sm font-medium text-gray-900 hidden sm:block">
              {step.label}
            </div>
            
            {idx < steps.length - 1 && (
              <motion.div
                className={`flex-1 h-1 mx-3 rounded transition-all duration-500 ${
                  currentStep > step.id ? 'bg-green-200' : 'bg-gray-200'
                }`}
                initial={{ scaleX: 0 }}
                animate={{ 
                  scaleX: currentStep > step.id ? 1 : 0,
                  originX: 0
                }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Barre de progression globale */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ 
              width: `${(currentStep / totalSteps) * 100}%`
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1 text-center">
          Étape {currentStep} sur {totalSteps}
        </div>
      </div>
    </div>
  );
};

export default Stepper;
