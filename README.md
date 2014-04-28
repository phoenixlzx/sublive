SubLive
=======

SubLive is a live ass subtitle API server (live subtitles "彈幕" for local player).

This is the API server on behalf of the beloved KNA subtitle team's idea.

(Under construction)

## API

### Fetch subtitle

* Method: `GET`
* Path: `/fetchsub/ssa/<PlayResX>/<PlayResY>/<filemd5>`

### Add subtitle

Subtitle format: `Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`

* Method: `POST`
* Path: `/addsub/ssa`
* data:
  - `layer`
  - `start` (in millisec format, e.g., '5560')
  - `end` (in millisec format, e.g., '6900')
  - `style`
  - `name`
  - `marginl`
  - `marginr`
  - `marginv`
  - `effect`
  - `text`

All field type is String and required, however, some of them can be empty.

## Resources for client

* [libjass](https://github.com/Arnavion/libjass) - A library to render ASS subtitles on HTML5 video in the browser.
* [timestamps](https://github.com/Daiz-/timestamps) - Parse and format video and ASS subtitle timestamps.
