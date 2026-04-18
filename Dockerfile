FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
```

**`backend/.dockerignore`**:
```
node_modules
npm-debug.log
dist
.env
.git
.gitignore