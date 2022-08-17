.PHONY: dependencies

build:
	docker build \
		--build-arg UID=$(shell id -u) \
		--build-arg GID=$(shell id -g) \
		-f ./Dockerfile \
		-t blog:0.1 \
		.
	docker run \
	  --rm -it \
	  -v "$(PWD)":/work/ \
	  --workdir=/work/ \
	  blog:0.1 \
	  python3 generate.py

all: blog homepage

watch-blog:
	# sudo python -m pip install watchdog[watchmedo]
	watchmedo shell-command \
	  --patterns="*.md;*.md" \
	  --recursive \
	  --command='make blog' \
	  .

homepage: projects.yaml readings.yaml courses.yaml
	poetry run python generate.py

blog: dependencies
	cd blog && blgo --assets assets/ --templates templates/ --output . ./src/
	# cd blog && blgo --watch --serve :4040 --assets assets/ --templates templates/ --output . ./src/

clean:
	rm -rf blog/post/*.html
	rm -rf blog/index.html
	rm -rf blog/index.xml
	rm -f index.html

dependencies:
	# curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
	# python get-pip.py
	poetry install
	# go get github.com/siadat/blgo

header-open:
	vimdiff +/header +':windo normal ggnzt\<cr>' header.html blog/templates/index.tmpl.html blog/templates/post.tmpl.html
