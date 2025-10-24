'use client'

import { useState, useEffect } from 'react'
import { Calendar, X } from 'lucide-react'

const BOOKING_WIDGET = `
<script src="//widget.simplybook.it/v2/widget/widget.js" type="text/javascript"></script>
<script type="text/javascript">
    var widget = new SimplybookWidget({
        "widget_type":"iframe",
        "url":"https://blackboardtraining.simplybook.it",
        "theme":"default",
        "theme_settings":{
            "timeline_hide_unavailable":"1",
            "hide_past_days":"0",
            "timeline_show_end_time":"0",
            "timeline_modern_display":"as_slots",
            "sb_base_color":"#ffed00",
            "display_item_mode":"block",
            "booking_nav_bg_color":"#ffed00",
            "body_bg_color":"#f2f2f2",
            "sb_review_image":"",
            "dark_font_color":"#000000",
            "light_font_color":"#f5fcff",
            "btn_color_1":"#ffed00",
            "sb_company_label_color":"#ffffff",
            "hide_img_mode":"1",
            "show_sidebar":"1",
            "sb_busy":"#c7b3b3",
            "sb_available":"#d6ebff"
        },
        "timeline":"modern",
        "datepicker":"top_calendar",
        "is_rtl":false,
        "app_config":{"clear_session":0,"allow_switch_to_ada":0,"predefined":[]}
    });
</script>
`

export default function ConsultationBookingButton() {
  const [showBookingModal, setShowBookingModal] = useState(false)

  // Inject booking widget script when modal opens
  useEffect(() => {
    if (showBookingModal) {
      // Create a temporary div to parse the script
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = BOOKING_WIDGET

      // Find and execute any script tags
      const scripts = tempDiv.getElementsByTagName('script')
      const loadedScripts: HTMLScriptElement[] = []

      // Load external scripts first, then inline scripts
      const externalScripts: HTMLScriptElement[] = []
      const inlineScripts: HTMLScriptElement[] = []

      Array.from(scripts).forEach(script => {
        if (script.src) {
          externalScripts.push(script)
        } else {
          inlineScripts.push(script)
        }
      })

      // Load external scripts with promises
      const loadExternalScripts = async () => {
        for (const script of externalScripts) {
          const newScript = document.createElement('script')
          newScript.src = script.src

          // Wait for each external script to load
          await new Promise<void>((resolve, reject) => {
            newScript.onload = () => resolve()
            newScript.onerror = () => reject()
            document.body.appendChild(newScript)
            loadedScripts.push(newScript)
          })
        }

        // After external scripts are loaded, execute inline scripts
        inlineScripts.forEach(script => {
          const newScript = document.createElement('script')
          newScript.textContent = script.textContent
          document.body.appendChild(newScript)
          loadedScripts.push(newScript)
        })
      }

      loadExternalScripts().catch(err => {
        console.error('Failed to load booking widget scripts:', err)
      })

      // Clean up scripts when modal closes
      return () => {
        loadedScripts.forEach(script => {
          script.remove()
        })
      }
    }
  }, [showBookingModal])

  return (
    <>
      <button
        onClick={() => setShowBookingModal(true)}
        className="w-full bg-[#ffed00] text-black py-3.5 px-6 rounded-full font-semibold hover:bg-yellow-400 transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2"
      >
        <Calendar className="h-5 w-5" />
        Book an Online Consultation
      </button>

      {/* Booking Widget Modal */}
      {showBookingModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowBookingModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>

            {/* Widget content */}
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-4">Book Your Workshop Session</h3>
              <div
                dangerouslySetInnerHTML={{ __html: BOOKING_WIDGET }}
                className="booking-widget-container"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
