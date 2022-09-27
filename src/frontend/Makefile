### CHECK STYLE #############################################
check-style:
	npm --prefix . run lint-ci

lint:
	npm --prefix . run lint

### TESTING #################################################
.PHONY: tests
test: # run ts unit test
	npm --prefix . run jest

e2e-ci: # run e2e tests
	npm --prefix . run e2e

test-build:
	npm --prefix . run build
