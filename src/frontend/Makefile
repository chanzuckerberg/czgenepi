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
	exit_status=$$?; \
	test_container=$$(docker ps -a | grep -i frontend_run | cut -d ' ' -f 1 | head -n 1); \
	docker cp $${test_container}:/tmp/screenshots .; \
	docker rm $${test_container}; \
	aws --profile $(AWS_DEV_PROFILE) s3 cp --recursive ./screenshots $${S3_PREFIX}; \
	exit $$exit_status

test-build:
	npm --prefix . run build
