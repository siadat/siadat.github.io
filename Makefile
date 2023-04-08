.PHONY: dependencies

all:
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
	  bash -c ' \
		  python3 generate.py ; \
		  make run-local-blgo ; \
	  '

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

header-open:
	nvim -d +/header +':windo normal ggnzt\<cr>' header.html blog/templates/index.tmpl.html blog/templates/post.tmpl.html
