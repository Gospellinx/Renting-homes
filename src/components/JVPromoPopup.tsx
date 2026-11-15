import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FileText } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PlotCorners from "@/components/PlotCorners";

const WHATSAPP_NUMBER = "2347067710319";
const WHATSAPP_MESSAGE =
  "Hello findaspace.help, I have land in the FCT and I'm interested in a Joint Venture development.";
const PROFILE_URL =
  "https://drive.google.com/file/d/1FFqG48edDUhQKY7exVsX5YtIeI16ktnE/view?usp=sharing";

const STORAGE_KEY = "jv-promo-popup-seen";
const SHOW_DELAY_MS = 4000;
const EXCLUDED_PREFIXES = ["/auth", "/onboarding", "/admin", "/dashboard", "/upgrade"];

const hasSeenPopup = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const markPopupSeen = () => {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // storage unavailable (private mode etc.) — popup may show again, which is fine
  }
};

const JVPromoPopup = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const isExcluded = EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (isExcluded || hasSeenPopup()) return;
    const timer = setTimeout(() => {
      setOpen(true);
      markPopupSeen();
    }, SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isExcluded]);

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[calc(100%-2rem)] gap-0 overflow-visible rounded-none border-0 bg-ink p-0 text-white shadow-[0_30px_80px_rgba(6,23,15,0.5)] sm:max-w-[30rem] sm:rounded-none [&>button]:right-4 [&>button]:top-4 [&>button]:text-white">
        <PlotCorners />
        <div className="survey-grid px-6 pb-7 pt-8 sm:px-9 sm:pt-10">
          <p className="plot-label text-beacon">Joint venture · FCT landowners</p>
          <DialogHeader className="mt-4 text-left">
            <DialogTitle className="font-display text-[1.9rem] font-bold leading-[1.04] tracking-[-0.035em] text-white sm:text-[2.25rem]">
              Transform your idle property into a premium real estate asset.
            </DialogTitle>
          </DialogHeader>

          <DialogDescription className="mt-5 text-[15px] leading-relaxed text-white/75">
            At <span className="font-semibold text-white">findaspace.help</span>, we partner with
            landowners across the FCT for highly profitable Joint Venture (JV) developments.
          </DialogDescription>
          <p className="mt-3 text-[15px] leading-relaxed text-white/75">
            You provide the land, and we bring the financing, architectural design, and
            construction expertise. Let&apos;s collaborate to build a landmark project that
            maximizes your equity with zero development stress on your end.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 text-[15px] font-bold text-[#06170f] transition-colors hover:bg-[#3fe07c]"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Contact Us
            </a>
            <a
              href={PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-white/30 px-5 text-[15px] font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
            >
              <FileText className="h-4 w-4" />
              View Our Profile
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JVPromoPopup;
