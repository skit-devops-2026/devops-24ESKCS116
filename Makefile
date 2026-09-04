.PHONY: install test build run docker-build docker-up

install:
	npm install

test:
	npm test

build:
	@echo "Static frontend build complete"

run:
	@echo "Open index.html in your browser"

docker-build:
	@echo "TODO: docker build for frontend and backend" && exit 1

docker-up:
	docker compose up --build