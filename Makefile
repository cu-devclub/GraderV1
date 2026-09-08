.PHONY: install-tools pre-commit pre-commit-install pre-commit-update compose-dev compose-prod compose-down

# Native Windows GNU Make defaults to cmd.exe; the recipes below use POSIX syntax.
SHELL := bash

# The [32m / [0m below start with a literal ESC (0x1B) character so the colors
# render whether the recipe runs under bash or cmd.exe.
GREEN := [32m
RESET := [0m
DONE  := @echo $(GREEN)Done$(RESET)

install-tools: ## restore local tool
	python -m pip install pre-commit
	$(DONE)

pre-commit: ## Run pre-commit hooks on all files
	python -m pre_commit run --all-files
	$(DONE)

pre-commit-install: ## Install pre-commit git hooks into the git repository
	python -m pre_commit install
	$(DONE)

pre-commit-update: ## Update pre-commit hook versions to the latest releases
	python -m pre_commit autoupdate
	$(DONE)

compose-dev: ## Build and start the stack in dev mode
	docker compose -f compose.yaml -f compose.dev.yaml up -d --build
	$(DONE)

compose-prod: ## Build and start the stack in prod mode
	docker compose -f compose.yaml -f compose.prod.yaml up -d --build
	$(DONE)

compose-down: ## Stop the stack (dev or prod)
	docker compose -f compose.yaml -f compose.dev.yaml -f compose.prod.yaml down
	$(DONE)