# import json
import sys
import markdown
import glob
import yaml

from jinja2 import Environment, PackageLoader, select_autoescape, FileSystemLoader
env = Environment(
    loader=FileSystemLoader('.'),
    autoescape=select_autoescape(['html', 'xml'])
)

env.filters['markdown'] = markdown.markdown;

headerFile = open("header.html", "r")
headerContent = headerFile.read()

aboutmeFile = open("about.md", "r")
aboutmeContent = aboutmeFile.read()

for templateFilename in glob.glob("*.template.html"):
    print(templateFilename)
    outputFilename = templateFilename.replace('.template.html', '.html')
    template = env.get_template(templateFilename)

    projectsFile = open("projects.yaml")
    booksFile = open("books.yaml")

    # projects = json.load(projectsFile)
    # books = json.load(booksFile)

    projects = yaml.load(projectsFile)
    books = yaml.load(booksFile)

    projects = filter(lambda b: "order" in b and b["order"] != "", projects)
    projects = sorted(projects, key = (lambda b: int(b["order"])), reverse = False)

    books = filter(lambda b: "weight" in b and int(b["weight"]) >= 3, books)
    books = sorted(books, key = (lambda b: int(b["weight"])), reverse = True)

    outputFile = open(outputFilename, "w")
    outputFile.write(template.render(projects=projects, books=books, header=headerContent, aboutme=aboutmeContent).encode('utf-8'))
