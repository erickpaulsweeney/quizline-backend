# Quizline Backend

## Endpoints

- Auth
  - `POST /auth/signup`  
  - `POST /auth/login`
  - `POST /auth/token`

- Quiz 
  - `POST /quiz`: Get user's quizzes
  - `GET /quiz/new`: New quiz
  - `POST /quiz/edit/:id`: Update quiz
  - `DELETE /quiz/delete/:id`: Delete quiz

- Question 
  - `POST /question/new`: New question
  - `POST /question/:id`: Edit question
  - `DELETE /question/:id`: Delete question

Results
  - `GET /result`: Get user's results
  - `POST /result/new`: New quiz result

Postman JSON: ```https://www.getpostman.com/collections/d1308caee15510528c1c```