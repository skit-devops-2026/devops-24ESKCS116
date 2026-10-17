FROM nginx:alpine

ARG GIT_COMMIT=unknown

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY pages/ /usr/share/nginx/html/pages/
COPY assets/ /usr/share/nginx/html/assets/
COPY js/ /usr/share/nginx/html/js/
COPY scripts/ /usr/share/nginx/html/scripts/

RUN sed -i "s/COMMIT_SHA/${GIT_COMMIT}/g" /etc/nginx/conf.d/default.conf

EXPOSE 80