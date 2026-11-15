import { Link, useLocation } from "react-router-dom";
import { Users } from "lucide-react";

const FloatingCommunityButton = () => {
  const location = useLocation();

  if (location.pathname !== "/") return null;

  return (
    <Link
      to="/community"
      className="group fixed bottom-6 left-6 z-50 inline-flex h-12 items-center gap-2.5 rounded-full border border-ink/10 bg-white pl-1.5 pr-5 text-[15px] font-semibold text-ink shadow-[0_14px_30px_rgba(12,42,30,0.18)] transition-transform hover:-translate-y-0.5"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-leaf text-white">
        <Users className="h-4 w-4" />
      </span>
      Community
    </Link>
  );
};

export default FloatingCommunityButton;

