FROM php:5.6-cli

RUN apt-get update \
    && apt-get install -y git libssl-dev zlib1g-dev libicu-dev g++ build-essential\
    && docker-php-ext-install zip mbstring intl

CMD ["php", "-a"]