.PHONY: dependencies

generate: dependencies
	cd blog && blgo --assets assets/ --templates templates/ --output . ./src/

serve: dependencies
	cd blog && blgo --watch --serve :4040 --assets assets/ --templates templates/ --output . ./src/

clean:
	rm -rf blog/post/*.html
	rm -rf blog/index.html
	rm -rf blog/index.xml

dependencies:
	go get github.com/siadat/blgo
