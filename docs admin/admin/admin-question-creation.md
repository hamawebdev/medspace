# Admin Question Creation Documentation

## Overview

This document provides comprehensive documentation for creating and managing questions through the admin panel. The system supports both single and multiple choice questions with rich media including images and detailed explanations.

## Question Types

The platform supports two main question types:

1. **SINGLE_CHOICE** - Questions with exactly one correct answer
2. **MULTIPLE_CHOICE** - Questions with two or more correct answers

## API Endpoints

### Create Single Question
```
POST /api/v1/admin/questions
```

### Create Multiple Questions in Bulk
```
POST /api/v1/admin/questions/bulk
```

### Update Question
```
PUT /api/v1/admin/questions/:id
```

### Update Question Explanation
```
PUT /api/v1/admin/questions/:id/explanation
```

### Delete Question
```
DELETE /api/v1/admin/questions/:id
```

## Question Creation Fields

### Core Question Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `questionText` | string | Yes | The question text (minimum 5 characters) |
| `explanation` | string | No | Detailed explanation of the correct answer |
| `questionType` | enum | No | SINGLE_CHOICE (default) or MULTIPLE_CHOICE |
| `courseId` | integer | No | ID of the associated course |
| `universityId` | integer | No | ID of the associated university |
| `yearLevel` | enum | No | Academic year level (ONE, TWO, THREE, FOUR, FIVE, SIX, SEVEN) |
| `examYear` | integer | No | Year of the exam (2000-2100) |
| `explanationImages` | array | No | Array of explanation images |
| `answers` | array | Yes | Array of answer options (minimum 2) |



### Answer Fields

Each answer in the `answers` array should have:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `answerText` | string | Yes | The answer option text |
| `isCorrect` | boolean | Yes | Whether this is a correct answer |
| `explanation` | string | No | Explanation for this specific answer |


## Validation Rules



### Answers
- Minimum 2 answers required
- For SINGLE_CHOICE: Exactly 1 correct answer
- For MULTIPLE_CHOICE: At least 2 correct answers


### Exam Year
- Must be between 2000 and 2100

## Example Requests

### Single Choice Question with Images

```json
{
  "questionText": "What is the primary function of the mitochondria?",
  "explanation": "Mitochondria are known as the powerhouses of the cell because they generate most of the cell's supply of adenosine triphosphate (ATP).",
  "questionType": "SINGLE_CHOICE",
  "courseId": 5,
  "universityId": 1,
  "yearLevel": "TWO",
  "examYear": 2023,

  "answers": [
    {
      "answerText": "Protein synthesis",
      "isCorrect": false,
      "explanation": "Protein synthesis occurs in ribosomes, not mitochondria."
    },
    {
      "answerText": "Energy production",
      "isCorrect": true,
      "explanation": "Correct! Mitochondria produce ATP which is the cell's energy currency."
      
    },
    {
      "answerText": "DNA replication",
      "isCorrect": false,
      "explanation": "DNA replication occurs in the nucleus."
    },
    {
      "answerText": "Cell division",
      "isCorrect": false,
      "explanation": "Cell division is controlled by various cellular components, not specifically mitochondria."
    }
  ]
}
```

### Multiple Choice Question

```json
{
  "questionText": "Which of the following are functions of the liver? (Select all that apply)",
  "explanation": "The liver performs over 500 vital functions, including detoxification, protein synthesis, and bile production.",
  "questionType": "MULTIPLE_CHOICE",
  "courseId": 8,
  "universityId": 1,
  "yearLevel": "THREE",
  "examYear": 2023,
  "answers": [
    {
      "answerText": "Detoxification of harmful substances",
      "isCorrect": true,
      "explanation": "The liver detoxifies chemicals and metabolizes drugs."
    },
    {
      "answerText": "Production of bile for digestion",
      "isCorrect": true,
      "explanation": "The liver produces bile which helps digest fats."
    },
    {
      "answerText": "Storage of glycogen",
      "isCorrect": true,
      "explanation": "The liver stores glucose as glycogen for energy."
    },
    {
      "answerText": "Production of insulin",
      "isCorrect": false,
      "explanation": "Insulin is produced by the pancreas, not the liver."
    },
    {
      "answerText": "Filtration of blood",
      "isCorrect": false,
      "explanation": "Blood filtration is primarily performed by the kidneys."
    }
  ]
}
```

### Bulk Question Creation

```json
{
  "metadata": {
    "courseId": 5,
    "universityId": 1,
    "yearLevel": "TWO",
    "examYear": 2023
  },
  "questions": [
    {
      "questionText": "What is the powerhouse of the cell?",
      "explanation": "Mitochondria generate most of the cell's supply of ATP.",
      "questionType": "SINGLE_CHOICE",
      "answers": [
        {
          "answerText": "Nucleus",
          "isCorrect": false
        },
        {
          "answerText": "Mitochondria",
          "isCorrect": true
        },
        {
          "answerText": "Ribosome",
          "isCorrect": false
        },
        {
          "answerText": "Endoplasmic reticulum",
          "isCorrect": false
        }
      ]
    },
    {
      "questionText": "Which organelles are involved in protein synthesis?",
      "explanation": "Both ribosomes and the rough endoplasmic reticulum are involved in protein synthesis.",
      "questionType": "MULTIPLE_CHOICE",
      "answers": [
        {
          "answerText": "Ribosomes",
          "isCorrect": true
        },
        {
          "answerText": "Rough ER",
          "isCorrect": true
        },
        {
          "answerText": "Smooth ER",
          "isCorrect": false
        },
        {
          "answerText": "Golgi apparatus",
          "isCorrect": false
        }
      ]
    }
  ]
}
```
