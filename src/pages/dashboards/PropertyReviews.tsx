import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

const PropertyReviews = () => {
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-[#1f1a54]">Property Reviews</h1>
        
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#5cb85c]" />
              Reviews For My Properties
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center text-gray-500 py-12">
            You don't have any property reviews yet.
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PropertyReviews;
