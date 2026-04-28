import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { WalletTransaction } from "@/hooks/useWallet";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock3,
  CreditCard,
  Loader2,
  ShieldCheck,
  Wallet as WalletIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WalletCardProps {
  balance?: number;
  loading?: boolean;
  topUpPending?: boolean;
  transactions?: WalletTransaction[];
  transactionsLoading?: boolean;
  onTopUp?: (amount: number) => Promise<void> | void;
}

const quickAmounts = [5000, 10000, 25000, 50000];

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

  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);

  const handleTopUp = async () => {
    if (!canTopUp || !onTopUp) {
      return;
    }

    await onTopUp(parsedAmount);
  };

  return (
    <Card className="overflow-hidden border-[#dbe0f4] bg-white/95 shadow-[0_18px_45px_rgba(31,26,84,0.08)]">
      <div className="border-b border-[#dbe0f4] bg-[linear-gradient(135deg,#1f1a54_0%,#2d2873_55%,#6b60c8_100%)] text-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85">
                <WalletIcon className="h-3.5 w-3.5" />
                Ad wallet
              </div>
              <CardTitle className="mt-3 text-xl text-white">Campaign Funding</CardTitle>
              <CardDescription className="mt-1 text-white/72">
                Keep spend ready so campaigns can move from draft to live faster.
              </CardDescription>
            </div>
            <div className="rounded-3xl bg-white/10 p-3 backdrop-blur">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="rounded-[28px] border border-white/10 bg-black/10 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-white/65">Available balance</p>
            {loading ? (
              <div className="mt-3 flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm text-white/80">Loading wallet...</span>
              </div>
            ) : (
              <p className="mt-3 text-3xl font-bold">{formatCurrency(balance)}</p>
            )}
            <div className="mt-4 flex items-center gap-2 text-sm text-white/74">
              <ShieldCheck className="h-4 w-4" />
              Wallet funds are used to keep ad payments organized in one place.
            </div>
          </div>
        </CardContent>
      </div>

      <CardContent className="space-y-6 p-5">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-[#1f1a54]">Top up wallet</h4>
            <p className="text-sm text-[#6e769b]">
              Choose a quick amount or enter a custom value before opening checkout.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1f1a54]">Top-up amount</label>
            <Input
              type="number"
              min="100"
              step="100"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="10000"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {quickAmounts.map((quickAmount) => (
              <Button
                key={quickAmount}
                type="button"
                variant="outline"
                size="sm"
                className="justify-center rounded-full"
                onClick={() => setAmount(String(quickAmount))}
              >
                {formatCurrency(quickAmount)}
              </Button>
            ))}
          </div>

          <Button
            type="button"
            className="w-full gap-2 rounded-full"
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-[#1f1a54]">Recent transactions</h4>
              <p className="text-sm text-[#6e769b]">A quick look at your latest wallet movement.</p>
            </div>
            <Badge variant="outline" className="rounded-full">
              {transactions.length}
            </Badge>
          </div>

          {transactionsLoading ? (
            <div className="flex items-center gap-2 rounded-2xl border border-[#e3e7f7] p-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading transactions...
            </div>
          ) : recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => {
                const isCredit = transaction.type === "credit";

                return (
                  <div
                    key={transaction.id}
                    className="rounded-[22px] border border-[#e3e7f7] bg-[#fbfbfe] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "mt-0.5 rounded-2xl p-2",
                            isCredit ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          )}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium capitalize text-[#1f1a54]">{transaction.type}</p>
                          <p className="text-sm text-[#6f7699]">
                            {transaction.description || "Ad wallet transaction"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#1f1a54]">
                          {isCredit ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <Badge variant="outline" className="mt-1 rounded-full capitalize">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-[#dbe0f4] bg-[#fafbff] p-5 text-sm text-[#6e769b]">
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
