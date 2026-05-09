import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";

const Favorites = () => {
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-[#1f1a54]">Favorites</h1>
        
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Heart className="h-5 w-5 text-[#5cb85c]" />
              My Favorite Properties
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center text-gray-500 py-12">
            You haven't added any properties to your favorites yet.
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Favorites;
