export const metadata = {
  title: 'Imprint - BlackBoard',
  description: 'Legal information and company details for BlackBoard Training',
}

export default function ImprintPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-black text-white py-16">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
            Imprint
          </h1>
          <p className="text-lg md:text-xl text-gray-300">
            Legal information according to § 5 TMG
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8">

              {/* According to § 5 TMG */}
              <div className="bg-gradient-to-br from-[#ffed00]/10 to-yellow-50 border-l-4 border-[#ffed00] rounded-r-2xl p-8">
                <h2 className="text-2xl font-bold mb-4">According to § 5 TMG:</h2>
                <p className="mb-2">
                  <strong className="text-xl">Blackboard GmbH & Co. KG</strong>
                </p>
                <p className="mb-2">
                  Heerweg 30<br />
                  D- 40789 Monheim am Rhein
                </p>
                <p className="mb-2">
                  <strong>Phone:</strong> +49 2173 2651120<br />
                  <strong>E-Mail:</strong> info@blackboard-training.com
                </p>
                <p className="mb-2">
                  <strong>Authorized Managing Directors:</strong> Gregor Stumpf, Lars Grandjot
                </p>
                <p className="mb-2">
                  <strong>Sales tax identification number (VAT) according to § 27 a Umsatzsteuergesetz (UStG):</strong><br />
                  DE316367106
                </p>
                <p className="mb-0">
                  <strong>Responsible for the content is according to § 55 Abs. 2 RStV:</strong><br />
                  Gregor Stumpf, Lars Grandjot
                </p>
              </div>

              {/* Out-of-court dispute resolution */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Out-of-court dispute resolution</h2>
                <p className="mb-4">
                  The EU platform for out-of-court online dispute resolution can be found here:{' '}
                  <a
                    href="https://ec.europa.eu/consumers/odr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#ffed00] hover:underline font-medium"
                  >
                    https://ec.europa.eu/consumers/odr/
                  </a>
                </p>
                <p className="mb-0">
                  We are neither willing nor obliged to participate in a dispute settlement procedure before a consumer arbitration board.
                </p>
              </div>

              {/* Liability for content */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-4">Liability for content</h2>
                <p className="mb-0">
                  The site operator assumes no liability for information transmitted or stored by third parties. An obligation to monitor this information does not exist on the part of the site operator. If unlawful information is transmitted or stored by third parties, the site operator is only liable if he does not comply with a legitimate request to delete the information. Obviously illegal information will be deleted immediately after becoming known.
                </p>
              </div>

              {/* Liability for links */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-4">Liability for links</h2>
                <p className="mb-0">
                  The site operator has no influence on external links. Before the publication of the links on these pages , these were checked to a reasonable extent for compliance with the legal provisions. The site operator is not responsible for changes resulting from the pages accessible via external links. In particular, a continuous control of external links to violations is not reasonable. Insofar as the site operator is informed of illegal content that can be accessed via external links, he immediately removes these links.
                </p>
              </div>

              {/* Copyright */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-4">Copyright</h2>
                <p className="mb-0">
                  The copyright to all retrievable on the pages of the operator texts and multimedia content is owned by the site operator, as far as divergent copyrights are not shown separately. If the copyrights of third parties are not shown, a message via e-mail is requested. The site operator will remove such content immediately. The processing, distribution and duplication of content is not permitted without the explicit consent of the site operator.
                </p>
              </div>

              {/* Objection to contact for advertising */}
              <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-6">
                <h2 className="text-2xl font-bold mb-4">Objection to contact for advertising</h2>
                <p className="mb-0">
                  The contact for advertising in any form is hereby expressly contradicted. If you violate this prohibition, we reserve the right to take legal action.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
