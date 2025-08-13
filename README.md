#https://o-zblind-fe-git-develop-ls-projects-b89ad826.vercel.app/

# OZBLIND Frontend

## 개발 환경 실행 방법

### 1. Docker 설치

https://www.docker.com/products/docker-desktop

### 2. `.env` 파일 생성

```bash
cp .env.example .env
```

### 3. 개발 서버 실행

docker-compose up --build

---

## 🧑‍🤝‍🧑 팀원이 해야 할 일

팀원은 다음 절차만 따르면 됩니다:

```bash
# 1. Git clone
git clone https://github.com/OZblind/OZblind_FE.git
cd ozblind_fe

# 2. Docker 설치 (한 번만 하면 됨)

# 3. 환경변수 파일 복사
cp .env.example .env

# 4. 개발 서버 실행
docker-compose up --build

# 5. 접속
http://localhost:5173
```
