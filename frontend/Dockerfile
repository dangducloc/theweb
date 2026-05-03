# ── Stage 1: Builder ──────────────────────────────────────
FROM node:20-alpine3.19 AS builder

WORKDIR /app

# ✅ Accept VITE env at build time
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .

# ✅ Build to dist/ (do not use dev server)
RUN npm run build

# ── Stage 2: Nginx serve static ───────────────────────────
FROM nginx:1.25-alpine AS production

# ✅ Copy dist from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# ✅ Nginx config for Vue Router (SPA – fix F5 404)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ✅ Non-root nginx
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
