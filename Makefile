.PHONY: dependencies

all: blog homepage

watch-blog:
	# sudo python -m pip install watchdog[watchmedo]
	watchmedo shell-command \
	  --patterns="*.md;*.md" \
	  --recursive \
	  --command='make blog' \
	  .

homepage: projects.yaml readings.yaml
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
	# go get github.com/siadat/blgo

header-open:
	vimdiff +/header +':windo normal ggnzt\<cr>' header.html blog/templates/index.tmpl.html blog/templates/post.tmpl.html
