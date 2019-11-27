import json
import sys
import markdown

from jinja2 import Environment, PackageLoader, select_autoescape, FileSystemLoader
env = Environment(
    loader=FileSystemLoader('.'),
    autoescape=select_autoescape(['html', 'xml'])
)

env.filters['markdown'] = markdown.markdown;
template = env.get_template("tmp.html")

projectsFile = open("projects.json")
booksFile = open("books.json")

projects = json.load(projectsFile)
books = json.load(booksFile)

books2 = filter(lambda b: int(b["weight"]) >= 3, books)

print(template.render(projects=projects, books=books2))
