APP_NAME = nexus9k_automation

ES6_PATH = $(APP_NAME)/es6
SCSS_PATH = $(APP_NAME)/scss

STATIC_PATH = $(APP_NAME)/static

.PHONY: compile-es6 compile-scss install run watch-esc6 watch-scss

compile-es6:
	babel $(ES6_PATH)/main.js --out-file $(STATIC_PATH)/js/main-compiled.js

compile-scss:
	sassc $(SCSS_PATH)/main.scss $(STATIC_PATH)/css/main.css --output-style compressed

install:
	pip install -r requirements.txt
	npm install

run:
	python manage.py runserver

watch-es6:
	watchmedo shell-command --patterns=*.js --recursive --command 'make compile-es6' $(ES6_PATH)

watch-scss:
	watchmedo shell-command --patterns=*.scss --recursive --command='make compile-scss' $(SCSS_PATH)
