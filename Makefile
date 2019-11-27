.PHONY: dependencies

homepage: projects.json books.json dependencies
	# blog:
	cd blog && blgo --assets assets/ --templates templates/ --output . ./src/
	# cd blog && blgo --watch --serve :4040 --assets assets/ --templates templates/ --output . ./src/

  # other:
	poetry run python generate.py > out.html
	# poetry run python generate.py projects.json tmp.projects.html > out.projects.html
	# poetry run python generate.py books.json    tmp.books.html    > out.books.html

clean:
	rm -rf blog/post/*.html
	rm -rf blog/index.html
	rm -rf blog/index.xml
	rm books.json
	rm projects.json

dependencies:
	go get github.com/siadat/blgo

projects.json:
	node fetch.js projects | jq . > projects.json

books.json:
	node fetch.js books | jq . > books.json
