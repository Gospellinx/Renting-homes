import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
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
                className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600 text-white border-0 transition-all duration-300 hover:shadow-xl hover:scale-110"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <MessageCircle className="h-7 w-7" />
                </motion.div>
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-slate-900 text-white border-slate-700">
            <p className="text-sm font-semibold">Join Our Community</p>
            <p className="text-xs text-slate-300">Chat & Connect</p>
          </TooltipContent>
        </Tooltip>
      </motion.div>
    </TooltipProvider>
  );
};

export default FloatingCommunityButton;
