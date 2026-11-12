# Personal Blog About my Projects

The lessons learned...coming soon.

## Build and run in local environment

With Docker (no local Ruby needed), from the repo folder in PowerShell:

```powershell
docker run --rm -it -p 4000:4000 -e JEKYLL_ENV=local -v "${PWD}:/site" -w /site ruby:3.3 bash -c "bundle install && bundle exec jekyll serve --host 0.0.0.0 --force_polling --config _config.yml,_config.dev.yml"
```

Then open http://localhost:4000 (`Ctrl+C` to stop). Add `--drafts` to also show posts in `_drafts/`.

- `_config.dev.yml` sets `url` to `http://localhost:4000`; without it assets would point to `http://0.0.0.0:4000` and fail to load.
- `JEKYLL_ENV=local` prevents `jekyll serve` from overriding `url` (it does so in `development`) and keeps analytics/comments disabled (they load only in `production`).
- `--force_polling` is needed to detect file changes on Windows-mounted volumes.

With a local Ruby install: `bundle install` then `bundle exec jekyll serve`.

## Build and deploy

Nothing to do, but push your changes on master branch.

## Version

Based on [Jekyll Bootstrap] (http://jekyllbootstrap.com) vs. 0.3.0.