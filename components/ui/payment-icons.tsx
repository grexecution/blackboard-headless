// Shared payment icons component
export const PaymentIcons = ({ className = "" }: { className?: string }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    <div className="flex items-center gap-2 justify-center py-3 px-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
      <span className="text-xs text-gray-600 font-medium">We accept:</span>
      <div className="flex gap-2 items-center flex-wrap justify-center">
        {/* Visa */}
        <div className="bg-white px-3 py-1.5 rounded border border-gray-200 shadow-sm">
          <span className="text-[#1434CB] font-bold text-sm tracking-wider">VISA</span>
        </div>
        {/* Mastercard */}
        <div className="bg-white px-2 py-1.5 rounded border border-gray-200 shadow-sm">
          <svg className="h-5 w-auto" viewBox="0 0 48 32" fill="none">
            <circle cx="16" cy="16" r="8" fill="#EB001B"/>
            <circle cx="32" cy="16" r="8" fill="#F79E1B" fillOpacity="0.8"/>
          </svg>
        </div>
        {/* Apple Pay */}
        <div className="bg-black px-3 py-1.5 rounded shadow-sm flex items-center gap-1">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="white">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          <span className="text-white font-semibold text-xs">Pay</span>
        </div>
        {/* Google Pay */}
        <div className="bg-white px-3 py-1.5 rounded border border-gray-200 shadow-sm flex items-center gap-1.5">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="text-gray-700 font-semibold text-xs">Pay</span>
        </div>
        {/* PayPal */}
        <div className="bg-gradient-to-r from-[#003087] to-[#012169] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center shadow-sm">
          Pay<span className="text-[#009CDE]">Pal</span>
        </div>
        {/* Klarna */}
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-3 py-1.5 rounded text-xs font-bold shadow-sm">
          Klarna
        </div>
      </div>
    </div>
  </div>
)

export default PaymentIcons