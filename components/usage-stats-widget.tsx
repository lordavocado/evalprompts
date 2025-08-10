"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, DollarSign, Zap } from "lucide-react"

interface UsageStatsWidgetProps {
  stats: {
    falRequests: number
    openaiRequests: number
    totalCost: number
    lastUpdated: number
  }
  onOpenModal: () => void
}

export function UsageStatsWidget({ stats, onOpenModal }: UsageStatsWidgetProps) {
  const totalRequests = stats.falRequests + stats.openaiRequests

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount)
  }

  if (totalRequests === 0) {
    return null
  }

  return (
    <Card className="mb-8 bg-white border-mono-200 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Usage Overview
          </div>
          <Button variant="outline" size="sm" onClick={onOpenModal} className="bg-white border-mono-300 text-mono-700 hover:bg-mono-50">
            View Details
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-mono-100 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-mono-700" />
            </div>
            <div>
              <div className="font-semibold">{totalRequests.toLocaleString()}</div>
              <div className="text-sm text-mono-600">Total Requests</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-mono-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-mono-700" />
            </div>
            <div>
              <div className="font-semibold">{formatCurrency(stats.totalCost)}</div>
              <div className="text-sm text-mono-600">Estimated Cost (approximate)</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs border-mono-300 text-mono-700 bg-white">
                Fal AI {stats.falRequests}
              </Badge>
              <Badge variant="outline" className="text-xs border-mono-300 text-mono-700 bg-white">
                OpenAI {stats.openaiRequests}
              </Badge>
            </div>
            <div className="text-sm text-mono-600">API Requests</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
