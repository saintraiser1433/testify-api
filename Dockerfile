FROM node:20.16-alpine3.20

# Create a non-root user
RUN addgroup -S db && adduser -S -G db db

WORKDIR /usr/src/db

# Copy package.json and install dependencies as root
COPY package*.json . 
RUN npm install --omit=dev


# Copy the rest of the project files
COPY . .

RUN npx prisma generate
RUN npm run build

# Change ownership and switch to the db user
RUN chown -R db:db /usr/src/db
USER db


EXPOSE 4000
CMD ["npm","run", "start"]
