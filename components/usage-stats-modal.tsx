"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { BarChart3, DollarSign, Zap, Clock, TrendingUp, RotateCcw } from "lucide-react"

interface UsageStatsModalProps {
  isOpen: boolean
  onClose: () => void
  stats: {
    falRequests: number
    openaiRequests: number
    totalCost: number
    lastUpdated: number
    requestHistory: {
      timestamp: number
      service: "fal" | "openai"
      cost: number
      type: string
    }[]
  }
  onReset: () => void
  recentRequests: {
    timestamp: number
    service: "fal" | "openai"
    cost: number
    type: string
  }[]
}

export function UsageStatsModal({ isOpen, onClose, stats, onReset, recentRequests }: UsageStatsModalProps) {
  const totalRequests = stats.falRequests + stats.openaiRequests
  const avgCostPerRequest = totalRequests > 0 ? stats.totalCost / totalRequests : 0

  const falPercentage = totalRequests > 0 ? (stats.falRequests / totalRequests) * 100 : 0
  const openaiPercentage = totalRequests > 0 ? (stats.openaiRequests / totalRequests) * 100 : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 4,
    }).format(amount)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const getServiceIcon = (service: "fal" | "openai") => {
    return service === "fal" ? "🎨" : "🤖"
  }

  const getServiceColor = (service: "fal" | "openai") => {
    return service === "fal" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Usage Statistics & Costs
          </DialogTitle>
          <DialogDescription>Track your API usage and estimated costs across all services</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Total Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All API calls</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Total Cost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalCost)}</div>
                <p className="text-xs text-muted-foreground">Estimated spend (approximate)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">🎨 Fal AI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.falRequests.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Image generations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">🤖 OpenAI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.openaiRequests.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">AI evaluations</p>
              </CardContent>
            </Card>
          </div>

          {/* Usage Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Service Breakdown
              </CardTitle>
              <CardDescription>Distribution of requests across services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">🎨 Fal AI Images</span>
                  <span>
                    {stats.falRequests} requests ({falPercentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={falPercentage} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">🤖 OpenAI Analysis</span>
                  <span>
                    {stats.openaiRequests} requests ({openaiPercentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={openaiPercentage} className="h-2" />
              </div>

              {totalRequests > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span>Average cost per request:</span>
                    <Badge variant="outline">{formatCurrency(avgCostPerRequest)}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Costs are estimates based on simplified pricing and local tracking. Your provider billing may differ.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          {recentRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Last 10 API requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentRequests.map((request, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getServiceIcon(request.service)}</span>
                        <div>
                          <div className="font-medium text-sm">{request.type}</div>
                          <div className="text-xs text-gray-500">{formatDate(request.timestamp)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getServiceColor(request.service)} variant="secondary">
                          {request.service.toUpperCase()}
                        </Badge>
                        <div className="text-sm font-medium mt-1">{formatCurrency(request.cost)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Last Updated */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-500">Last updated: {formatDate(stats.lastUpdated)}</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onReset} size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Stats
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
