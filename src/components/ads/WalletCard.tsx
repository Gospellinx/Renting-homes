import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

interface WalletCardProps {
  balance?: number;
  onTopUp?: () => void;
}

export default function WalletCard({ balance = 0, onTopUp }: WalletCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">${balance.toFixed(2)}</div>
        <button className="mt-4 btn-primary">Top Up</button>
      </CardContent>
    </Card>
  );
}

