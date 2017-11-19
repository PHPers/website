FROM php:7.1-cli

RUN apt-get update \
    && apt-get install -y git libssl-dev zlib1g-dev libicu-dev g++ build-essential\
    && docker-php-ext-install zip mbstring intl

# Composer
RUN cd /tmp/ && curl -sS https://getcomposer.org/installer | php && mv /tmp/composer.phar /usr/local/bin/composer

CMD ["php", "-a"]