#!/bin/bash
# script to manage the semver incrementation and tagging of the git branch
# relies on gum https://github.com/charmbracelet/gum being installed to make the input nice
# `brew install gum`

# (which gum > /dev/null) || echo >&2 "fum not installed, please install fum to use this script"; exit 12

echo "Current version is $(node -p "require('./package.json').version")"
TYPE=$(gum choose \
    --header "What type of commit is this? Semver type?" \
    --selected "patch" \
     "major" "minor" "patch" )
test -z "${TYPE}" && echo >&2 "Semver revision type not supplied" && exit 3

SUMMARY=$(gum write --placeholder "Your commit message (CTRL+D to finish)")
test -z "${SUMMARY}" && echo >&2 "\commit message not supplied" && exit 4

git add .

# Commit these changes and tag the branch with the semver
# also update the container version in the kustomization.yaml file
gum confirm "Commit changes and tag branch to deploy to production?" && \
    npm version "${TYPE}" --no-git-tag-version

newVersion=v$(node -p "require('./package.json').version")
k8sVersion="v${newVersion}" yq --in-place \
    --yaml-output \
     '.images[0].newTag = $ENV.k8sVersion' kubernetes/production/kustomization.yaml

git commit -a --message \""$SUMMARY"\"
git tag -a "${newVersion}" -m "Release ${newVersion}"

git push
git push --tags
