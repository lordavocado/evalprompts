"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  History, 
  Undo2, 
  Redo2, 
  Clock, 
  Sparkles, 
  Image, 
  Target, 
  Edit3,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from "lucide-react"

interface HistoryEntry {
  id: string
  timestamp: number
  prompts: any[]
  action: string
  description: string
  isCurrent: boolean
  canNavigateTo: boolean
}

interface PromptHistoryPanelProps {
  history: HistoryEntry[]
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onNavigateToEntry: (entryId: string) => void
  className?: string
}

const ActionIcons = {
  initialize: Clock,
  generate: Image,
  evaluate: Target,
  improve: Sparkles,
  custom: Edit3,
  manual: Edit3,
} as const

const ActionColors = {
  initialize: "bg-mono-100 text-mono-700 border-mono-300",
  generate: "bg-mono-200 text-mono-800 border-mono-400",
  evaluate: "bg-mono-300 text-mono-900 border-mono-500",
  improve: "bg-mono-800 text-white border-mono-900",
  custom: "bg-mono-600 text-white border-mono-700",
  manual: "bg-mono-400 text-mono-900 border-mono-500",
} as const

function formatTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)

  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  
  return new Date(timestamp).toLocaleDateString()
}

export function PromptHistoryPanel({
  history,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onNavigateToEntry,
  className = ""
}: PromptHistoryPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (history.length === 0) {
    return null
  }

  const currentEntry = history.find(entry => entry.isCurrent)

  return (
    <Card className={`border-mono-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-mono-900">
            <History className="w-5 h-5" />
            Prompt History
            <Badge variant="outline" className="border-mono-300 text-mono-600">
              {history.length} versions
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className="border-mono-300 text-mono-700 hover:bg-mono-50 disabled:opacity-50"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className="border-mono-300 text-mono-700 hover:bg-mono-50 disabled:opacity-50"
            >
              <Redo2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-mono-500 hover:text-mono-700"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        {currentEntry && (
          <div className="text-sm text-mono-600">
            Current: {currentEntry.description} • {formatTime(currentEntry.timestamp)}
          </div>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {history.slice().reverse().map((entry, reverseIndex) => {
                const actualIndex = history.length - 1 - reverseIndex
                const Icon = ActionIcons[entry.action as keyof typeof ActionIcons] || Edit3
                const colorClass = ActionColors[entry.action as keyof typeof ActionColors] || ActionColors.manual

                return (
                  <div
                    key={entry.id}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      entry.isCurrent 
                        ? "bg-mono-100 border-mono-300 ring-1 ring-mono-400" 
                        : "bg-mono-50 border-mono-200 hover:bg-mono-100 hover:border-mono-300"
                    }`}
                    onClick={() => !entry.isCurrent && onNavigateToEntry(entry.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${
                            entry.isCurrent ? "text-mono-900" : "text-mono-900"
                          }`}>
                            {entry.description}
                          </span>
                          {entry.isCurrent && (
                            <Badge 
                              variant="outline" 
                              className="text-xs bg-mono-200 text-mono-800 border-mono-400"
                            >
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-mono-500">
                            {formatTime(entry.timestamp)}
                          </span>
                          <span className="text-xs text-mono-500">
                            {entry.prompts.length} prompt{entry.prompts.length !== 1 ? 's' : ''}
                          </span>
                          <Badge 
                            variant="outline" 
                            className="text-xs border-mono-300 text-mono-600"
                          >
                            #{actualIndex + 1}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
          
          <div className="mt-4 p-3 bg-mono-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-mono-700">
              <RotateCcw className="w-4 h-4" />
              <span>
                <strong>Pro Tip:</strong> Click any version to jump back to it, or use the undo/redo buttons
              </span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Compact version for mobile or sidebar
export function CompactPromptHistory({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  currentEntry,
  className = ""
}: {
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  currentEntry?: HistoryEntry | null
  className?: string
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        className="border-mono-300 text-mono-700 hover:bg-mono-50 disabled:opacity-50"
        title="Undo last change"
      >
        <Undo2 className="w-4 h-4" />
      </Button>
      
      {currentEntry && (
        <div className="px-2 py-1 bg-mono-100 rounded text-xs text-mono-600 max-w-32 truncate">
          {currentEntry.description}
        </div>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={onRedo}
        disabled={!canRedo}
        className="border-mono-300 text-mono-700 hover:bg-mono-50 disabled:opacity-50"
        title="Redo last undone change"
      >
        <Redo2 className="w-4 h-4" />
      </Button>
    </div>
  )
}