import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface ReportPropertyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  propertyTitle: string;
}

const reportReasons = [
  { value: "not_owner", label: "This property doesn't belong to the uploader" },
  { value: "fake_listing", label: "This is a fake/fraudulent listing" },
  { value: "misleading", label: "Misleading information or photos" },
  { value: "already_sold", label: "Property already sold/rented" },
  { value: "other", label: "Other reason" },
];

const ReportPropertyModal = ({ open, onOpenChange, propertyId, propertyTitle }: ReportPropertyModalProps) => {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to report a property", variant: "destructive" });
      return;
    }
    if (!reason) {
      toast({ title: "Select a reason", description: "Please select a reason for reporting", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("property_reports").insert({
        property_id: propertyId,
        reporter_id: user.id,
        reason,
        description,
      });

      if (error) throw error;

      toast({ title: "Report Submitted", description: "Thank you. The property uploader and our admin team have been notified." });
      onOpenChange(false);
      setReason("");
      setDescription("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to submit report", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Report Property
          </DialogTitle>
          <DialogDescription>
            Report "{propertyTitle}" if it doesn't belong to the uploader or contains false information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Reason for reporting *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {reportReasons.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Additional details</Label>
            <Textarea
              placeholder="Provide any additional details to help us investigate..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
            <p>Both the property uploader and our admin team will be notified of this report for review.</p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportPropertyModal;
