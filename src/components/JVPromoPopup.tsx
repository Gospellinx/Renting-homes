import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Building2, FileText, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md rounded-2xl p-0 overflow-hidden">
        <div className="bg-primary px-6 pt-6 pb-5 text-primary-foreground">
          <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
            <Building2 className="h-5 w-5 text-secondary-foreground" />
          </div>
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-semibold leading-snug text-primary-foreground">
              Transform your idle property into a premium real estate asset
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="space-y-3 px-6 text-sm text-muted-foreground">
          <DialogDescription className="text-sm text-muted-foreground">
            At <span className="font-medium text-foreground">findaspace.help</span>, we partner
            with landowners across the FCT for highly profitable Joint Venture (JV) developments.
          </DialogDescription>
          <p>
            You provide the land, and we bring the financing, architectural design, and
            construction expertise. Let's collaborate to build a landmark project that maximizes
            your equity with zero development stress on your end.
          </p>
        </div>

        <div className="flex flex-col gap-2 px-6 pb-6 pt-2 sm:flex-row">
          <Button asChild className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact Us
            </a>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <a href={PROFILE_URL} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
              <FileText className="mr-2 h-4 w-4" />
              View Our Profile
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JVPromoPopup;
