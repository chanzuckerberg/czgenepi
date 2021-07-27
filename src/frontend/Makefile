### CHECK STYLE #############################################
check-style:
	npm --prefix . run lint-ci

lint:
	npm --prefix . run lint

### TESTING #################################################
tests: # run ts test
	npm --prefix . run tests

e2e: # run ts test
	npm --prefix . run e2e

test-build:
	npm --prefix . run build

upload-sourcemaps:
	sentry-cli releases files $(COMMIT_SHA) upload-sourcemaps .
