#!/usr/bin/env bash

. ./utils.sh

PROJECT=bot
DOCKER_COMPOSE="docker-compose
--project-name split-expense-${PROJECT}-dev
-f docker-compose.dev.yml"

case $1 in
"up")
  createNetwork

  ${DOCKER_COMPOSE} pull --ignore-pull-failures
  ${DOCKER_COMPOSE} build
  ${DOCKER_COMPOSE} run --service-ports runner_bot bash
  ${DOCKER_COMPOSE} down
  ;;
"down")
  ${DOCKER_COMPOSE} down
  ;;
  *)
  echo "first argument must be one of 'up' or 'down'"
  exit 1;;
esac
