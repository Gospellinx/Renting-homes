import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, User, FileCheck, MessageSquare, CheckCircle, ArrowRight } from "lucide-react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { motion, AnimatePresence } from "framer-motion";

export const OnboardingBanner = () => {
  const navigate = useNavigate();
  const {
    currentStep,
    profileCompleted,
    verificationStarted,
    verificationApproved,
    groupChatJoined,
    shouldShow,
    dismissOnboarding,
  } = useOnboarding();

  if (!shouldShow) return null;

  const steps = [
    {
      id: 1,
      title: "Complete Profile",
      description: "Add your name, phone, and location",
      icon: User,
      completed: profileCompleted,
      action: () => navigate("/profile"),
      actionLabel: "Go to Profile",
    },
    {
      id: 2,
      title: "Verify Your Property",
      description: "Submit documents to verify ownership",
      icon: FileCheck,
      completed: verificationApproved,
      inProgress: verificationStarted && !verificationApproved,
      action: () => navigate("/community"),
      actionLabel: verificationStarted ? "Check Status" : "Start Verification",
    },
    {
      id: 3,
      title: "Join Group Chats",
      description: "Connect with verified residents",
      icon: MessageSquare,
      completed: groupChatJoined,
      disabled: !verificationApproved,
      action: () => navigate("/group-chats"),
      actionLabel: "Browse Groups",
    },
  ];

  const completedSteps = [profileCompleted, verificationApproved, groupChatJoined].filter(Boolean).length;
  const progress = (completedSteps / 3) * 100;

  const getCurrentStep = () => {
    if (!profileCompleted) return steps[0];
    if (!verificationApproved) return steps[1];
    if (!groupChatJoined) return steps[2];
    return null;
  };

  const currentStepData = getCurrentStep();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-6"
      >
        <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 border-primary/20 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-semibold">Welcome! Let's get you started</span>
                  <span className="text-sm text-muted-foreground">
                    ({completedSteps}/3 complete)
                  </span>
                </div>

                <Progress value={progress} className="h-2 mb-4" />

                {/* Step Indicators */}
                <div className="flex gap-6 mb-4">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`flex items-center gap-2 ${
                        step.completed
                          ? "text-primary"
                          : step.inProgress
                          ? "text-yellow-600"
                          : step.disabled
                          ? "text-muted-foreground/50"
                          : "text-muted-foreground"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          step.completed
                            ? "bg-primary text-primary-foreground"
                            : step.inProgress
                            ? "bg-yellow-100 border-2 border-yellow-500"
                            : step.disabled
                            ? "bg-muted border-2 border-muted-foreground/20"
                            : "bg-muted border-2 border-primary/30"
                        }`}
                      >
                        {step.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <step.icon className="h-4 w-4" />
                        )}
                      </div>
                      <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
                    </div>
                  ))}
                </div>

                {/* Current Step Action */}
                {currentStepData && (
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{currentStepData.title}</p>
                      <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
                    </div>
                    <Button
                      onClick={currentStepData.action}
                      disabled={currentStepData.disabled}
                      className="gap-2"
                    >
                      {currentStepData.actionLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={dismissOnboarding}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
