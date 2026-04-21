import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const FloatingCommunityButton = () => {
  return (
    <TooltipProvider>
      <motion.div
        className="fixed top-1/2 right-6 z-40 flex items-center gap-3 -translate-y-1/2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {/* Community label */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white text-[#26225f] px-4 py-2 rounded-full font-semibold text-sm shadow-lg"
        >
          Community
        </motion.div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Link to="/community">
              <Button
                size="lg"
                className="h-16 w-16 rounded-full shadow-lg bg-[#EA580C] hover:bg-[#d94a0a] text-white border-0 transition-all duration-300 hover:shadow-xl hover:scale-110"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex flex-col items-center justify-center"
                >
                  <Users className="h-6 w-6" />
                </motion.div>
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-slate-900 text-white border-slate-700">
            <p className="text-sm font-semibold">Join Our Community</p>
            <p className="text-xs text-slate-300">Connect & Engage</p>
          </TooltipContent>
        </Tooltip>
      </motion.div>
    </TooltipProvider>
  );
};

export default FloatingCommunityButton;
