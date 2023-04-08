FROM ubuntu:22.04

USER root
RUN apt-get update
RUN apt-get install -y \
    git wget curl gzip pip
RUN apt-get install -y \
    python2.7

ARG UID
ARG GID
RUN addgroup --gid $GID user_in_docker
RUN useradd --create-home \
            --uid $UID \
            --gid $GID \
            --shell /bin/bash user_in_docker
ARG HOME=/home/user_in_docker
USER user_in_docker

ENV PATH="${PATH}:/home/user_in_docker/.local/bin"
RUN pip install markdown pyyaml jinja2
