import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Users, FileCheck, MessageSquare, TrendingUp, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import { AnalyticsData } from "@/hooks/useAdminAnalytics";

interface AnalyticsDashboardProps {
  analytics: AnalyticsData;
}

const COLORS = {
  pending: "hsl(45 93% 47%)",
  approved: "hsl(142 76% 36%)",
  rejected: "hsl(0 84% 60%)",
  flagged: "hsl(25 95% 53%)",
};

const chartConfig = {
  pending: { label: "Pending", color: COLORS.pending },
  approved: { label: "Approved", color: COLORS.approved },
  rejected: { label: "Rejected", color: COLORS.rejected },
};

export const AnalyticsDashboard = ({ analytics }: AnalyticsDashboardProps) => {
  const { verificationStats, dailyVerifications, groupChatStats, userStats } = analytics;

  const pieData = [
    { name: "Pending", value: verificationStats.pending, color: COLORS.pending },
    { name: "Approved", value: verificationStats.approved, color: COLORS.approved },
    { name: "Rejected", value: verificationStats.rejected, color: COLORS.rejected },
  ].filter((d) => d.value > 0);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {userStats.verifiedUsers} verified • {userStats.adminUsers} admins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verification Requests</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verificationStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {verificationStats.pending} pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Group Chats</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupChatStats.totalGroups}</div>
            <p className="text-xs text-muted-foreground">
              {groupChatStats.totalMembers} members • {groupChatStats.totalMessages} messages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Requests</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{verificationStats.flagged}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Verification Trends
            </CardTitle>
            <CardDescription>Daily verification requests over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={dailyVerifications}>
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="pending" stackId="a" fill={COLORS.pending} radius={[0, 0, 0, 0]} />
                <Bar dataKey="approved" stackId="a" fill={COLORS.approved} radius={[0, 0, 0, 0]} />
                <Bar dataKey="rejected" stackId="a" fill={COLORS.rejected} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Verification Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Request Status Distribution</CardTitle>
            <CardDescription>Breakdown of all verification requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground">No data available</p>
              )}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.pending }} />
                <span className="text-sm">Pending ({verificationStats.pending})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.approved }} />
                <span className="text-sm">Approved ({verificationStats.approved})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.rejected }} />
                <span className="text-sm">Rejected ({verificationStats.rejected})</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-200">
                <Clock className="h-6 w-6 text-yellow-700" />
              </div>
              <div>
                <p className="text-sm text-yellow-700 font-medium">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-800">{verificationStats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-200">
                <CheckCircle className="h-6 w-6 text-orange-700" />
              </div>
              <div>
                <p className="text-sm text-orange-700 font-medium">Approved</p>
                <p className="text-3xl font-bold text-orange-800">{verificationStats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-red-200">
                <XCircle className="h-6 w-6 text-red-700" />
              </div>
              <div>
                <p className="text-sm text-red-700 font-medium">Rejected</p>
                <p className="text-3xl font-bold text-red-800">{verificationStats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
