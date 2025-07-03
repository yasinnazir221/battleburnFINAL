import React, { useState } from 'react';
import { X, Smartphone, Send, CheckCircle, AlertTriangle, Copy } from 'lucide-react';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTokens: number;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ isOpen, onClose, currentTokens }) => {
  const [step, setStep] = useState<'method' | 'details' | 'confirm' | 'success'>('method');
  const [paymentMethod, setPaymentMethod] = useState<'jazzcash' | 'easypaisa' | null>(null);
  const [amount, setAmount] = useState<number>(50);
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const serviceFee = Math.max(Math.floor(amount * 0.02), 5);
  const netAmount = amount - serviceFee;
  const maxWithdrawal = currentTokens;

  const handleSubmit = async () => {
    if (!paymentMethod || !accountNumber || amount < 50 || amount > currentTokens) return;
    
    setLoading(true);
    setStep('confirm');
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you would submit the withdrawal request to your backend
      // The admin would then review and process the request
      
      setStep('success');
      
      // Auto close after success
      setTimeout(() => {
        onClose();
        resetModal();
      }, 4000);
    } catch (error) {
      console.error('Withdrawal submission error:', error);
      setLoading(false);
      setStep('details');
    }
  };

  const resetModal = () => {
    setStep('method');
    setPaymentMethod(null);
    setAmount(50);
    setAccountNumber('');
    setLoading(false);
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-blue-500/30 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Send className="text-blue-400" />
            Withdraw Tokens
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
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Choose Withdrawal Method</h3>
                <p className="text-gray-400 text-sm">Select where you want to receive your money</p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 font-semibold text-sm">Withdrawal Information</span>
                </div>
                <div className="space-y-1 text-xs text-gray-400">
                  <p>• Minimum withdrawal: 50 tokens</p>
                  <p>• Service fee: 2% (minimum 5 tokens)</p>
                  <p>• Processing time: 24-48 hours</p>
                  <p>• Available balance: {currentTokens} tokens</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* JazzCash Option */}
                <button
                  onClick={() => {
                    setPaymentMethod('jazzcash');
                    setStep('details');
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
                        <p className="text-gray-400 text-sm">Withdraw to JazzCash account</p>
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
                    setStep('details');
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
                        <p className="text-gray-400 text-sm">Withdraw to EasyPaisa account</p>
                      </div>
                    </div>
                    <div className="text-green-400 group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 'details' && paymentMethod && (
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
                  {paymentMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} Withdrawal
                </h3>
                <p className="text-gray-400 text-sm">Enter your withdrawal details</p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <label className="block text-gray-300 text-sm mb-2">
                  {paymentMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} Account Number:
                </label>
                <input
                  type="tel"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="03XXXXXXXXX"
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
                />
                <p className="text-gray-400 text-xs mt-2">
                  Enter the mobile number linked to your {paymentMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} account
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <label className="block text-gray-300 text-sm mb-2">Withdrawal Amount (Tokens):</label>
                <input
                  type="number"
                  min="50"
                  max={currentTokens}
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 50)}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
                />
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Withdrawal Amount:</span>
                    <span className="text-white">{amount} tokens</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Service Fee (2%):</span>
                    <span className="text-red-400">-{serviceFee} tokens</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-600 pt-2">
                    <span className="text-gray-300 font-semibold">You'll Receive:</span>
                    <span className="text-green-400 font-bold">{netAmount} PKR</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('method')}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('confirm')}
                  disabled={!accountNumber || amount < 50 || amount > currentTokens}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:cursor-not-allowed"
                >
                  Review Withdrawal
                </button>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Confirm Withdrawal</h3>
                <p className="text-gray-400 text-sm">Please review your withdrawal details</p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Method:</span>
                  <span className="text-white capitalize font-semibold">{paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Account Number:</span>
                  <span className="text-white font-mono">{accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Withdrawal Amount:</span>
                  <span className="text-white">{amount} tokens</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Service Fee:</span>
                  <span className="text-red-400">-{serviceFee} tokens</span>
                </div>
                <div className="flex justify-between border-t border-gray-600 pt-4">
                  <span className="text-gray-300 font-semibold">Final Amount:</span>
                  <span className="text-green-400 font-bold text-lg">{netAmount} PKR</span>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold text-sm">Important Notice</span>
                </div>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• Processing time: 24-48 hours</li>
                  <li>• Ensure your account number is correct</li>
                  <li>• Withdrawal requests cannot be cancelled once submitted</li>
                  <li>• Admin will review and process your request</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('details')}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Withdrawal'}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-6 py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Withdrawal Request Submitted!</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Your withdrawal request has been submitted for admin review
                </p>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Amount Requested:</span>
                      <span className="text-white">{amount} tokens</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">You'll Receive:</span>
                      <span className="text-green-400 font-bold">{netAmount} PKR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">To Account:</span>
                      <span className="text-white font-mono">{accountNumber}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-500 text-xs mt-4">
                  You will be notified once your withdrawal is processed (24-48 hours)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawalModal;