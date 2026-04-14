import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { LucideIcon, ArrowLeft } from "lucide-react";

interface AuthPromptProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const AuthPrompt = ({ icon: Icon, title, description }: AuthPromptProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full relative">
        <CardHeader className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="absolute left-4 top-4 flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Icon className="h-12 w-12 mx-auto text-primary mb-2" />
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link to="/auth">
            <Button className="w-full">Sign In</Button>
          </Link>
          <Link to="/auth?mode=signup">
            <Button variant="outline" className="w-full">Create Account</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPrompt;
