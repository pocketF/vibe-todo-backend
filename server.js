const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const todoRoutes = require('./Routers/todoRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo_db';

// MongoDB 연결
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('연결 성공');
  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error.message);
    process.exit(1);
  }
};

// MongoDB 연결 이벤트 리스너
mongoose.connection.on('connected', () => {
  console.log('연결 성공');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose 연결 오류:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose 연결이 끊어졌습니다.');
});

// CORS 설정
const corsOptions = {
  origin: '*', // 모든 origin 허용 (프로덕션에서는 특정 origin 지정 권장)
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// OPTIONS 요청 처리 (Preflight 요청)
app.options('*', cors(corsOptions));

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS 헤더 명시적 설정 (strict-origin-when-cross-origin 오류 방지)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Max-Age', '86400'); // 24시간
  res.header('Referrer-Policy', 'no-referrer-when-downgrade');
  
  // OPTIONS 요청에 대해 즉시 응답
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Todo Backend API Server is running!',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Todo API Routes
app.use('/api/todos', todoRoutes);

// 서버 재시작 엔드포인트
app.post('/restart', async (req, res) => {
  try {
    res.json({ message: '서버 재시작 중...' });
    
    // MongoDB 연결 종료
    await mongoose.connection.close();
    console.log('MongoDB 연결 종료');
    
    // 서버 종료 (nodemon이나 PM2가 자동으로 재시작)
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  } catch (error) {
    console.error('서버 재시작 오류:', error);
    res.status(500).json({ error: '서버 재시작 실패' });
  }
});

// 서버 시작 함수
const startServer = async () => {
  try {
    // MongoDB 연결
    await connectDB();
    
    // Express 서버 시작
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });

    // 포트 충돌 에러 처리
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ 포트 ${PORT}가 이미 사용 중입니다.`);
        console.error(`다른 프로세스를 종료하거나 다른 포트를 사용하세요.`);
        console.error(`포트를 사용 중인 프로세스 확인: netstat -ano | findstr :${PORT}`);
        process.exit(1);
      } else {
        console.error('서버 시작 오류:', error);
        process.exit(1);
      }
    });

    // Graceful shutdown 처리
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} 신호를 받았습니다. 서버를 종료합니다...`);
      
      server.close(async () => {
        console.log('HTTP 서버가 종료되었습니다.');
        
        try {
          await mongoose.connection.close();
          console.log('MongoDB 연결이 종료되었습니다.');
          process.exit(0);
        } catch (error) {
          console.error('MongoDB 종료 중 오류:', error);
          process.exit(1);
        }
      });
    };

    // 종료 신호 처리
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    console.error('서버 시작 실패:', error);
    process.exit(1);
  }
};

// 서버 시작
startServer();

