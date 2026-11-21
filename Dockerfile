FROM node:22-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
ENV NODE_ENV=production
# Ma'lumotlar bazasi shu papkada saqlanadi: hostingda doimiy disk (volume) /data ga ulanadi
RUN mkdir -p /data
ENV DB_PATH=/data/bandly.sqlite
ENV TRUST_PROXY=1
# npm orqali emas: SIGTERM to'g'ridan-to'g'ri serverga yetadi (toza to'xtash, "npm error" shovqinisiz)
# node:sqlite ExperimentalWarning har ishga tushishda log'ga "error" bo'lib tushadi — shovqinni o'chiramiz
CMD ["node", "--disable-warning=ExperimentalWarning", "--import", "tsx", "server/index.ts"]
