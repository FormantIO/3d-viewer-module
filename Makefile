build:
	jq -r .version package.json > public/VERSION
	npm run build
bump-minor:
	npm version minor
deploy: bump-minor build
	git add -f dist
	# unzip stage.zip into versions/stage
	wget https://github.com/FormantIO/3d-viewer-module/archive/refs/tags/stage.zip
	rm -rf versions/stage
	mkdir -p versions/stage
	unzip stage.zip -d versions/stage
	rm stage.zip
	# unzip into versions/prod
	wget https://github.com/FormantIO/3d-viewer-module/archive/refs/tags/prod.zip
	rm -rf versions/prod
	mkdir -p versions/prod
	unzip stage.zip -d versions/prod
	rm stage.zip
	# tag current commit with version
	git tag -f -a v$(shell jq -r .version package.json) -m "v$(shell jq -r .version package.json)"
	git commit -am "v$(shell jq -r .version package.json)"
	# push to github
	git push --follow-tag
cut-stage:
	# checkout new branch stage-<current npm package version> and push to github
	git checkout -b stage-$(shell jq -r .version package.json)	
	git push --set-upstream origin stage-$(shell jq -r .version package.json)
	git checkout master
cut-prod:
	# checkout new branch prod-<current npm package version> and push to github
	git checkout -b prod-$(shell jq -r .version package.json)	
	git push --set-upstream origin prod-$(shell jq -r .version package.json)
	git checkout master
update-stage: bump-patch build
	git add -f dist
	# tag current commit with version
	git tag -f -a v$(shell jq -r .version package.json) -m "v$(shell jq -r .version package.json)"
	git commit -am "v$(shell jq -r .version package.json)"
	# push to github
	git push --follow-tag
	git tag -f -a stage -m "stage"
	git commit -am "stage v$(shell jq -r .version package.json)"
	git push --follow-tags
update-prod:  bump-patch build
	git add -f dist
	# tag current commit with version
	git tag -f -a v$(shell jq -r .version package.json) -m "v$(shell jq -r .version package.json)"
	git commit -am "v$(shell jq -r .version package.json)"
	# push to github
	git push --follow-tag
	git tag -f -a stage -m "prod"
	git commit -am "prod v$(shell jq -r .version package.json)"
	git push --follow-tags
run:
	npm run dev
run-vr:
	npm run dev-vr
