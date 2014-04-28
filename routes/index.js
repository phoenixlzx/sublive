var express = require('express');
var fs = require('fs');
var router = express.Router();

var timestamps = require('timestamps');

var config = require('../config');
var subtitle = require('../models/subtitle');


/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Express' });
});

// GET subtitle via PlayResX, PlayResY and file MD5.
// TODO: implement safe cache for subtitle files.
router.get('/fetchsub/ssa/:PlayResX/:PlayResY/:filemd5', checkReq, function(req, res) {
    // check if file exists.
    var reqFilename = config.subtitle_path + req.params.filemd5 + '.ass';
    fs.exists(reqFilename, function(exists) {
        if (exists) {
            res.download(reqFilename, req.params.filemd5 + '.ass', function(err) {
                if (err) {
                    console.log(err.message);
                    // ...?
                }
                subtitle.download_count(req.params.filemd5, function(err) {
                    if (err) {
                        console.log(err.message);
                    }
                });
            });
        } else {
            // file not found, update database and create a new subtitle file.
            // Note: the file maybe just deleted or lost, information may already stored in db.
            // check if we already have subtitle data
            subtitle.getSubInfo(req.params.PlayResX, req.params.PlayResY, req.params.filemd5, function(err, subinfo) {
                if (subinfo) {
                    // data found, generate new file and send to client.
                    subtitle.generateSub(req.params.PlayResX, req.params.PlayResY, req.params.filemd5, function(err) {
                        if (err) {
                            return res.send(500);
                        }
                        res.download(reqFilename, req.params.filemd5 + '.ass', function(err) {
                            if (err) {
                                console.log(err.message);
                                // ...?
                            }
                            subtitle.download_count(req.params.filemd5, function(err) {
                                if (err) {
                                    console.log(err.message);
                                }
                            });
                        });
                    });
                } else {
                    // data not found. create new subtitle data and generate subtitle file.
                    subtitle.addNewSubInfo(req.params.PlayResX, req.params.PlayResY, req.params.filemd5, function(err) {
                        if (err) {
                            return res.send(500);
                        }
                        subtitle.generateSub(req.params.PlayResX, req.params.PlayResY, req.params.filemd5, function(err) {
                            if (err) {
                                return res.send(500);
                            }
                            res.download(reqFilename, req.params.filemd5 + '.ass', function(err) {
                                if (err) {
                                    // ...?
                                }
                                subtitle.download_count(req.params.filemd5, function(err) {
                                    if (err) {
                                        console.log(err.message);
                                    }
                                });
                            });
                        });
                    });
                }
            });
        }
    });
});

router.post('/addsub/ssa', function(req, res) {

    // subtitle data
    // Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
    var subtext = [
        req.body.layer,
        timestamps.ass(req.body.start),
        timestamps.ass(req.body.end),
        req.body.style,
        req.body.name,
        req.body.marginl,
        req.body.marginr,
        req.body.marginv,
        req.body.effect,
        req.body.text
    ];

    subtitle.addSub(req.body.filemd5, subtext, function(err) {
        if (err) {
            return res.send(500);
        }
        res.send(200);
    });
});

module.exports = router;

function checkReq(req, res, next) {
    // regexp to check valid MD5 string.
    var isMD5 = new RegExp(/^[a-f0-9]{32}$/);
    if (isMD5.test(req.params.filemd5)) {
        next();
    } else {
        return res.send(400);
    }
}

