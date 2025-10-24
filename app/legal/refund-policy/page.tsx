export const metadata = {
  title: 'Cancellation Policy - BlackBoard',
  description: 'Cancellation and withdrawal policy for BlackBoard products',
}

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-black text-white py-16">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
            Cancellation Policy
          </h1>
          <p className="text-lg md:text-xl text-gray-300">
            Statutory right of withdrawal
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8">

              {/* Introduction */}
              <div className="bg-gradient-to-br from-[#ffed00]/10 to-yellow-50 border-l-4 border-[#ffed00] rounded-r-2xl p-8">
                <p>
                  (1) When concluding a distance selling transaction, consumers generally have a statutory right of withdrawal, about which the provider hereby provides information below in accordance with the statutory model. The exceptions to the right of withdrawal are set out in paragraph (2). Paragraph (3) contains a sample cancellation form.
                </p>
              </div>

              {/* Cancellation Policy */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Cancellation Policy</h2>

                <h3 className="text-xl font-bold mb-3 mt-6">Right to Withdraw Consent</h3>
                <p>
                  You have the right to cancel this contract within fourteen days without giving any reasons.
                </p>
                <p className="mt-4">
                  The withdrawal period shall be fourteen days from the date on which you or a third party you have designated other than the carrier have taken possession of the goods.
                </p>
                <p className="mt-4">
                  To exercise your right of withdrawal, you must notify us through a clear declaration (e.g. through a letter sent by post, a fax, telephone call or an e-mail) of your decision to cancel this contract. You can use the enclosed sample cancellation form for this purpose, although this is not mandatory.
                </p>
                <p className="mt-4">
                  To comply with the cooling-off period, you only need to send the cancellation notice prior to the cooling-off period&apos;s expiration.
                </p>

                <h3 className="text-xl font-bold mb-3 mt-8">Effects of Withdrawal</h3>
                <p>
                  If you cancel this contract, we shall immediately refund to you all payments we have received from you, including delivery costs (except for the additional costs resulting from your choice of a delivery type different from the low-priced standard delivery we offered), within at most fourteen days from the date when we receive notice of your cancellation of this contract. We shall reimburse you through the same means of payment you used for the initial transaction, unless you have expressly agreed otherwise, and in no event shall you incur any fees as a result of such reimbursement.
                </p>
                <p className="mt-4">
                  We may withhold reimbursement until we have received the returned goods or you have supplied evidence of having returned the goods, whichever is earlier.
                </p>
                <p className="mt-4">
                  You must return or hand over the goods to us immediately and in any case within fourteen days of the day on which you notify us of the cancellation of this contract at the latest. The deadline shall be met if you return the goods before the fourteen day – period has expired.
                </p>
                <p className="mt-4">
                  <strong>You shall bear the direct costs of returning the goods.</strong>
                </p>
                <p className="mt-4">
                  You shall only be liable for any loss in value of the goods if this loss in value is due to a handling of the goods not necessary for the verification of the goods&apos; quality, characteristics and functioning.
                </p>
              </div>

              {/* Exceptions */}
              <div className="bg-gray-50 rounded-xl p-8">
                <h3 className="text-xl font-bold mb-4">(2) Exceptions to the Right of Withdrawal</h3>
                <p className="mb-4">
                  The right of withdrawal does not apply to contracts for the delivery of goods which are not prefabricated and for whose manufacture an individual selection or instruction by the consumer is essential or which are clearly tailored to the consumer&apos;s personal requirements.
                </p>
                <p className="mb-0">
                  The right of withdrawal will also lapse in contracts for the delivery of digital content not on a physical data carrier even if the entrepreneur has begun the execution of the contract after the consumer has expressly agreed to the entrepreneur beginning the contract&apos;s execution before the withdrawal period&apos;s expiry, and has confirmed its awareness of the fact that it loses its right of withdrawal through its consent upon the start of the contract&apos;s execution.
                </p>
              </div>

              {/* Sample Cancellation Form */}
              <div>
                <h3 className="text-xl font-bold mb-4">(3) Sample Cancellation Form</h3>
                <p className="mb-4">
                  In accordance with statutory provisions, the provider hereby supplies the following information on the sample cancellation form:
                </p>

                <div className="bg-white border-2 border-gray-300 rounded-xl p-8">
                  <h4 className="font-bold mb-4">Sample cancellation form</h4>
                  <p className="text-sm italic mb-6">(Please complete this form and return it if you wish to cancel the contract).</p>

                  <div className="space-y-4 font-mono text-sm">
                    <div>
                      <p className="font-bold mb-2">— To:</p>
                      <p>
                        Blackboard GmbH & Co KG<br />
                        Heerweg 30<br />
                        40789 Monheim am Rhein
                      </p>
                      <p className="mt-2">
                        Email: info@blackboard-training.com
                      </p>
                    </div>

                    <div className="border-t border-gray-300 pt-4 mt-6 space-y-2">
                      <p>— I/We (*) hereby cancel the contract I/we (*) concluded for the purchase of the following goods (*)/</p>
                      <p>— Ordered on (*)/received on (*)</p>
                      <p>— Name of the consumer(s)</p>
                      <p>— Address of the consumer(s)</p>
                      <p>— Signature of the consumer(s) (only for paper notifications)</p>
                      <p>— Date</p>
                    </div>

                    <p className="text-xs italic border-t border-gray-300 pt-4 mt-4">(*) Delete as applicable</p>
                  </div>

                  <div className="mt-8 bg-[#ffed00] rounded-lg p-6">
                    <p className="font-bold text-black mb-2">Cancellations can also be effected by telephone:</p>
                    <p className="text-black font-mono">
                      Tel: +49 2173 2651120
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
