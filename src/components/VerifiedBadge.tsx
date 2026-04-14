import { BadgeCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const VerifiedBadge = ({ className = "" }: { className?: string }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <BadgeCheck className={`h-4 w-4 text-blue-500 inline-block shrink-0 ${className}`} />
    </TooltipTrigger>
    <TooltipContent>
      <p className="text-xs">Verified Agent</p>
    </TooltipContent>
  </Tooltip>
);

export default VerifiedBadge;
