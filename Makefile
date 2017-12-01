.PHONY: dependencies

generate: dependencies
	blgo --templates templates/ --output . ./src/

clean:
	rm -rf post/*.html
	rm -rf index.html
	rm -rf index.xml

dependencies:
	go get github.com/siadat/blgo
