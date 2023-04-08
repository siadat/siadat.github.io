set -e
git add Makefile $(rg -l -t yaml -t html -t md -t sh .)
git diff --stat -p --cached
echo -n "Send? (Y/n)"
read -r confirm
if [[ $confirm == 'n' ]]; then exit 0; fi
git commit -m update
git push origin HEAD
git show --stat
