"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, Save, RotateCcw, AlertCircle, Check, Edit3, Eye } from "lucide-react"
import type { EvaluationCriteria } from "@/types/evaluation-criteria"

interface InlineCriteriaEditorProps {
  criteria: EvaluationCriteria
  onUpdate: (criteria: EvaluationCriteria) => void
}

export function InlineCriteriaEditor({ criteria, onUpdate }: InlineCriteriaEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedCriteria, setEditedCriteria] = useState(criteria)

  const criteriaEntries = Object.entries(editedCriteria.criteria)
  const totalWeight = criteriaEntries.reduce((sum, [, criterion]) => sum + criterion.weight, 0)
  const isValidWeight = Math.abs(totalWeight - 1.0) < 0.01
  const autoNormalized = !isValidWeight

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
    let normalized = editedCriteria
    if (!isValidWeight) {
      // Auto-normalize weights to sum to 1.0
      const sum = Object.values(editedCriteria.criteria).reduce((acc, c) => acc + c.weight, 0)
      if (sum > 0) {
        const normalizedCriteria = Object.fromEntries(
          Object.entries(editedCriteria.criteria).map(([key, c]) => [key, { ...c, weight: c.weight / sum }])
        )
        normalized = { ...editedCriteria, criteria: normalizedCriteria }
      }
    }
    onUpdate(normalized)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedCriteria(criteria)
    setIsEditing(false)
  }

  const handleEdit = () => {
    setEditedCriteria(criteria)
    setIsEditing(true)
  }

  return (
    <Card className="mb-8 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{criteria.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                {criteria.name}
                <Badge variant="secondary">AI Generated</Badge>
              </div>
              <p className="text-sm font-normal text-gray-600 mt-1">{criteria.description}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={isEditing ? handleCancel : handleEdit}
            className="flex items-center gap-2 bg-white"
          >
            {isEditing ? (
              <>
                <Eye className="w-4 h-4" />
                View Mode
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                Customize
              </>
            )}
          </Button>
        </CardTitle>
        {isEditing && (
          <CardDescription className="text-blue-800 bg-blue-100 p-3 rounded-lg">
            <strong>💡 Editing Tips:</strong> Be specific about what makes a good result for each criterion. The AI will
            use these exact descriptions to evaluate your images. Clear, detailed descriptions = better evaluations!
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          // View Mode
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(criteria.criteria).map(([key, criterion]) => (
              <div key={key} className="p-4 bg-white rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{criterion.name}</h4>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    {Math.round(criterion.weight * 100)}%
                  </Badge>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{criterion.description}</p>
              </div>
            ))}
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Weight Distribution</span>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={isValidWeight ? "default" : "destructive"}>
                  {isValidWeight ? <Check className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                  {Math.round(totalWeight * 100)}%
                </Badge>
                <Button variant="outline" size="sm" onClick={redistributeWeights}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Equal Weights
                </Button>
              </div>
            </div>

            {criteriaEntries.map(([key, criterion], index) => (
              <Card key={key} className="p-4 bg-white border-2 border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-lg text-gray-900">Criterion {index + 1}</h4>
                    <Badge variant="outline" className="text-sm">
                      {Math.round(criterion.weight * 100)}% weight
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Criterion Name</Label>
                      <Input
                        value={criterion.name}
                        onChange={(e) => updateCriterion(key, "name", e.target.value)}
                        placeholder="e.g., Visual Impact"
                        className="font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Importance Weight: {Math.round(criterion.weight * 100)}%
                      </Label>
                      <Slider
                        value={[criterion.weight * 100]}
                        onValueChange={([value]) => updateCriterion(key, "weight", value)}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Success Definition <span className="text-xs text-gray-500">(What makes a 10/10 score?)</span>
                    </Label>
                    <Textarea
                      value={criterion.description}
                      onChange={(e) => updateCriterion(key, "description", e.target.value)}
                      placeholder="Describe exactly what you want to see in a perfect image for this criterion. Be specific about colors, composition, style, mood, technical quality, etc."
                      rows={3}
                      className="text-sm"
                    />
                    <p className="text-xs text-blue-600">
                      💡 <strong>Tip:</strong> The more specific you are, the better the AI can evaluate your images.
                      Instead of "good quality," write "sharp details, vibrant colors, professional lighting."
                    </p>
                  </div>
                </div>
              </Card>
            ))}

            {!isValidWeight && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Weight Error:</strong> Total weight is {Math.round(totalWeight * 100)}%. Please adjust the
                  weights to total exactly 100%.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleCancel}>
                Cancel Changes
              </Button>
              <Button onClick={handleSave} disabled={!isValidWeight} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Save & Apply Changes
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
