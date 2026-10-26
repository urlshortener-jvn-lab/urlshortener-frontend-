# Stage 1: Build React + TypeScript + Vite bằng Node 22
FROM node:22.14.0-slim AS builder

WORKDIR /app

# Copy package.json và package-lock.json trước để tận dụng Docker Layer Caching
COPY package*.json ./

# Cài đặt dependencies chính xác theo lockfile
RUN npm ci

# Copy toàn bộ source code và build ra thư mục tĩnh /app/dist
COPY . .
RUN npm run build

# Stage 2: Chạy bằng Nginx Alpine siêu nhẹ (~45MB thay vì ~1GB của Node)
FROM nginx:1.27.4-alpine

ARG API_UPSTREAM_URL="http://backend:8080"
ENV API_UPSTREAM_URL=$API_UPSTREAM_URL

# Copy bộ file tĩnh đã build từ Stage 1 sang thư mục phục vụ của Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy template cấu hình Nginx (tự động thay biến môi trường ${API_UPSTREAM_URL} lúc khởi chạy)
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["/bin/sh", "-c", "envsubst '${API_UPSTREAM_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
