SHELL := /bin/bash
CODE_DIRECTORIES = src

style: lint black isort

lint:
	flake8 --ignore "E203, E231, E501, W503" $(CODE_DIRECTORIES)

black:
	black --check $(CODE_DIRECTORIES)

isort:
	isort --check $(CODE_DIRECTORIES)

mypy:
	mypy --ignore-missing-imports $(CODE_DIRECTORIES)

.PHONY: style lint black isort
