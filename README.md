SubLive
=======

SubLive is a live ass subtitle API server (live subtitles "彈幕" for local player).

This is the API server on behalf of the beloved KNA subtitle team's idea.

(Under construction)

## Get started

### Requirements:

* Linux
* Node.js 0.10.26+
* MongoDB 2.4+

### Setup

* `git clone https://github.com/phoenixlzx/sublive.git && cd sublive`
* `npm install`
* `cp config.js.example config.js` and edit `config.js` for your need.
* `NODE_ENV=development DEBUG=sublive ./bin/sublive`

If you are using it in prodcution environment, change `NODE_ENV=development` to `NODE_ENV=production`.

## API

* `filemd5` - File md5 hash for matching corresponding subtitle
* `PlayResX` - Width of video file
* `PlayResY` - Height of video file

### Fetch subtitle

* Method: `GET`
* Path: `/fetchsub/ssa/<PlayResX>/<PlayResY>/<filemd5>`

### Add subtitle

Subtitle format: `Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`

* Method: `POST`
* Path: `/addsub/ssa`
* data:
  - `filemd5`
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
