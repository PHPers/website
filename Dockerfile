FROM php:7.4-alpine

RUN apk add --no-cache git curl
RUN curl -o /usr/bin/composer https://getcomposer.org/download/2.2.6/composer.phar
RUN chmod 755 /usr/bin/composer

VOLUME /app
WORKDIR /app
EXPOSE 8000

CMD ["/usr/bin/composer"]