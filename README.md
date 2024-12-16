# POSTS APP
This app provides CRUD functionality for Post. User can create post with title, content and state. Title must be unique string and its length must be between 3 and 100 characters. Content must be string and itl length must be at least 3 characters. State can be DRAFT or PUBLISHED. State isn't required, and its default value is DRAFT. Internally application add date of creation and last update. After creation, update or removal application emits event via NATS. Internally it uses transactional outbox pattern to achieve consistency. Application uses postgres as database. It allows to save post  and post events in one transaction.

# To see api docs see address http://localhost:3000/api in browser.


# Run in development mode

```sh
docker compose -f docker-compose-dev.yml --env-file .env up
```


# Run in production mode

```sh
docker compose -f docker-compose.yml --env-file .env up
```


# E2E tests

```
npm run test:e2e
```

# unit tests

```
npm run test
```
