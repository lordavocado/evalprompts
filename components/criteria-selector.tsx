"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EVALUATION_CRITERIA_SETS, type EvaluationCriteria } from "@/types/evaluation-criteria"
import { Check } from "lucide-react"

interface CriteriaSelectorProps {
  selectedCriteria: EvaluationCriteria
  onSelect: (criteria: EvaluationCriteria) => void
}

export function CriteriaSelector({ selectedCriteria, onSelect }: CriteriaSelectorProps) {
  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Evaluation Criteria</h2>
        <p className="text-gray-600">Select the evaluation framework that best matches your use case</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EVALUATION_CRITERIA_SETS.map((criteria) => (
          <Card
            key={criteria.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedCriteria.id === criteria.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
            }`}
            onClick={() => onSelect(criteria)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{criteria.icon}</span>
                  {criteria.name}
                </div>
                {selectedCriteria.id === criteria.id && <Check className="w-5 h-5 text-blue-600" />}
              </CardTitle>
              <CardDescription className="text-sm">{criteria.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {Object.entries(criteria.criteria).map(([key, criterion]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{criterion.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(criterion.weight * 100)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCriteria && (
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedCriteria.icon}</span>
              Selected: {selectedCriteria.name}
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
    </div>
  )
}
