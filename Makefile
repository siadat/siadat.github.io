.PHONY: dependencies

all:
	docker build \
		--build-arg UID=$(shell id -u) \
		--build-arg GID=$(shell id -g) \
		-t blog:0.1 \
		build-docker-action/
	docker run \
	  --rm \
	  -v "$(PWD)":/work/ \
	  --workdir=/work/ \
	  blog:0.1 \
	  bash -c ' \
		  python3 generate.py ; \
		  make run-blgo ; \
	  '

send:
	bash send.bash
watch-blog:
	# sudo python -m pip install watchdog[watchmedo]
	watchmedo shell-command \
	  --patterns="*.md;*.md" \
	  --recursive \
	  --command='make blog' \
	  .

homepage: projects.yaml readings.yaml courses.yaml
	poetry run python generate.py

blgo:
	git clone git@github.com:siadat/blgo.git
	cd blgo && go get

run-blgo:
	blgo -seed ./blog -output ./blog ./blog/src

run-local-blgo: blgo
	cd blgo && go run . -seed ../blog -output ../blog ../blog/src

clean:
	rm -rf blog/post/*.html
	rm -rf blog/index.html
	rm -rf blog/index.xml
	rm -f index.html

upgrade-dependencies:
	poetry show -l | awk '{ print $$1 }' | xargs -i poetry add {}@latest

dependencies:
	# curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
	# python get-pip.py
	poetry install
	# go get github.com/siadat/blgo

new-post:
	DATE="$(shell date +%Y-%m-%d)" envsubst < new-post.md.tmpl

header-open:
	nvim -d +/header +':windo normal ggnzt\<cr>' header.html blog/templates/index.tmpl.html blog/templates/post.tmpl.html
