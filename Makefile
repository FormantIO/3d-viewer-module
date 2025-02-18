build:
	jq -r .version package.json > public/VERSION
	npm run build
bump-minor:
	npm version minor
bump-patch:
	npm version patch
deploy: bump-minor build
	git add -f dist
	# unzip stage.zip into versions/stage
	wget https://github.com/FormantIO/3d-viewer-module/archive/refs/tags/stage.zip
	rm -rf versions/stage
	mkdir -p versions/stage
	unzip stage.zip '3d-viewer-module-stage/dist/*' -d versions/stage
	mv versions/stage/3d-viewer-module-stage/dist/* versions/stage/
	rm -rf versions/stage/3d-viewer-module-stage
	rm stage.zip
	git add versions/stage
	# unzip into versions/prod
	wget https://github.com/FormantIO/3d-viewer-module/archive/refs/tags/prod.zip
	rm -rf versions/prod
	mkdir -p versions/prod
	unzip prod.zip '3d-viewer-module-prod/dist/*' -d versions/prod
	mv versions/prod/3d-viewer-module-prod/dist/* versions/prod/
	rm -rf versions/prod/3d-viewer-module-prod
	rm prod.zip
	git add versions/prod
	# tag current commit with version
	git tag -f -a v$(shell jq -r .version package.json) -m "v$(shell jq -r .version package.json)"
	git commit -am "v$(shell jq -r .version package.json)"
	# push to github
	git push --follow-tag
cut-stage: deploy
	# checkout new branch stage-<current npm package version> and push to github
	git checkout -b stage-$(shell jq -r .version package.json)	
	git push --set-upstream origin stage-$(shell jq -r .version package.json)
	git tag -f stage  
	git push -f origin refs/tags/stage 
	git checkout master
update-stage: bump-patch build
	git add -f dist
	# tag current commit with version
	git tag -f -a v$(shell jq -r .version package.json) -m "v$(shell jq -r .version package.json)"
	git commit -am "v$(shell jq -r .version package.json)"
	git push
	git tag -f stage  
	git push -f origin refs/tags/stage
promote-stage-to-prod: 
	git checkout refs/tags/stage
	git tag -f prod  
	git push -f origin refs/tags/prod
	git checkout master
run:
	npm run dev
run-vr:
	npm run dev-vr

deploy-stage:
	rm -rf versions/stage/*
	cp -r dist/* versions/stage
	git add .
	git commit -m "update stage"
	git tag -f stage
	git push --follow-tags

manual-deploy:
	rm -rf versions/v1/*
	cp -r dist/* versions/v1
	rm -rf versions/prod/*
	cp -r dist/* versions/prod
	git add .
	git commit -m "update prod"
	git tag -f prod
	git push --follow-tags