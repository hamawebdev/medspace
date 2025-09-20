in /admin/content page.
the current request to POST  admin/questions/bulk is : 
```json
{"metadata":{"courseId":449,"universityId":1},"questions":[{"questionText":"What is the primary function of the heart?","explanation":"The heart pumps blood throughout the body","questionType":"SINGLE_CHOICE","answers":[{"answerText":"Pumping blood","isCorrect":true,"explanation":"Correct - the heart's main function is circulation"},{"answerText":"Filtering toxins","isCorrect":false,"explanation":"This is the function of kidneys"},{"answerText":"Producing hormones","isCorrect":false,"explanation":"This is primarily done by endocrine glands"}]}]}
```

but the correct request is :
```
{
  "metadata": {
    "courseId": 1,
    "universityId": 1,
    "examYear": 2024,
    "sourceId": 1,
    "rotation": "R1",
  },
  "questions": [
    {
      "questionText": "What is the primary function of the mitochondria in a cell?",
      "explanation": "Mitochondria are known as the powerhouse of the cell because they produce ATP (adenosine triphosphate), which is the primary energy currency of the cell.",
      "questionType": "SINGLE_CHOICE",
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
        }
      ]
    }
  ]
}
```
