#!/bin/bash

# Check if a file name is provided as an argument
if [ -z "$1" ]; then
    echo "Usage: $0 <filename>"
    exit 1
fi

filename=$1
lines=$(wc -l < "$filename")
lines_per_file=$((lines / 4))

# Split the file into 4 parts
split -l "$lines_per_file" "$filename" "${filename}_part_"

# Rename the last file if the total number of lines is not divisible by 4
if [ $((lines % 4)) -ne 0 ]; then
    mv "${filename}_part_aa" "${filename}_part_4"
    mv "${filename}_part_ab" "${filename}_part_3"
    mv "${filename}_part_ac" "${filename}_part_2"
    mv "${filename}_part_ad" "${filename}_part_1"
else
    mv "${filename}_part_aa" "${filename}_part_1"
    mv "${filename}_part_ab" "${filename}_part_2"
    mv "${filename}_part_ac" "${filename}_part_3"
    mv "${filename}_part_ad" "${filename}_part_4"
fi

echo "File '$filename' has been split into 4 parts."
