docker-up:
	docker compose up --build -d

docker-down:
	docker compose down

docker-logs:
	docker logs -f themis-voting-server

docker-restart:
	docker compose down && docker compose up --build -d

docker-run-migrate:
	docker compose run api npx prisma migrate deploy

docker-run-generate:
	docker compose run api npx prisma generate
