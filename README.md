# Todo Backend

Todo 애플리케이션을 위한 백엔드 API 서버입니다.

## 설치 방법

```bash
npm install
```

## 실행 방법

### 개발 모드 (nodemon 사용)
```bash
npm run dev
```

### 프로덕션 모드
```bash
npm start
```

## 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요.

```bash
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/todo_db
```

**MongoDB URI 예시:**
- 로컬 MongoDB: `mongodb://localhost:27017/todo_db`
- MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/todo_db`

## API 엔드포인트

### 서버 관리
- `GET /` - 서버 상태 확인 (데이터베이스 연결 상태 포함)
- `GET /health` - 헬스 체크 (데이터베이스 연결 상태 포함)
- `POST /restart` - 서버 재시작 (MongoDB 연결 종료 후 서버 재시작)

### Todo API
- `POST /api/todos` - 할일 생성
  ```json
  {
    "title": "할일 제목",
    "description": "할일 설명 (선택사항)"
  }
  ```
- `GET /api/todos` - 모든 할일 조회
- `GET /api/todos/:id` - 특정 할일 조회
- `PUT /api/todos/:id` - 할일 수정
  ```json
  {
    "title": "수정된 제목",
    "description": "수정된 설명",
    "completed": true
  }
  ```
- `DELETE /api/todos/:id` - 할일 삭제

## 기술 스택

- Node.js
- Express.js
- MongoDB (Mongoose)
- CORS
- dotenv

