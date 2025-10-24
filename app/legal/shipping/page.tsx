export const metadata = {
  title: 'Shipping & Delivery - BlackBoard',
  description: 'Shipping conditions and delivery information for BlackBoard products',
}

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-black text-white py-16">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
            Shipping & Delivery
          </h1>
          <p className="text-lg md:text-xl text-gray-300">
            Prices, shipping costs, and delivery conditions
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8">

              {/* Prices and Shipping Costs */}
              <div className="bg-gradient-to-br from-[#ffed00]/10 to-yellow-50 border-l-4 border-[#ffed00] rounded-r-2xl p-8">
                <h2 className="text-2xl font-bold mb-4">Prices, Shipping Costs, Return Shipping Costs</h2>

                <p className="mb-6">
                  The prices are final prices in euro.
                </p>

                <div className="bg-white rounded-xl p-6 mb-6">
                  <h3 className="text-xl font-bold mb-4">Shipping Costs Within Germany</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="font-semibold">Single shipping within Germany</span>
                      <span className="text-2xl font-bold text-[#ffed00]">€4.90</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Orders of 2 and more boards</span>
                      <span className="text-2xl font-bold text-[#ffed00]">€6.90</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 mb-6">
                  <h3 className="text-xl font-bold mb-4">Deliveries to Other European Countries</h3>
                  <p className="text-lg">
                    Deliveries to other European countries cost <strong className="text-[#ffed00]">€6.90 or €8.90</strong>.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h3 className="text-xl font-bold mb-3">Delivery Abroad - Customs and Fees</h3>
                  <p className="mb-0">
                    For delivery abroad, depending on the item, customs and other fees, as well as taxes in the recipient country may be added. These costs shall be borne by the Customer and must be paid directly to the competent authorities.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-gray-300">
                  <h3 className="text-xl font-bold mb-3">Return Shipping Costs</h3>
                  <p className="mb-0">
                    <strong>The Customer shall pay the return shipping costs in the event of a cancellation.</strong>
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
