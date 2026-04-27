import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { WalletTransaction } from "@/hooks/useWallet";
import { ArrowUpRight, Clock3, Loader2, Wallet as WalletIcon } from "lucide-react";

interface WalletCardProps {
  balance?: number;
  loading?: boolean;
  topUpPending?: boolean;
  transactions?: WalletTransaction[];
  transactionsLoading?: boolean;
  onTopUp?: (amount: number) => Promise<void> | void;
}

const quickAmounts = [5000, 10000, 25000];

const formatCurrency = (amount: number) => `NGN ${amount.toLocaleString()}`;

export default function WalletCard({
  balance = 0,
  loading = false,
  topUpPending = false,
  transactions = [],
  transactionsLoading = false,
  onTopUp,
}: WalletCardProps) {
  const [amount, setAmount] = useState("10000");

  const parsedAmount = Number(amount);
  const canTopUp = Number.isFinite(parsedAmount) && parsedAmount > 0 && !!onTopUp;

  const handleTopUp = async () => {
    if (!canTopUp || !onTopUp) {
      return;
    }

    await onTopUp(parsedAmount);
  };

  return (
    <Card className="border-[#d7daf0] bg-white/90 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#1f1a54]">
          <WalletIcon className="h-5 w-5 text-primary" />
          Wallet Balance
        </CardTitle>
        <CardDescription>Use your wallet to keep ad funding ready.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-2xl bg-[linear-gradient(135deg,#26225f_0%,#4b3fa4_100%)] p-5 text-white">
          <p className="text-sm text-white/70">Available balance</p>
          {loading ? (
            <div className="mt-3 flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading wallet...</span>
            </div>
          ) : (
            <p className="mt-3 text-3xl font-bold">{formatCurrency(balance)}</p>
          )}
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Top-up amount</label>
            <Input
              type="number"
              min="100"
              step="100"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="10000"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {quickAmounts.map((quickAmount) => (
              <Button
                key={quickAmount}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(String(quickAmount))}
              >
                {formatCurrency(quickAmount)}
              </Button>
            ))}
          </div>

          <Button
            type="button"
            className="w-full gap-2"
            onClick={handleTopUp}
            disabled={!canTopUp || topUpPending}
          >
            {topUpPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUpRight className="h-4 w-4" />
            )}
            Top Up Wallet
          </Button>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-[#1f1a54]">Recent transactions</h4>
            <Badge variant="outline">{transactions.length}</Badge>
          </div>

          {transactionsLoading ? (
            <div className="flex items-center gap-2 rounded-lg border p-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading transactions...
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="rounded-xl border border-[#e3e6f5] p-3 text-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium capitalize">{transaction.type}</p>
                      <p className="text-muted-foreground">
                        {transaction.description || "Ad wallet transaction"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {transaction.type === "credit" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <Badge variant="outline" className="mt-1 capitalize">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                No wallet transactions yet.
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
