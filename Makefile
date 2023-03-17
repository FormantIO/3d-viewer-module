build:
	jq -r .version package.json > public/VERSION
	npm run build
bump:
	npm version patch
deploy: bump build
	# tag current commit with version
	git tag -f -a v$(shell jq -r .version package.json) -m "v$(shell jq -r .version package.json)"
	git commit -am "v$(shell jq -r .version package.json)"
	# push to github
	git push --follow-tags
run:
	npm run dev
run-vr:
	npm run dev-vr
