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

headerContent = open("header.html", "r").read()
aboutmeContent = open("about.md", "r").read()
paperContent = open("self-replicators.md", "r").read()

for templateFilename in glob.glob("*.template.html"):
    print(templateFilename)
    outputFilename = templateFilename.replace('.template.html', '.html')
    template = env.get_template(templateFilename)

    projectsFile = open("projects.yaml")
    readingsFile = open("readings.yaml")
    coursesFile = open("courses.yaml")

    projects = yaml.load(projectsFile)
    readings = yaml.load(readingsFile)
    courses = yaml.load(coursesFile)

    # projects = filter(lambda b: not b["hide"], projects)
    projects = filter(lambda b: "order" in b and b["order"] != "", projects)
    projects = sorted(projects, key = (lambda b: int(b["order"])), reverse = False)

    readings = filter(lambda b: "weight" in b and int(b["weight"]) >= 3, readings)
    readings = sorted(readings, key = (lambda b: int(b["weight"])), reverse = True)

    courses = filter(lambda b: "hidden" not in b or b["hidden"] == False, courses)
    # courses = filter(lambda b: "order" in b and b["order"] != "", courses)
    # courses = sorted(courses, key = (lambda b: float(b["cap_done"]) / float(b["cap_total"])), reverse = False)

    outputFile = open(outputFilename, "w")
    outputFile.write(template.render(
        projects=projects,
        readings=readings,
        courses=courses,
        header=headerContent, aboutme=aboutmeContent, paper=paperContent).encode('utf-8'))
