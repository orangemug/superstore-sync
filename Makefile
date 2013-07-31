BUILD_DIR = coverage

build: test

clean:
	@echo "Starting clean"
	@rm -rf ${BUILD_DIR}
	@rm -rf node_modules
	@npm install
	@ehco "Finishing clean"

test: clean
	@echo "Starting test"
	@npm test
	@echo "Finishign test"
