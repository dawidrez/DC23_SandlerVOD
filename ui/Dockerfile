## Stage 1: Build the Angular app
#FROM node:alpine AS builder
#WORKDIR /app
#COPY . .
#RUN npm install && npm run build
#
## Stage 2: Serve the app with Nginx
#FROM nginx:alpine
#COPY --from=builder /app/dist/* /usr/share/nginx/html/
#COPY /nginx.conf /etc/nginx/conf.d/default.conf


# Stage 1: Build the Angular app
#FROM node:slim AS builder
#WORKDIR /app
#COPY . .
#RUN npm config set strict-ssl false
#RUN npm install && npm run build:ssr

# Stage 2: Serve the SSR app with Node.js
FROM node:slim
COPY dist/ /app/dist/
COPY package.json package-lock.json /app/
WORKDIR /app
RUN npm install express @nguniversal/express-engine --production
CMD [ "node", "dist/ui/server/main.js" ]
