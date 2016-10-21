package main

import (
	"bytes"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"text/template"
	"time"

	yaml "gopkg.in/yaml.v2"

	"github.com/russross/blackfriday"
)

const (
	shortTimeFormat = "2006-01-02"
	longTimeFormat  = "January 02, 2006"
)

func outputFilename(filename string) string {
	filename = strings.TrimSuffix(filepath.Base(filename), ".md") + ".html"
	return filepath.Join("post", filename)
}

func parseFrontmatter(body *[]byte) (frontmatter map[interface{}]interface{}) {
	var frontmatterBuf bytes.Buffer
	frontmatter = make(map[interface{}]interface{})

	buf := bytes.NewBuffer(*body)
	stared, ended := false, false
	for {
		line, err := buf.ReadString('\n')
		if err != nil {
			log.Fatalln("Could not parse frontmatter:", err)
		}

		if line == "---\n" {
			if stared == false {
				stared = true
			} else if ended == false {
				ended = true
			}
		}
		if stared != false {
			frontmatterBuf.Write([]byte(line))
		}
		if ended != false {
			break
		}
	}

	if err := yaml.Unmarshal(frontmatterBuf.Bytes(), &frontmatter); err != nil {
		log.Fatalln("yaml.Unmarshal:", err)
	}

	// rest of the bytes:
	*body = buf.Bytes()
	return frontmatter
}

type Post struct {
	Title string
	Date  time.Time
	Body  string
	Link  string
	GUID  string
}

type Index struct {
	Title     string
	Posts     []Post
	URL       string
	XMLURL    string
	UpdatedAt time.Time
}

func (index Index) Len() int           { return len(index.Posts) }
func (index Index) Swap(i, j int)      { index.Posts[i], index.Posts[j] = index.Posts[j], index.Posts[i] }
func (index Index) Less(i, j int) bool { return index.Posts[i].Date.Before(index.Posts[j].Date) }

func main() {
	flag.Parse()
	os.MkdirAll("post", 0777)
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	tmpl := template.Must(template.ParseFiles(
		"templates/post.tmpl.html",
		"templates/index.tmpl.html",
		"templates/index.tmpl.xml",
	))

	var outfile *os.File
	var err error
	var body []byte

	index := Index{
		Title:     "Sina Siadat",
		URL:       "https://siadat.github.io/",
		XMLURL:    "https://siadat.github.io/index.xml",
		Posts:     make([]Post, flag.NArg()),
		UpdatedAt: time.Now(),
	}

	for i, mdFilename := range flag.Args() {
		body, err = ioutil.ReadFile(mdFilename)
		if err != nil {
			log.Fatalln("ioutil.ReadFile:", err)
		}

		fmt.Printf("%s:\n", mdFilename)
		var title string
		var date time.Time
		frontmatter := parseFrontmatter(&body)

		if iface, ok := frontmatter["title"]; ok {
			title = iface.(string)
		}

		if iface, ok := frontmatter["date"]; ok {
			if date, err = time.Parse(shortTimeFormat, iface.(string)); err != nil {
				log.Println("time.Parse:", err)
			}
		}

		outfile, err = os.Create(outputFilename(mdFilename))
		if err != nil {
			log.Fatalln("os.Create:", err)
		}

		index.Posts[i] = Post{
			Title: title,
			Body:  string(blackfriday.MarkdownCommon(body)),
			Date:  date,
			Link:  index.URL + outputFilename(mdFilename),
		}

		err = tmpl.ExecuteTemplate(outfile, "post.tmpl.html", index.Posts[i])
		if err != nil {
			log.Fatalln("tmpl.ExecuteTemplate:", err)
		}
		fmt.Println("  title:", index.Posts[i].Title)
		fmt.Println("  html: ", outputFilename(mdFilename))
		fmt.Println("  date: ", index.Posts[i].Date.Format(shortTimeFormat))
	}

	sort.Sort(sort.Reverse(index))
	fmt.Println("Index:")

	// index.html
	if outfile, err = os.Create("index.html"); err != nil {
		log.Fatalln("os.Create:", err)
	}
	if err := tmpl.ExecuteTemplate(outfile, "index.tmpl.html", index); err != nil {
		log.Fatalln("tmpl.ExecuteTemplate:", err)
	}
	fmt.Println("  html: index.html")

	// index.xml
	if outfile, err = os.Create("index.xml"); err != nil {
		log.Fatalln("os.Create:", err)
	}
	if err := tmpl.ExecuteTemplate(outfile, "index.tmpl.xml", index); err != nil {
		log.Fatalln("tmpl.ExecuteTemplate:", err)
	}
	fmt.Println("  xml:  index.xml")
}
