FROM node:20-alpine AS client-build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM node:20-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev
COPY server.js ./
COPY models ./models
COPY utils ./utils
COPY --from=client-build /app/client/dist ./client/dist

RUN mkdir -p /app/uploads

ENV PORT=5000
EXPOSE 5000
VOLUME ["/app/uploads"]

USER node
CMD ["node", "server.js"]