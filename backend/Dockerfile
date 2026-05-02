# -------- Base --------
FROM node:20-alpine

# Tạo working dir
WORKDIR /app

# Cài thêm openssl (Prisma cần)
RUN apk add --no-cache openssl

# Copy package trước để tận dụng cache
COPY package*.json ./

# Install deps (prod)
RUN npm install --omit=dev

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate


# Expose port
EXPOSE 3000

# Start app + migrate
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]