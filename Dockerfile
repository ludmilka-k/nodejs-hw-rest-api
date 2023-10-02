FROM node:lts
EXPOSE 3000
ENV NODE_ENV production
WORKDIR /app
COPY --chown=node:node . .
RUN npm ci --only=production
USER node
CMD ["node", "server.js"]
