### CHECK STYLE #############################################
check-style:
	npm --prefix . run lint-ci

lint:
	npm --prefix . run lint

### TESTING #################################################
.PHONY: tests
test: # run ts unit test
	npm --prefix . run test

e2e: # run ts e2e test
	npm --prefix . run e2e

test-build:
	npm --prefix . run build
