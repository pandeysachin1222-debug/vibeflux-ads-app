import { MessageCircle } from "lucide-react";

// Placeholder — replace [Placeholder_Phone_Number] with real support number later.
export const SUPPORT_WHATSAPP_URL = "https://wa.me/[Placeholder_Phone_Number]";
export const SUPPORT_EMAIL = "kalyugravan12@gmail.com";

/**
 * Floating WhatsApp Support Button
 * Fixed bottom-right on all viewports. Opens official support channel in new tab.
 */
export function FloatingWhatsApp() {
  return (
    <a
      href={SUPPORT_WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with VibeFlux Support on WhatsApp"
      className="fixed bottom-5 right-5 z-50 group flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.6)] ring-1 ring-white/20 hover:bg-[#20b858] transition-transform hover:-translate-y-0.5"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline text-sm font-medium">WhatsApp Support</span>
    </a>
  );
}
