FROM node:24-trixie-slim AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-trixie-slim AS runtime
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /usr/src/app/dist ./dist
USER node
CMD ["npm", "start"]
