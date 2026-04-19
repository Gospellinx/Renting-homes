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
        className="fixed bottom-6 right-6 z-40"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to="/community">
              <Button
                size="lg"
                className="h-16 w-16 rounded-full shadow-lg bg-indigo-500 hover:bg-indigo-600 text-white border-0 transition-all duration-300 hover:shadow-xl hover:scale-110 relative group"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex flex-col items-center justify-center"
                >
                  <Users className="h-6 w-6" />
                </motion.div>
                
                {/* Community label on hover */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  className="absolute right-full mr-3 px-3 py-2 bg-indigo-500 text-white text-sm font-semibold rounded-lg whitespace-nowrap pointer-events-none"
                >
                  Community
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
