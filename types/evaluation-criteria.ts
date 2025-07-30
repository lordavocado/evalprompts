export interface EvaluationCriteria {
  id: string
  name: string
  description: string
  icon: string
  criteria: {
    [key: string]: {
      name: string
      description: string
      weight: number
    }
  }
  evaluationPrompt: string
  suggestionFocus: string[]
}

export const EVALUATION_CRITERIA_SETS: EvaluationCriteria[] = [
  {
    id: "artistic",
    name: "Artistic & Creative",
    description: "Focus on creativity, originality, and artistic merit",
    icon: "🎨",
    criteria: {
      creativity: {
        name: "Creativity",
        description: "Originality and innovative visual concepts",
        weight: 0.35,
      },
      composition: {
        name: "Composition",
        description: "Visual balance, rule of thirds, focal points",
        weight: 0.25,
      },
      aesthetic: {
        name: "Aesthetic Appeal",
        description: "Overall visual beauty and artistic impact",
        weight: 0.25,
      },
      technique: {
        name: "Artistic Technique",
        description: "Style execution and artistic skill representation",
        weight: 0.15,
      },
    },
    evaluationPrompt: `Evaluate this artistic prompt focusing on creative and artistic aspects:
    1. Creativity (1-10): How original and innovative is the concept?
    2. Composition (1-10): How well does it guide visual balance and focal points?
    3. Aesthetic Appeal (1-10): How visually beautiful and impactful is the result?
    4. Artistic Technique (1-10): How well does it represent artistic style and technique?`,
    suggestionFocus: [
      "Add specific artistic styles or movements",
      "Include composition techniques (rule of thirds, golden ratio)",
      "Specify color palettes and mood",
      "Add texture and medium details",
      "Include lighting and atmosphere descriptions",
    ],
  },
  {
    id: "commercial",
    name: "Commercial & Marketing",
    description: "Optimized for brand alignment and commercial appeal",
    icon: "💼",
    criteria: {
      brandAlignment: {
        name: "Brand Alignment",
        description: "Consistency with brand identity and values",
        weight: 0.3,
      },
      marketAppeal: {
        name: "Market Appeal",
        description: "Attractiveness to target audience",
        weight: 0.3,
      },
      messageClarity: {
        name: "Message Clarity",
        description: "Clear communication of intended message",
        weight: 0.25,
      },
      professionalism: {
        name: "Professionalism",
        description: "Professional quality and polish",
        weight: 0.15,
      },
    },
    evaluationPrompt: `Evaluate this commercial prompt focusing on marketing effectiveness:
    1. Brand Alignment (1-10): How well does it align with brand identity?
    2. Market Appeal (1-10): How attractive is it to the target audience?
    3. Message Clarity (1-10): How clearly does it communicate the intended message?
    4. Professionalism (1-10): How professional and polished does it appear?`,
    suggestionFocus: [
      "Define target audience demographics",
      "Specify brand colors and visual identity",
      "Add call-to-action elements",
      "Include product placement guidance",
      "Specify professional photography style",
    ],
  },
  {
    id: "photorealistic",
    name: "Photorealistic & Technical",
    description: "Focus on realism, accuracy, and technical quality",
    icon: "📸",
    criteria: {
      realism: {
        name: "Photorealism",
        description: "How realistic and lifelike the image appears",
        weight: 0.4,
      },
      technicalQuality: {
        name: "Technical Quality",
        description: "Resolution, sharpness, and technical execution",
        weight: 0.25,
      },
      accuracy: {
        name: "Accuracy",
        description: "Factual and proportional correctness",
        weight: 0.2,
      },
      lighting: {
        name: "Lighting Quality",
        description: "Realistic lighting and shadows",
        weight: 0.15,
      },
    },
    evaluationPrompt: `Evaluate this photorealistic prompt focusing on technical realism:
    1. Photorealism (1-10): How realistic and lifelike is the result?
    2. Technical Quality (1-10): How sharp, clear, and technically excellent is it?
    3. Accuracy (1-10): How factually and proportionally correct is it?
    4. Lighting Quality (1-10): How realistic and well-executed is the lighting?`,
    suggestionFocus: [
      "Add camera specifications (lens, aperture, ISO)",
      "Specify lighting conditions and sources",
      "Include material and texture details",
      "Add environmental context",
      "Specify photographic techniques",
    ],
  },
  {
    id: "conceptual",
    name: "Conceptual & Abstract",
    description: "Emphasis on concept communication and symbolism",
    icon: "💭",
    criteria: {
      conceptClarity: {
        name: "Concept Clarity",
        description: "How clearly the concept is communicated",
        weight: 0.35,
      },
      symbolism: {
        name: "Symbolism",
        description: "Effective use of symbols and metaphors",
        weight: 0.25,
      },
      emotionalImpact: {
        name: "Emotional Impact",
        description: "Ability to evoke emotions and feelings",
        weight: 0.25,
      },
      originality: {
        name: "Originality",
        description: "Unique and innovative conceptual approach",
        weight: 0.15,
      },
    },
    evaluationPrompt: `Evaluate this conceptual prompt focusing on abstract communication:
    1. Concept Clarity (1-10): How clearly is the concept communicated?
    2. Symbolism (1-10): How effectively are symbols and metaphors used?
    3. Emotional Impact (1-10): How well does it evoke emotions?
    4. Originality (1-10): How unique and innovative is the conceptual approach?`,
    suggestionFocus: [
      "Add symbolic elements and metaphors",
      "Specify emotional tone and mood",
      "Include abstract visual elements",
      "Add conceptual themes and meanings",
      "Specify interpretive elements",
    ],
  },
  {
    id: "character",
    name: "Character & Portrait",
    description: "Specialized for character design and portraits",
    icon: "👤",
    criteria: {
      characterDesign: {
        name: "Character Design",
        description: "Overall character concept and design quality",
        weight: 0.3,
      },
      facialFeatures: {
        name: "Facial Features",
        description: "Accuracy and appeal of facial characteristics",
        weight: 0.25,
      },
      expression: {
        name: "Expression",
        description: "Emotional expression and personality",
        weight: 0.25,
      },
      consistency: {
        name: "Consistency",
        description: "Consistent character traits and proportions",
        weight: 0.2,
      },
    },
    evaluationPrompt: `Evaluate this character prompt focusing on character design:
    1. Character Design (1-10): How well-designed and appealing is the character?
    2. Facial Features (1-10): How accurate and appealing are the facial features?
    3. Expression (1-10): How well does it convey emotion and personality?
    4. Consistency (1-10): How consistent are the character traits?`,
    suggestionFocus: [
      "Add specific facial feature descriptions",
      "Include personality traits and expressions",
      "Specify age, ethnicity, and physical characteristics",
      "Add clothing and accessory details",
      "Include pose and gesture descriptions",
    ],
  },
  {
    id: "environmental",
    name: "Environmental & Architectural",
    description: "Focus on spaces, architecture, and environments",
    icon: "🏗️",
    criteria: {
      spatialAccuracy: {
        name: "Spatial Accuracy",
        description: "Correct perspective and spatial relationships",
        weight: 0.3,
      },
      architecturalDetail: {
        name: "Architectural Detail",
        description: "Quality and accuracy of architectural elements",
        weight: 0.25,
      },
      atmosphere: {
        name: "Atmosphere",
        description: "Environmental mood and ambiance",
        weight: 0.25,
      },
      scale: {
        name: "Scale & Proportion",
        description: "Correct scale relationships between elements",
        weight: 0.2,
      },
    },
    evaluationPrompt: `Evaluate this environmental prompt focusing on spatial and architectural aspects:
    1. Spatial Accuracy (1-10): How accurate is the perspective and spatial layout?
    2. Architectural Detail (1-10): How detailed and accurate are architectural elements?
    3. Atmosphere (1-10): How well does it create environmental mood?
    4. Scale & Proportion (1-10): How correct are the scale relationships?`,
    suggestionFocus: [
      "Add architectural style specifications",
      "Include lighting and time of day",
      "Specify materials and textures",
      "Add environmental context and surroundings",
      "Include perspective and viewpoint details",
    ],
  },
]
