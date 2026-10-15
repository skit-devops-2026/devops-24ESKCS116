FROM nginx:alpine

COPY index.html /usr/share/nginx/html/index.html
COPY pages/ /usr/share/nginx/html/pages/
COPY assets/ /usr/share/nginx/html/assets/
COPY js/ /usr/share/nginx/html/js/
COPY scripts/ /usr/share/nginx/html/scripts/

EXPOSE 80
