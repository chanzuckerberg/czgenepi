# Separate base image so that we can use it to update the Pipfile.lock and requirements.txt file
FROM python:3.9.1-slim AS base
ENV FLASK_APP=aspen.main
EXPOSE 3000

# Utility
RUN apt-get update && apt-get install -y vim procps wget make jq nano

# Orchestration. Supervisor is heavyweight but afaik nothing else supports sane child reaping and signal forwarding.
RUN pip install --no-cache-dir supervisor

# Proxy/Router: Set up nginx
RUN apt install -y nginx

# FASTAPI: Install poetry
ENV POETRY_HOME /opt/poetry/
RUN apt install -y libdigest-sha-perl
RUN wget https://raw.githubusercontent.com/python-poetry/poetry/1.1.10/get-poetry.py && \
    echo "e973b3badb95a916bfe250c22eeb7253130fd87312afa326eb02b8bdcea8f4a7  get-poetry.py" > get-poetry.py.sha256 && \
    shasum -a 256 -c get-poetry.py.sha256 && \
    python get-poetry.py && \
    rm get-poetry*
WORKDIR /usr/src/app

COPY pyproject.toml poetry.lock environment.yaml ./
COPY third-party ./third-party
RUN /opt/poetry/bin/poetry config virtualenvs.create false && \
    /opt/poetry/bin/poetry install
ENV PYTHONPATH=.

COPY . .
RUN /opt/poetry/bin/poetry install
CMD ["/usr/local/bin/supervisord", "-c", "/usr/src/app/etc/supervisord.conf"]
