**endpoint**: `POST /admin/questions`


- yearlevel : ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN

- rotation : R1 | R2 | R3 | R4

- use **Endpoint:** `GET /question-sources` to get available sourceIds 

- examYear > 1900

request body:
```json
{
  "questionText": "What is the primary function of the mitochondria in a cell?",
  "explanation": "Mitochondria are known as the powerhouse of the cell because they produce ATP (adenosine triphosphate), which is the primary energy currency of the cell.",
  "questionType": "SINGLE_CHOICE",
  "yearLevel": "ONE",
  "rotation": "R1",
  "additionalInfo": "Additional information...",
  "metadata": "{\"difficulty\": \"medium\", \"topic\": \"cell biology\", \"source\": \"textbook\"}",
  "courseId": 1,
  "universityId": 1,
  "examYear": 2024,
  "sourceId": 1,
  "answers": [
    {
      "answerText": "Energy production (ATP synthesis)",
      "isCorrect": true,
      "explanation": "Mitochondria produce ATP through cellular respiration."
    },
    {
      "answerText": "Protein synthesis",
      "isCorrect": false,
      "explanation": "Protein synthesis occurs in ribosomes."
    },
    {
      "answerText": "DNA replication",
      "isCorrect": false,
      "explanation": "DNA replication occurs in the nucleus."
    },
    {
      "answerText": "Waste removal",
      "isCorrect": false,
      "explanation": "Waste removal is handled by lysosomes."
    }
  ]
}
```