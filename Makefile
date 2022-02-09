CURRENT_DIR = $(shell pwd)
ID = $(shell id -u)
all: composer build

composer-update:
	docker run -it --rm -v ${CURRENT_DIR}:/app -u ${ID} leafnode/phpers:latest composer update

composer:
	docker run -it --rm -v ${CURRENT_DIR}:/app -u ${ID} leafnode/phpers:latest composer install

build:
	docker run -it --rm -p 8000:8000 -v ${CURRENT_DIR}:/app -u ${ID} leafnode/phpers:latest vendor/bin/sculpin generate

serve:
	docker run -it --rm -p 8000:8000 -v ${CURRENT_DIR}:/app -u ${ID} leafnode/phpers:latest vendor/bin/sculpin generate --watch --server