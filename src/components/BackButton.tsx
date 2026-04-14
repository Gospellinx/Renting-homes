import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

interface BackButtonProps {
  showHomeLink?: boolean;
  className?: string;
}

const BackButton = ({ showHomeLink = true, className = "" }: BackButtonProps) => {
  const navigate = useNavigate();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Back</span>
      </Button>
      {showHomeLink && (
        <Button 
          variant="ghost" 
          size="sm"
          asChild
        >
          <Link to="/" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </Button>
      )}
    </div>
  );
};

export default BackButton;
