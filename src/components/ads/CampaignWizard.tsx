"use client"

import { Button } from "@/components/ui/button";
// import { Steps } from "@/components/ui/steps";

interface CampaignWizardProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function CampaignWizard({ onComplete, onCancel }: CampaignWizardProps) {
  return (
    <div>
      <h2>Create Ad Campaign</h2>
      <p>Campaign wizard placeholder</p>
      <Button>Create Campaign</Button>
      {onComplete && <Button onClick={onComplete} variant="outline" className="ml-2">Done</Button>}
      {onCancel && <Button onClick={onCancel} variant="ghost" className="ml-2">Cancel</Button>}
    </div>
  );
}

