"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Settings, Save, RotateCcw, AlertCircle, Check } from "lucide-react"
import type { EvaluationCriteria } from "@/types/evaluation-criteria"

interface CriteriaCustomizerProps {
  criteria: EvaluationCriteria
  onUpdate: (criteria: EvaluationCriteria) => void
}

export function CriteriaCustomizer({ criteria, onUpdate }: CriteriaCustomizerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedCriteria, setEditedCriteria] = useState(criteria)

  const criteriaEntries = Object.entries(editedCriteria.criteria)
  const totalWeight = criteriaEntries.reduce((sum, [, criterion]) => sum + criterion.weight, 0)
  const isValidWeight = Math.abs(totalWeight - 1.0) < 0.01

  const updateCriterion = (key: string, field: "name" | "description" | "weight", value: string | number) => {
    setEditedCriteria((prev) => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        [key]: {
          ...prev.criteria[key],
          [field]: field === "weight" ? Number(value) / 100 : value,
        },
      },
    }))
  }

  const redistributeWeights = () => {
    const equalWeight = 1.0 / criteriaEntries.length
    setEditedCriteria((prev) => ({
      ...prev,
      criteria: Object.fromEntries(
        Object.entries(prev.criteria).map(([key, criterion]) => [key, { ...criterion, weight: equalWeight }]),
      ),
    }))
  }

  const handleSave = () => {
    if (isValidWeight) {
      onUpdate(editedCriteria)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditedCriteria(criteria)
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{criteria.icon}</span>
              {criteria.name} - Evaluation Criteria
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Customize
            </Button>
          </CardTitle>
          <CardDescription>{criteria.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(criteria.criteria).map(([key, criterion]) => (
              <div key={key} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{criterion.name}</h4>
                  <Badge variant="outline">{Math.round(criterion.weight * 100)}%</Badge>
                </div>
                <p className="text-sm text-gray-600">{criterion.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-8 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Customize Evaluation Criteria
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isValidWeight ? "default" : "destructive"}>
              {isValidWeight ? <Check className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
              {Math.round(totalWeight * 100)}%
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>
          Customize the evaluation criteria to match your specific needs. Weights must total 100%.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {criteriaEntries.map(([key, criterion], index) => (
          <Card key={key} className="p-4 bg-gray-50">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Criterion {index + 1}</h4>
                <Badge variant="outline">{Math.round(criterion.weight * 100)}%</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={criterion.name}
                    onChange={(e) => updateCriterion(key, "name", e.target.value)}
                    placeholder="e.g., Visual Impact"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Weight: {Math.round(criterion.weight * 100)}%</Label>
                  <Slider
                    value={[criterion.weight * 100]}
                    onValueChange={([value]) => updateCriterion(key, "weight", value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={criterion.description}
                  onChange={(e) => updateCriterion(key, "description", e.target.value)}
                  placeholder="Describe what this criterion evaluates and what success looks like..."
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Be specific about what constitutes success for this criterion. This guides the AI evaluation.
                </p>
              </div>
            </div>
          </Card>
        ))}

        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={redistributeWeights} className="flex items-center gap-2 bg-transparent">
            <RotateCcw className="w-4 h-4" />
            Equal Weights
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!isValidWeight}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {!isValidWeight && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Weight Error</span>
            </div>
            <p className="text-red-700 text-sm mt-1">
              Total weight is {Math.round(totalWeight * 100)}%. Please adjust the weights to total exactly 100%.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
