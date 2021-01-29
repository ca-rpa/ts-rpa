FROM alpine:latest

RUN apk add --no-cache \
            udev \
            ttf-freefont \
            chromium \
            openssl \
            chromium-chromedriver \
            gfortran \
            gcc \
            g++ \
            nodejs-npm \
            jq \
            python3 \
            py3-pip
RUN pip3 install --upgrade pip
RUN pip3 install awscli

RUN mkdir /noto
ADD https://noto-website.storage.googleapis.com/pkgs/NotoSansCJKjp-hinted.zip /noto
WORKDIR /noto
RUN unzip NotoSansCJKjp-hinted.zip && \
    mkdir -p /usr/share/fonts/noto && \
    cp *.otf /usr/share/fonts/noto && \
    chmod 644 -R /usr/share/fonts/noto/ && \
    fc-cache -fv
WORKDIR /
RUN rm -rf /noto

ENV NODE_PATH /usr/lib/node_modules

WORKDIR /ts-rpa
RUN npm config set unsafe-perm true
RUN npm install -g ts-rpa@0.1.15 moment mathjs
WORKDIR /
RUN rm -rf /ts-rpa
