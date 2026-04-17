import { useEffect, useState } from 'react';
import { TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';

interface ExchangeRates {
  bank: number;
  mobile: number;
  street: number;
  rpnmore: number;
}

export function ExchangeRateWidget() {
  const [rates, setRates] = useState<ExchangeRates>({
    bank: 12.1,
    mobile: 12.6,
    street: 13.0,
    rpnmore: 13.2
  });
  const [lossAmount, setLossAmount] = useState(110);

  // Calculate loss based on $100
  useEffect(() => {
    const loss = Math.round((rates.rpnmore - rates.bank) * 100);
    setLossAmount(loss);
  }, [rates]);

  return (
    <div className="bg-gradient-to-br from-amber-900/90 to-orange-900/90 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/30 shadow-2xl max-w-md">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🇬🇭</span>
        <div>
          <h3 className="text-white font-bold text-lg">Ghana Today</h3>
          <p className="text-amber-200 text-xs">Live Exchange Rates</p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-green-400 text-xs">
          <TrendingUp size={14} />
          <span>Live</span>
        </div>
      </div>

      {/* Rates Grid */}
      <div className="space-y-3">
        {/* Bank Rate */}
        <div className="flex items-center justify-between bg-red-900/40 rounded-lg p-3 border border-red-500/30">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium text-sm">Bank Rate</span>
            <span className="text-red-400 text-xs">❌</span>
          </div>
          <div className="text-right">
            <span className="text-white font-bold">1 USD = </span>
            <span className="text-red-400 font-bold">GHS {rates.bank.toFixed(1)}</span>
          </div>
        </div>

        {/* Mobile Money */}
        <div className="flex items-center justify-between bg-gray-800/40 rounded-lg p-3 border border-gray-600/30">
          <span className="text-gray-300 font-medium text-sm">Mobile Money</span>
          <div className="text-right">
            <span className="text-gray-400">1 USD = </span>
            <span className="text-gray-300 font-bold">GHS {rates.mobile.toFixed(1)}</span>
          </div>
        </div>

        {/* Street Rate */}
        <div className="flex items-center justify-between bg-orange-900/40 rounded-lg p-3 border border-orange-500/30">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium text-sm">Street Rate</span>
            <span className="text-orange-400 text-xs">🔥</span>
          </div>
          <div className="text-right">
            <span className="text-gray-300">1 USD = </span>
            <span className="text-orange-400 font-bold">GHS {rates.street.toFixed(1)}</span>
          </div>
        </div>

        {/* RPNMore Rate */}
        <div className="flex items-center justify-between bg-green-900/40 rounded-lg p-3 border border-green-500/30">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm">RPNMore</span>
            <span className="text-green-400 text-xs">✅ Best Rate</span>
          </div>
          <div className="text-right">
            <span className="text-gray-300">1 USD = </span>
            <span className="text-green-400 font-bold text-lg">GHS {rates.rpnmore.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Loss Alert */}
      <div className="mt-4 flex items-center gap-2 bg-red-900/60 rounded-lg p-3 border border-red-500/40">
        <AlertTriangle className="text-red-400 flex-shrink-0" size={20} />
        <p className="text-white text-sm">
          You lose <span className="text-red-400 font-bold">GHS {lossAmount}</span> per $100 😳
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="mt-4 flex gap-2">
        <a
          href="https://rpnmore.com/services"
          className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105"
        >
          Fix This Now
          <ArrowRight size={16} />
        </a>
        <a
          href={`https://wa.me/?text=${encodeURIComponent('🇬🇭 Get the best USD/GHS rate at RPNMore! 1 USD = GHS ' + rates.rpnmore + ' ✅\n\nStop losing money at the bank!\n\n👉 https://rpnmore.com')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-700 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-all"
          title="Share on WhatsApp"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26 9.868 9.868 0 0116.095-7.656 9.867 9.867 0 01-2.212 15.724 9.87 9.87 0 01-7.002 1.824zm-5.953-23.076a11.818 11.818 0 00-8.258 20.354l-1.056 3.851 3.944-1.035a11.832 11.832 0 0020.234-8.38 11.818 11.818 0 00-14.864-14.79z"/>
          </svg>
        </a>
      </div>
    </div>
  );
}
