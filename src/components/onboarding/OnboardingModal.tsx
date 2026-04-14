import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { User, FileCheck, MessageSquare, CheckCircle, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OnboardingModal = ({ open, onOpenChange }: OnboardingModalProps) => {
  const navigate = useNavigate();
  const { profileCompleted, verificationApproved, groupChatJoined, dismissOnboarding } = useOnboarding();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Welcome to Homes! 🏠",
      description: "Nigeria's trusted property verification platform. Let's set up your account in 3 easy steps.",
      icon: Sparkles,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Complete Your Profile",
      description: "Add your name, phone number, and location so verified agents and residents can connect with you.",
      icon: User,
      color: profileCompleted ? "text-primary" : "text-muted-foreground",
      bgColor: profileCompleted ? "bg-primary/10" : "bg-muted",
      completed: profileCompleted,
      action: () => {
        onOpenChange(false);
        navigate("/profile");
      },
      actionLabel: "Complete Profile",
    },
    {
      title: "Verify Your Property",
      description: "Submit your property documents for verification. This unlocks access to community features and group chats.",
      icon: FileCheck,
      color: verificationApproved ? "text-primary" : "text-muted-foreground",
      bgColor: verificationApproved ? "bg-primary/10" : "bg-muted",
      completed: verificationApproved,
      action: () => {
        onOpenChange(false);
        navigate("/community");
      },
      actionLabel: "Start Verification",
    },
    {
      title: "Join Your Community",
      description: "Once verified, join group chats with other verified residents in your area to discuss local issues.",
      icon: MessageSquare,
      color: groupChatJoined ? "text-primary" : "text-muted-foreground",
      bgColor: groupChatJoined ? "bg-primary/10" : "bg-muted",
      completed: groupChatJoined,
      disabled: !verificationApproved,
      action: () => {
        onOpenChange(false);
        navigate("/group-chats");
      },
      actionLabel: "Browse Groups",
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleDismiss = () => {
    dismissOnboarding();
    onOpenChange(false);
  };

  const currentSlideData = slides[currentSlide];
  const progress = ((currentSlide + 1) / slides.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <Progress value={progress} className="w-32 h-1" />
          </div>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="py-6"
          >
            <div className="text-center">
              <div
                className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${currentSlideData.bgColor} mb-6`}
              >
                {currentSlideData.completed ? (
                  <CheckCircle className="h-10 w-10 text-primary" />
                ) : (
                  <currentSlideData.icon className={`h-10 w-10 ${currentSlideData.color}`} />
                )}
              </div>

              <DialogTitle className="text-xl mb-2">{currentSlideData.title}</DialogTitle>
              <DialogDescription className="text-base">
                {currentSlideData.description}
              </DialogDescription>

              {currentSlideData.completed && (
                <div className="mt-4 inline-flex items-center gap-2 text-primary font-medium">
                  <CheckCircle className="h-4 w-4" />
                  Completed!
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex gap-1">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {currentSlide === slides.length - 1 ? (
            <div className="flex gap-2">
              {currentSlideData.action && !currentSlideData.disabled && !currentSlideData.completed && (
                <Button onClick={currentSlideData.action} className="gap-2">
                  {currentSlideData.actionLabel}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
              <Button variant="outline" onClick={handleDismiss}>
                Got it!
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              {currentSlideData.action && !currentSlideData.completed && (
                <Button
                  variant="outline"
                  onClick={currentSlideData.action}
                  disabled={currentSlideData.disabled}
                >
                  {currentSlideData.actionLabel}
                </Button>
              )}
              <Button onClick={handleNext} className="gap-2">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
