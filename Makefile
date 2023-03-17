build:
	jq -r .version package.json > public/VERSION
	npm run build
bump:
	npm version patch
deploy: bump build
	git add -f dist
	# tag current commit with version
	git tag -f -a v$(shell jq -r .version package.json) -m "v$(shell jq -r .version package.json)"
	git commit -am "v$(shell jq -r .version package.json)"
	# push to github
	git push --follow-tags
deploy-stage: deploy
	# adding stage tag
	git tag -f -a stage -m "stage"
	git commit -am "stage v$(shell jq -r .version package.json)"
	git push --follow-tags
run:
	npm run dev
run-vr:
	npm run dev-vr
