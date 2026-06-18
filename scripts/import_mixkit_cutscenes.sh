#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="$ROOT_DIR/Content/Daesseuyo/Source/Videos/Mixkit"
OUTPUT_DIR="$ROOT_DIR/Content/Daesseuyo/Generated/Videos"

mkdir -p "$SOURCE_DIR" "$OUTPUT_DIR"

download() {
  local url="$1"
  local target="$2"
  if [[ ! -s "$target" ]]; then
    curl -L "$url" -o "$target"
  fi
}

download "https://assets.mixkit.co/videos/853/853-720.mp4" "$SOURCE_DIR/batter-hits-a-baseball-853.mp4"
download "https://assets.mixkit.co/videos/881/881-720.mp4" "$SOURCE_DIR/baseball-pitcher-881.mp4"
download "https://assets.mixkit.co/videos/855/855-720.mp4" "$SOURCE_DIR/baseball-player-slides-into-base-855.mp4"

common_video_filter="scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps=30,setsar=1,eq=contrast=1.08:saturation=1.05,format=yuv420p"

ffmpeg -hide_banner -y \
  -ss 2.2 -t 2.15 -i "$SOURCE_DIR/batter-hits-a-baseball-853.mp4" \
  -ss 3.35 -t 1.55 -i "$SOURCE_DIR/baseball-pitcher-881.mp4" \
  -filter_complex "[0:v]${common_video_filter}[hit];[1:v]${common_video_filter}[watch];[hit][watch]concat=n=2:v=1:a=0[out]" \
  -map "[out]" -an -c:v libx264 -preset veryfast -crf 24 -movflags +faststart "$OUTPUT_DIR/homer.mp4"

ffmpeg -hide_banner -y \
  -ss 10.4 -t 3.4 -i "$SOURCE_DIR/baseball-player-slides-into-base-855.mp4" \
  -vf "$common_video_filter" \
  -an -c:v libx264 -preset veryfast -crf 24 -movflags +faststart "$OUTPUT_DIR/score.mp4"

ffmpeg -hide_banner -y \
  -ss 1.8 -t 3.15 -i "$SOURCE_DIR/baseball-pitcher-881.mp4" \
  -vf "$common_video_filter" \
  -an -c:v libx264 -preset veryfast -crf 24 -movflags +faststart "$OUTPUT_DIR/strikeout.mp4"

for name in homer score strikeout; do
  ffmpeg -hide_banner -y -i "$OUTPUT_DIR/${name}.mp4" \
    -an -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 "$OUTPUT_DIR/${name}.webm"
done

printf 'Imported Mixkit stock cutscenes into %s\n' "$OUTPUT_DIR"
