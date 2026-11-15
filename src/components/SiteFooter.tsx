import { Link } from "react-router-dom";
import { Wordmark } from "@/components/SiteHeader";

const columns = [
  {
    title: "Find",
    links: [
      { to: "/rental-properties", label: "Homes to rent" },
      { to: "/buy-property", label: "Homes to buy" },
      { to: "/buy-land", label: "Land" },
      { to: "/shop-rentals", label: "Shops" },
    ],
  },
  {
    title: "Owners and agents",
    links: [
      { to: "/upload-property", label: "List a property" },
      { to: "/ads-manager", label: "Ads manager" },
      { to: "/joint-ventures", label: "Joint ventures" },
      { to: "/verified-merchants", label: "Verified merchants" },
    ],
  },
  {
    title: "More",
    links: [
      { to: "/community", label: "Community" },
      { to: "/compare-properties", label: "Compare properties" },
      { to: "/auth", label: "Sign in" },
    ],
  },
];

const SiteFooter = () => (
  <footer className="bg-ink text-white">
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
      <div>
        <Wordmark light />
        <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-white/65">
          Homes, land and shops across Nigeria, plus joint venture development for landowners in
          the FCT.
        </p>
        <a
          href="https://wa.me/2347067710319"
          target="_blank"
          rel="noopener noreferrer"
          className="plot-label mt-6 inline-block border-b border-beacon pb-1 text-beacon hover:text-white"
        >
          WhatsApp +234 706 771 0319
        </a>
      </div>

      {columns.map((column) => (
        <div key={column.title}>
          <p className="plot-label text-white/45">{column.title}</p>
          <ul className="mt-4 space-y-2.5">
            {column.links.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-[15px] text-white/80 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="border-t border-white/10">
      <p className="plot-label mx-auto max-w-7xl px-4 py-5 text-white/40 sm:px-6">
        © {new Date().getFullYear()} findaspace.help
      </p>
    </div>
  </footer>
);

export default SiteFooter;
