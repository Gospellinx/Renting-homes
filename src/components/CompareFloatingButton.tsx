import { Button } from "@/components/ui/button";
import { Scale, X } from "lucide-react";
import { useCompareProperties } from "@/hooks/useCompareProperties";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const CompareFloatingButton = () => {
  const { properties, clearAll } = useCompareProperties();
  const navigate = useNavigate();

  if (properties.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="bg-card border shadow-lg rounded-full px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <span className="font-medium">{properties.length} properties</span>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => navigate('/compare-properties')}
              disabled={properties.length < 2}
            >
              Compare Now
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearAll}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CompareFloatingButton;
