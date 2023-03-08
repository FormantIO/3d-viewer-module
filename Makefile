build:
	npm run build
stage: build
	rm -rf versions/stage/*
	mv dist/* versions/stage/
	rm -rf dist
prod: build
	rm -rf versions/v1/*
	mv dist/* versions/v1/
	rm -rf dist
run:
	npm run dev
run-vr:
	npm run dev-vr
