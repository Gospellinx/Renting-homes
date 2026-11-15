import { Link, NavLink } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { getDashboardPathForUser } from "@/lib/dashboardPath";
import homesLogo from "@/assets/homes-logo.png";

const navLinks = [
  { to: "/rental-properties", label: "Rent" },
  { to: "/buy-property", label: "Buy" },
  { to: "/buy-land", label: "Land" },
  { to: "/shop-rentals", label: "Shops" },
  { to: "/joint-ventures", label: "Joint ventures" },
  { to: "/community", label: "Community" },
];

export const Wordmark = ({ light = false }: { light?: boolean }) => (
  <Link to="/" className="flex items-center gap-2.5" aria-label="Find a Space home">
    <img src={homesLogo} alt="" className="h-9 w-9 object-contain" />
    <span
      className={`font-display text-[1.35rem] font-bold leading-none tracking-[-0.03em] ${
        light ? "text-white" : "text-ink"
      }`}
    >
      find<span className="text-leaf">a</span>space
    </span>
  </Link>
);

const SiteHeader = () => {
  const { user } = useAuth();
  const dashboardPath = getDashboardPathForUser(user);

  const rememberReturn = (href: string) => {
    if (!user) sessionStorage.setItem("auth_return_url", href);
  };

  const initial =
    user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Wordmark />

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="rounded-full px-3.5 py-2 text-[15px] font-medium text-ink/75 transition-colors hover:bg-ink/5 hover:text-ink"
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Link
              to={dashboardPath}
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3.5 text-[15px] font-medium text-ink transition-colors hover:bg-ink/5"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-ink text-xs font-semibold text-white">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          ) : (
            <Link
              to="/auth"
              className="rounded-full px-3.5 py-2 text-[15px] font-medium text-ink transition-colors hover:bg-ink/5"
            >
              Sign in
            </Link>
          )}
          <Link
            to={user ? "/upload-property" : "/auth?mode=signin"}
            onClick={() => rememberReturn("/upload-property")}
            className="group inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-[15px] font-semibold text-white transition-colors hover:bg-[#0f3d2a]"
          >
            <span className="hidden sm:inline">List a property</span>
            <span className="sm:hidden">List</span>
            <ArrowUpRight className="h-4 w-4 text-beacon transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      <nav
        aria-label="Sections"
        className="flex gap-1 overflow-x-auto border-t border-ink/10 px-3 py-2 lg:hidden [scrollbar-width:none]"
      >
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium text-ink/75 hover:bg-ink/5"
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
};

export default SiteHeader;
