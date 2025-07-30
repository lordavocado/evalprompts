"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EVALUATION_CRITERIA_SETS, type EvaluationCriteria } from "@/types/evaluation-criteria"
import { CustomCriteriaBuilder } from "./custom-criteria-builder"
import { useCustomCriteria } from "@/hooks/use-custom-criteria"
import { Check, Trash2 } from "lucide-react"

interface EnhancedCriteriaSelectorProps {
  selectedCriteria: EvaluationCriteria
  onSelect: (criteria: EvaluationCriteria) => void
}

export function EnhancedCriteriaSelector({ selectedCriteria, onSelect }: EnhancedCriteriaSelectorProps) {
  const { customCriteria, addCustomCriteria, removeCustomCriteria } = useCustomCriteria()

  const allCriteria = [...EVALUATION_CRITERIA_SETS, ...customCriteria]

  const handleDeleteCustomCriteria = (id: string, event: React.MouseEvent) => {
    event.stopPropagation()
    if (confirm("Are you sure you want to delete this custom criteria set?")) {
      removeCustomCriteria(id)
      // If the deleted criteria was selected, switch to the first default criteria
      if (selectedCriteria.id === id) {
        onSelect(EVALUATION_CRITERIA_SETS[0])
      }
    }
  }

  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Evaluation Criteria</h2>
        <p className="text-gray-600">Select a preset framework or create your own custom evaluation criteria</p>
      </div>

      {/* Custom Criteria Builder */}
      <div className="mb-6">
        <CustomCriteriaBuilder onSave={addCustomCriteria} />
      </div>

      {/* Criteria Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allCriteria.map((criteria) => {
          const isCustom = !EVALUATION_CRITERIA_SETS.find((c) => c.id === criteria.id)
          const isSelected = selectedCriteria.id === criteria.id

          return (
            <Card
              key={criteria.id}
              className={`cursor-pointer transition-all hover:shadow-lg relative ${
                isSelected ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
              }`}
              onClick={() => onSelect(criteria)}
            >
              {isCustom && (
                <div className="absolute top-2 right-2 flex gap-1">
                  <CustomCriteriaBuilder existingCriteria={criteria} onSave={addCustomCriteria} isEditing={true} />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => handleDeleteCustomCriteria(criteria.id, e)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}

              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg pr-16">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{criteria.icon}</span>
                    {criteria.name}
                    {isCustom && (
                      <Badge variant="secondary" className="text-xs">
                        Custom
                      </Badge>
                    )}
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-blue-600" />}
                </CardTitle>
                <CardDescription className="text-sm">{criteria.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {Object.entries(criteria.criteria).map(([key, criterion]) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 truncate">{criterion.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(criterion.weight * 100)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Selected Criteria Info */}
      {selectedCriteria && (
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedCriteria.icon}</span>
              Selected: {selectedCriteria.name}
              {!EVALUATION_CRITERIA_SETS.find((c) => c.id === selectedCriteria.id) && (
                <Badge variant="secondary">Custom</Badge>
              )}
            </CardTitle>
            <CardDescription>
              This evaluation will focus on:{" "}
              {Object.values(selectedCriteria.criteria)
                .map((c) => c.name)
                .join(", ")}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {customCriteria.length > 0 && (
        <div className="mt-4 text-center">
          <Badge variant="outline" className="text-sm">
            {customCriteria.length} Custom Criteria Set{customCriteria.length !== 1 ? "s" : ""} Created
          </Badge>
        </div>
      )}
    </div>
  )
}
