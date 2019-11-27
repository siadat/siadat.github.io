import json
import sys
import markdown
import glob

from jinja2 import Environment, PackageLoader, select_autoescape, FileSystemLoader
env = Environment(
    loader=FileSystemLoader('.'),
    autoescape=select_autoescape(['html', 'xml'])
)

env.filters['markdown'] = markdown.markdown;

headerFile = open("header.html", "r")
headerContent = headerFile.read()

for templateFilename in glob.glob("*.template.html"):
    print(templateFilename)
    outputFilename = templateFilename.replace('.template.html', '.html')
    template = env.get_template(templateFilename)

    projectsFile = open("projects.json")
    booksFile = open("books.json")

    projects = json.load(projectsFile)
    books = json.load(booksFile)

    projects = filter(lambda b: b["order"] != "", projects)
    projects = sorted(projects, key = (lambda b: int(b["order"])), reverse = False)

    books = filter(lambda b: int(b["weight"]) >= 3, books)
    books = sorted(books, key = (lambda b: int(b["weight"])), reverse = True)

    projectsFile = open("projects.json")
    outputFile = open(outputFilename, "w")
    outputFile.write(template.render(projects=projects, books=books, header=headerContent).encode('utf-8'))
    # print()
