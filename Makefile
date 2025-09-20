.PHONY: demo stream api web

demo:
	cp config/project.yaml config/config.yaml
	snakemake -j4 -p --use-conda

stream:
	cp config/stream.yaml config/config.yaml
	snakemake -j8 -p --use-conda

api:
	cd api && uvicorn app.main:app --reload --port 8000

web:
	cd web && npm i && npm run dev





