FROM nginx:latest

RUN rm -r /usr/share/nginx/html
COPY output_prod /usr/share/nginx/html
