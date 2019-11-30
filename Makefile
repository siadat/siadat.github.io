.PHONY: dependencies

all: blog homepage

homepage: projects.json books.json
	poetry run python generate.py

blog: dependencies
	cd blog && blgo --assets assets/ --templates templates/ --output . ./src/
	# cd blog && blgo --watch --serve :4040 --assets assets/ --templates templates/ --output . ./src/

clean:
	rm -rf blog/post/*.html
	rm -rf blog/index.html
	rm -rf blog/index.xml
	rm -f books.json
	rm -f projects.json
	rm -f index.html

dependencies:
	# go get github.com/siadat/blgo

projects.json:
	node fetch.js projects | jq . > projects.json

books.json:
	node fetch.js books | jq . > books.json

header-open:
	vimdiff +/header +':windo normal ggnzt\<cr>' header.html blog/templates/index.tmpl.html blog/templates/post.tmpl.html
