#!/usr/bin/env bash

if [[ $# -ne 1 ]]; then
	echo "Usage: `basename $0` <productName>"
	exit 1
fi

mkdir -p "dist/FINAL/"
PRODUCT_NAME=$1; shift;
export IFS=$'\n'

# (1) Move all assets to a "FINAL" folder
for file in $(find dist/ -name "$PRODUCT_NAME.app" -o -name "$PRODUCT_NAME.exe"); do
	mv $file dist/FINAL/
done

# (2) Delete any folders not called "FINAL"
for dir in $(find dist/ -maxdepth 1 -mindepth 1 -type d -not -name "FINAL" ); do
  rm -r $dir
done

# (3) Move all artifacts to the root "dist" folder.
mv dist/FINAL/* dist/
rm -r dist/FINAL
