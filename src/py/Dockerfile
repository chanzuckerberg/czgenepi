# Separate base image so that we can use it to update the Pipfile.lock and requirements.txt file
FROM python:3.9.1-slim AS base
ENV FLASK_APP=aspen.app.app
EXPOSE 3000
RUN pip install --no-cache-dir pipenv
WORKDIR /usr/src/app
COPY requirements.txt .
COPY Pipfile* ./
COPY third-party ./third-party/

# Actual dev image used for day-to-day developments
FROM base as dev
ENV FLASK_ENV=development
RUN pipenv install --dev --system --verbose && pipenv --clear
COPY . .
ENTRYPOINT ["./entrypoint.sh"]

# Build production from files in dev
FROM base as production
ENV FLASK_ENV=production
RUN pip install --no-cache-dir -r requirements.txt
COPY --from=dev /usr/src/app .
ENTRYPOINT ["./entrypoint.sh"]
