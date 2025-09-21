**endpoint:** `GET
	https://med-cortex.com/api/v1/students/todos?page=1&limit=12&sortBy=createdAt&sortOrder=desc&includeCompleted=true`

response:
```json
    {"success":true,"data":{"success":true,"data":{"todos":[{"id":16,"title":"Read 2 courses: Algies pelviennes aigües et chronique, Aménorrhée","description":"fggfgfg","type":"READING","priority":"HIGH","status":"PENDING","dueDate":"2025-09-21T04:00:00.000Z","completedAt":null,"courses":[{"id":449,"name":"Algies pelviennes aigües et chronique"},{"id":450,"name":"Aménorrhée"}],"quiz":null,"exam":null,"quizSession":null,"isOverdue":true,"createdAt":"2025-09-21T13:55:19.997Z","updatedAt":"2025-09-21T13:55:19.997Z"},{"id":11,"title":"gbggggg","description":"gggggggg","type":"OTHER","priority":"MEDIUM","status":"PENDING","dueDate":"2025-09-19T04:55:00.000Z","completedAt":null,"courses":[],"quiz":null,"exam":null,"quizSession":null,"isOverdue":true,"createdAt":"2025-09-19T22:44:19.457Z","updatedAt":"2025-09-19T22:44:19.457Z"}],"pagination":{"currentPage":1,"totalItems":2,"hasMore":false}}},"meta":{"timestamp":"2025-09-21T14:03:51.991Z","requestId":"f7wf1839gsd"}}
```