.PHONY: dependencies

generate: dependencies
	blgo --assets assets/ --templates templates/ --output . ./src/

serve: dependencies
	blgo --watch --serve :4040 --assets assets/ --templates templates/ --output . ./src/

clean:
	rm -rf post/*.html
	rm -rf index.html
	rm -rf index.xml

dependencies:
	go get github.com/siadat/blgo
