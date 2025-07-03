import React, { useState } from 'react';
import { X, Upload, Camera, CheckCircle, Loader, Copy, CreditCard, Smartphone, Zap } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSubmit: (amount: number, screenshot: File) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onPaymentSubmit }) => {
  const [step, setStep] = useState<'method' | 'instructions' | 'upload' | 'processing' | 'success'>('method');
  const [paymentMethod, setPaymentMethod] = useState<'jazzcash' | 'easypaisa' | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);

  const paymentNumbers = {
    jazzcash: '03092198628',
    easypaisa: '03092198628'
  };

  const copyPaymentNumber = () => {
    const number = paymentMethod ? paymentNumbers[paymentMethod] : '';
    navigator.clipboard.writeText(number);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
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
    setStep('method');
    setPaymentMethod(null);
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
          {step === 'method' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Choose Payment Method</h3>
                <p className="text-gray-400 text-sm">Select your preferred mobile payment service</p>
              </div>

              <div className="space-y-4">
                {/* JazzCash Option */}
                <button
                  onClick={() => {
                    setPaymentMethod('jazzcash');
                    setStep('instructions');
                  }}
                  className="w-full bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 border border-red-500/30 rounded-xl p-6 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                        <Smartphone className="w-6 h-6 text-red-400" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-white font-bold">JazzCash</h4>
                        <p className="text-gray-400 text-sm">Mobile wallet payment</p>
                      </div>
                    </div>
                    <div className="text-red-400 group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </div>
                </button>

                {/* EasyPaisa Option */}
                <button
                  onClick={() => {
                    setPaymentMethod('easypaisa');
                    setStep('instructions');
                  }}
                  className="w-full bg-gradient-to-r from-green-500/20 to-blue-500/20 hover:from-green-500/30 hover:to-blue-500/30 border border-green-500/30 rounded-xl p-6 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                        <Smartphone className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-white font-bold">EasyPaisa</h4>
                        <p className="text-gray-400 text-sm">Mobile wallet payment</p>
                      </div>
                    </div>
                    <div className="text-green-400 group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </div>
                </button>
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
            </div>
          )}

          {step === 'instructions' && paymentMethod && (
            <div className="space-y-6">
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  paymentMethod === 'jazzcash' ? 'bg-red-500/20' : 'bg-green-500/20'
                }`}>
                  <Smartphone className={`w-8 h-8 ${
                    paymentMethod === 'jazzcash' ? 'text-red-400' : 'text-green-400'
                  }`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {paymentMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} Payment
                </h3>
                <p className="text-gray-400 text-sm">1 Token = 1 PKR</p>
              </div>

              <div className={`border-2 rounded-lg p-4 ${
                paymentMethod === 'jazzcash' 
                  ? 'bg-red-500/10 border-red-500/30' 
                  : 'bg-green-500/10 border-green-500/30'
              }`}>
                <h4 className={`font-semibold mb-3 ${
                  paymentMethod === 'jazzcash' ? 'text-red-400' : 'text-green-400'
                }`}>
                  Payment Instructions:
                </h4>
                <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
                  <li>Send money to our {paymentMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} number</li>
                  <li>Take a screenshot of the payment confirmation</li>
                  <li>Upload the screenshot here</li>
                  <li>Our AI will verify and credit tokens automatically</li>
                </ol>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <label className="block text-gray-300 text-sm mb-2">
                  {paymentMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} Number:
                </label>
                <div className={`flex items-center justify-between border-2 rounded p-3 ${
                  paymentMethod === 'jazzcash' 
                    ? 'bg-red-500/10 border-red-500/30' 
                    : 'bg-green-500/10 border-green-500/30'
                }`}>
                  <span className={`font-mono font-bold text-lg ${
                    paymentMethod === 'jazzcash' ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {paymentNumbers[paymentMethod]}
                  </span>
                  <button
                    onClick={copyPaymentNumber}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedNumber ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
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

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('method')}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('upload')}
                  disabled={amount <= 0}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 disabled:from-gray-600 disabled:to-gray-600 text-black font-bold py-3 px-4 rounded-lg transition-all disabled:cursor-not-allowed"
                >
                  Continue to Upload
                </button>
              </div>
            </div>
          )}

          {step === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Upload Payment Screenshot</h3>
                <p className="text-gray-400 text-sm">
                  Amount: {amount} PKR → {amount} Tokens via {paymentMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'}
                </p>
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
                <p className="text-gray-400 text-sm mb-4">
                  Our AI is verifying your {paymentMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} payment screenshot...
                </p>
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
                  {amount} tokens have been added to your account via {paymentMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'}
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