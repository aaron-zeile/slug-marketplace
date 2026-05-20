#!/bin/bash
printf "%20s  %10s %10s %10s\n" "$name" "Added" "Removed" "Total"
git log --format='%aN' | sort -u | 
while read name
do 
  printf "%20s: " "$name"
  git log --author="$name" --pretty=tformat: --numstat | 
  LC_ALL=en_US.UTF-8 \
  awk ' \
    { add += $1; subs += $2; loc += $1 - $2 } END \
    { printf "%\04710d %\04710d %\04710d\n", add, subs, loc } \
  ' - 
done