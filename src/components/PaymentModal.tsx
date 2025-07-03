import React, { useState } from 'react';
import { X, Upload, Camera, CheckCircle, Loader, Copy, CreditCard, Smartphone, Zap } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSubmit: (amount: number, screenshot: File) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onPaymentSubmit }) => {
  const [step, setStep] = useState<'instructions' | 'upload' | 'processing' | 'success'>('instructions');
  const [amount, setAmount] = useState<number>(0);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copiedJazzCash, setCopiedJazzCash] = useState(false);

  const jazzCashNumber = '03092198628';

  const copyJazzCashNumber = () => {
    navigator.clipboard.writeText(jazzCashNumber);
    setCopiedJazzCash(true);
    setTimeout(() => setCopiedJazzCash(false), 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setScreenshot(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async () => {
    if (!screenshot || amount <= 0) return;
    
    setLoading(true);
    setStep('processing');
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      onPaymentSubmit(amount, screenshot);
      setStep('success');
      
      // Auto close after success
      setTimeout(() => {
        onClose();
        resetModal();
      }, 3000);
    } catch (error) {
      console.error('Payment submission error:', error);
      setLoading(false);
      setStep('upload');
    }
  };

  const resetModal = () => {
    setStep('instructions');
    setAmount(0);
    setScreenshot(null);
    setPreviewUrl('');
    setLoading(false);
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-orange-500/30 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="text-orange-400" />
            Buy Tokens
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'instructions' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">JazzCash Payment</h3>
                <p className="text-gray-400 text-sm">1 Token = 1 PKR</p>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <h4 className="text-red-400 font-semibold mb-3">Payment Instructions:</h4>
                <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
                  <li>Send money to our JazzCash number</li>
                  <li>Take a screenshot of the payment confirmation</li>
                  <li>Upload the screenshot here</li>
                  <li>Our AI will verify and credit tokens automatically</li>
                </ol>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <label className="block text-gray-300 text-sm mb-2">JazzCash Number:</label>
                <div className="flex items-center justify-between bg-red-500/10 border border-red-500/30 rounded p-3">
                  <span className="text-red-400 font-mono font-bold text-lg">{jazzCashNumber}</span>
                  <button
                    onClick={copyJazzCashNumber}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedJazzCash ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <label className="block text-gray-300 text-sm mb-2">Amount to Send (PKR):</label>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
                  placeholder="Enter amount in PKR"
                />
                <p className="text-gray-400 text-xs mt-2">
                  You will receive {amount} tokens after verification
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 font-semibold text-sm">AI-Powered Verification</span>
                </div>
                <p className="text-gray-400 text-xs">
                  Our advanced AI instantly verifies your payment screenshot and credits tokens automatically
                </p>
              </div>

              <button
                onClick={() => setStep('upload')}
                disabled={amount <= 0}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 disabled:from-gray-600 disabled:to-gray-600 text-black font-bold py-3 px-4 rounded-lg transition-all disabled:cursor-not-allowed"
              >
                Continue to Upload
              </button>
            </div>
          )}

          {step === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Upload Payment Screenshot</h3>
                <p className="text-gray-400 text-sm">Amount: {amount} PKR → {amount} Tokens</p>
              </div>

              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                {previewUrl ? (
                  <div className="space-y-4">
                    <img
                      src={previewUrl}
                      alt="Payment screenshot"
                      className="max-w-full h-48 object-contain mx-auto rounded-lg"
                    />
                    <p className="text-green-400 text-sm">Screenshot uploaded successfully!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-gray-300 mb-2">Upload your payment screenshot</p>
                      <p className="text-gray-500 text-sm">PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="screenshot-upload"
                />
                <label
                  htmlFor="screenshot-upload"
                  className="inline-block mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  {previewUrl ? 'Change Screenshot' : 'Choose File'}
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('instructions')}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!screenshot || amount <= 0}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 disabled:from-gray-600 disabled:to-gray-600 text-black font-bold py-3 px-4 rounded-lg transition-all disabled:cursor-not-allowed"
                >
                  Submit Payment
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center space-y-6 py-8">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                <Loader className="w-8 h-8 text-purple-400 animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Processing Payment</h3>
                <p className="text-gray-400 text-sm mb-4">Our AI is verifying your JazzCash payment screenshot...</p>
                <div className="space-y-2 text-left max-w-xs mx-auto">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-gray-300">Analyzing screenshot...</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-gray-300">Verifying amount...</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-gray-300">Processing tokens...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-6 py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Payment Verified!</h3>
                <p className="text-gray-400 text-sm mb-4">
                  {amount} tokens have been added to your account
                </p>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-green-400 font-semibold">
                    +{amount} Tokens Credited
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;