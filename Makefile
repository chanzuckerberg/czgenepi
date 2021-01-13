SHELL := /bin/bash
PYTHON_CODE_DIRECTORIES = src/py

style: lint black isort mypy

lint:
	flake8 --ignore "E203, E231, E501, W503" $(PYTHON_CODE_DIRECTORIES)

black:
	black --check $(PYTHON_CODE_DIRECTORIES)

isort:
	isort --check $(PYTHON_CODE_DIRECTORIES)

mypy:
	mypy --ignore-missing-imports $(PYTHON_CODE_DIRECTORIES)

.PHONY: style lint black isort
