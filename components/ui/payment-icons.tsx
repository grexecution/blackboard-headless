// Shared payment icons component
export const PaymentIcons = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2 justify-center py-3 px-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 ${className}`}>
    <span className="text-xs text-gray-600 font-medium">We accept:</span>
    <div className="flex gap-2 items-center">
      {/* Visa */}
      <svg className="h-8 w-auto drop-shadow-sm" viewBox="0 0 48 32" fill="none">
        <rect width="48" height="32" rx="4" fill="white"/>
        <rect width="48" height="32" rx="4" stroke="#E5E5E5" strokeWidth="0.5"/>
        <path d="M20.5 11L17.5 21H14.5L17.5 11H20.5Z" fill="#1A1F71"/>
        <path d="M32 11L29 18L26 11H23L27 21H31L35 11H32Z" fill="#1A1F71"/>
      </svg>
      {/* Mastercard */}
      <svg className="h-8 w-auto drop-shadow-sm" viewBox="0 0 48 32" fill="none">
        <rect width="48" height="32" rx="4" fill="white"/>
        <rect width="48" height="32" rx="4" stroke="#E5E5E5" strokeWidth="0.5"/>
        <circle cx="19" cy="16" r="7" fill="#EB001B"/>
        <circle cx="29" cy="16" r="7" fill="#F79E1B" fillOpacity="0.8"/>
      </svg>
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
)

export default PaymentIcons