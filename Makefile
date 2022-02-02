SHELL := /usr/bin/env bash -o pipefail
CUE   = ./scripts/cue.sh

UNAME_OS := $(shell uname -s)

ifeq ($(UNAME_OS),Darwin)
SED_I := sed -i ''
else
SED_I := sed -i
endif

.DEFAULT_GOAL := all

.PHONY: all
all: run

.PHONY: install
install:
	npm install

.PHONY: build
build: install cue-build
	rm -rf build
	npm run build

.PHONY: serve
serve: build
	npm run serve

.PHONY: start
start:
	npm run start

.PHONY: run
run: install
	npm run start

.PHONY: update
upgrade:
	npm update

.PHONY: clean
clean:
	git clean -xdf

.PHONY: lint
lint:
	vale docs

# CUE commands
.PHONY: cue-build
cue-build:
	$(CUE) build

.PHONY: cue-fmt
cue-fmt:
	$(CUE) fmt

.PHONY: cue-vet
cue-vet:
	$(CUE) vet

.PHONY: updateversion
updateversion:
ifndef VERSION
	$(error "VERSION must be set")
endif
	$(SED_I) "s/[0-9].[0-9][0-9]*\.[0-9][0-9]*/$(VERSION)/g" docs/installation.mdx
	$(SED_I) "s/version: '[0-9].[0-9][0-9]*\.[0-9][0-9]*'/version: '$(VERSION)'/g" docs/ci-cd/github-actions.md
	$(SED_I) "s/BUF_VERSION=[0-9].[0-9][0-9]*\.[0-9][0-9]*/BUF_VERSION=$(VERSION)/g" docs/ci-cd/setup.md
	$(SED_I) "s/downloadRelease: '[0-9].[0-9][0-9]*\.[0-9][0-9]*'/downloadRelease: '$(VERSION)'/g" docusaurus.config.js
