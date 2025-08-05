# 1. Node 22 버전 기반의 컨테이너 이미지 사용
FROM node:22

# 2. 작업 디렉토리 설정 (컨테이너 안에서 /app 폴더로 이동)
WORKDIR /app

# 3. package.json과 package-lock.json만 복사 (의존성 설치용)
COPY package*.json ./

# 4. npm install 실행 (라이브러리 설치)
RUN npm install

# 5. 전체 소스코드 복사
COPY . .

# 6. 컨테이너가 열 포트를 지정 
EXPOSE 5173

# 7. 개발 서버 실행 명령어
CMD ["npm", "run", "dev"]
