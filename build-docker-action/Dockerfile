FROM ubuntu:22.04

USER root
RUN apt-get update
RUN apt-get install -y \
    git wget curl gzip pip
RUN apt-get install -y \
    python3.11
RUN apt-get install -y \
    golang

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
ENV PATH="${PATH}:/home/user_in_docker/go/bin"

RUN pip install markdown pyyaml jinja2
RUN go install github.com/siadat/blgo@b157a31b06abec986f745f3d1214ced675618fb3
