# POSTS APP

This application provides CRUD functionality for managing posts. Users can create posts with a title, content, and state. The title must be a unique string with a length between 3 and 100 characters. The content must also be a string with a minimum length of 3 characters. The state can be either DRAFT or PUBLISHED. The state field is optional and defaults to DRAFT if not specified. Additionally, a hash is generated based on the title and content of the post.

Internally, the application records the creation and last update timestamps for each post. Additionally, after a post is created, updated, or removed, the application emits an event via NATS. To ensure consistency, the application employs a transactional outbox pattern, allowing post data and post events to be saved within a single transaction.

The application uses PostgreSQL as its database to store posts and postEvents.

Migrations are configured to run automatically.

# Developed and tested using Node.js 22. Tests may not work with older versions.

# To see api docs see address http://localhost:3000/api in browser.

# Run in development mode

```sh
docker compose -f docker-compose-dev.yml --env-file .env up
```

# Run in production mode

```sh
docker compose -f docker-compose.yml --env-file .env up
```

# Install dependencies

```
npm install
```

# E2E tests

```
npm run test:e2e
```

# unit tests

```
npm run test
```

- run command in terminal in root folder of the project
