"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2, Save, AlertCircle, Check } from "lucide-react"
import type { EvaluationCriteria } from "@/types/evaluation-criteria"

interface CustomCriteriaBuilderProps {
  onSave: (criteria: EvaluationCriteria) => void
  existingCriteria?: EvaluationCriteria
  isEditing?: boolean
}

interface CriterionInput {
  id: string
  name: string
  description: string
  weight: number
}

export function CustomCriteriaBuilder({ onSave, existingCriteria, isEditing = false }: CustomCriteriaBuilderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState(existingCriteria?.name || "")
  const [description, setDescription] = useState(existingCriteria?.description || "")
  const [icon, setIcon] = useState(existingCriteria?.icon || "⚡")
  const [criteria, setCriteria] = useState<CriterionInput[]>(() => {
    if (existingCriteria) {
      return Object.entries(existingCriteria.criteria).map(([key, criterion]) => ({
        id: key,
        name: criterion.name,
        description: criterion.description,
        weight: Math.round(criterion.weight * 100),
      }))
    }
    return [
      { id: "criterion1", name: "", description: "", weight: 25 },
      { id: "criterion2", name: "", description: "", weight: 25 },
      { id: "criterion3", name: "", description: "", weight: 25 },
      { id: "criterion4", name: "", description: "", weight: 25 },
    ]
  })

  const [suggestionFocus, setSuggestionFocus] = useState<string[]>(
    existingCriteria?.suggestionFocus || ["Add specific details", "Improve clarity", "Enhance composition"],
  )
  const [newSuggestion, setNewSuggestion] = useState("")

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0)
  const isValidWeight = totalWeight === 100
  const isValidForm =
    name.trim() && description.trim() && criteria.every((c) => c.name.trim() && c.description.trim()) && isValidWeight

  const addCriterion = () => {
    const newId = `criterion${criteria.length + 1}`
    setCriteria([...criteria, { id: newId, name: "", description: "", weight: 0 }])
  }

  const removeCriterion = (id: string) => {
    if (criteria.length > 2) {
      setCriteria(criteria.filter((c) => c.id !== id))
    }
  }

  const updateCriterion = (id: string, field: keyof CriterionInput, value: string | number) => {
    setCriteria(criteria.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  const addSuggestionFocus = () => {
    if (newSuggestion.trim() && !suggestionFocus.includes(newSuggestion.trim())) {
      setSuggestionFocus([...suggestionFocus, newSuggestion.trim()])
      setNewSuggestion("")
    }
  }

  const removeSuggestionFocus = (index: number) => {
    setSuggestionFocus(suggestionFocus.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    if (!isValidForm) return

    const customCriteria: EvaluationCriteria = {
      id: existingCriteria?.id || `custom_${Date.now()}`,
      name,
      description,
      icon,
      criteria: criteria.reduce(
        (acc, c) => {
          acc[c.id] = {
            name: c.name,
            description: c.description,
            weight: c.weight / 100,
          }
          return acc
        },
        {} as Record<string, { name: string; description: string; weight: number }>,
      ),
      evaluationPrompt: `Evaluate this prompt focusing on custom criteria:
${criteria.map((c, i) => `${i + 1}. ${c.name} (1-10): ${c.description}`).join("\n")}`,
      suggestionFocus,
    }

    onSave(customCriteria)
    setIsOpen(false)

    // Reset form if not editing
    if (!isEditing) {
      setName("")
      setDescription("")
      setIcon("⚡")
      setCriteria([
        { id: "criterion1", name: "", description: "", weight: 25 },
        { id: "criterion2", name: "", description: "", weight: 25 },
        { id: "criterion3", name: "", description: "", weight: 25 },
        { id: "criterion4", name: "", description: "", weight: 25 },
      ])
      setSuggestionFocus(["Add specific details", "Improve clarity", "Enhance composition"])
    }
  }

  const redistributeWeights = () => {
    const equalWeight = Math.floor(100 / criteria.length)
    const remainder = 100 - equalWeight * criteria.length

    setCriteria(
      criteria.map((c, index) => ({
        ...c,
        weight: equalWeight + (index < remainder ? 1 : 0),
      })),
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full bg-transparent">
          <Plus className="w-4 h-4 mr-2" />
          {isEditing ? "Edit Custom Criteria" : "Create Custom Criteria"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Custom Criteria" : "Create Custom Evaluation Criteria"}</DialogTitle>
          <DialogDescription>Design your own evaluation framework with custom criteria and weights</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Gaming & Entertainment"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon (Emoji)</Label>
                  <Input
                    id="icon"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="🎮"
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="flex items-center gap-2 p-2 border rounded">
                    <span className="text-xl">{icon}</span>
                    <span className="font-medium">{name || "Your Criteria"}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this evaluation criteria focuses on..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Criteria */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Evaluation Criteria
                <div className="flex items-center gap-2">
                  <Badge variant={isValidWeight ? "default" : "destructive"}>
                    {isValidWeight ? <Check className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                    {totalWeight}%
                  </Badge>
                  <Button size="sm" variant="outline" onClick={redistributeWeights}>
                    Equal Weights
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>Define the criteria for evaluation. Weights must total 100%.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {criteria.map((criterion, index) => (
                <Card key={criterion.id} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Criterion {index + 1}</h4>
                      {criteria.length > 2 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeCriterion(criterion.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={criterion.name}
                          onChange={(e) => updateCriterion(criterion.id, "name", e.target.value)}
                          placeholder="e.g., Visual Impact"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Weight: {criterion.weight}%</Label>
                        <Slider
                          value={[criterion.weight]}
                          onValueChange={([value]) => updateCriterion(criterion.id, "weight", value)}
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
                        onChange={(e) => updateCriterion(criterion.id, "description", e.target.value)}
                        placeholder="Describe what this criterion evaluates..."
                        rows={2}
                      />
                    </div>
                  </div>
                </Card>
              ))}

              <Button onClick={addCriterion} variant="outline" className="w-full bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                Add Criterion
              </Button>
            </CardContent>
          </Card>

          {/* Suggestion Focus Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Suggestion Focus Areas</CardTitle>
              <CardDescription>
                Define what types of suggestions the AI should focus on for this criteria set
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {suggestionFocus.map((focus, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {focus}
                    <button onClick={() => removeSuggestionFocus(index)} className="ml-1 hover:text-red-600">
                      ×
                    </button>
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newSuggestion}
                  onChange={(e) => setNewSuggestion(e.target.value)}
                  placeholder="Add a suggestion focus area..."
                  onKeyPress={(e) => e.key === "Enter" && addSuggestionFocus()}
                />
                <Button onClick={addSuggestionFocus} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!isValidForm}>
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? "Update Criteria" : "Save Criteria"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
