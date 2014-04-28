/*
* database/file operations for subtitle object.
* collection: subtitle
* {
*   _id: ObjectID(),
*   filemd5: '5eb63bbbe01eeed093cb22bb8f5acdc3',
*   PlayResX: '1920',
*   PlayResY: '1080',
*   download_count: 100,
* }
*
* collection: subtext
* {
*   _id: ObjectID(),
*   filemd5: '5eb63bbbe01eeed093cb22bb8f5acdc3',
*   data: ['0','5560','6900','Default','','0','0','0','','Subtitle text.']
* }
*
* */

var config = require('../config');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;

MongoClient.connect(config.mongodb, { db: { native_parser: true, w : 1 } }, function(err, db) {
    if (err) {
        throw err;
    }

    var collection = db.collection('subtitle');

    // increase download count.
    exports.download_count = function (filemd5, callback) {
        collection.update({
                filemd5: filemd5
            }, {
                $inc: { download_count: 1 }
            }, function(err) {
                if (err) {
                    return callback(err);
                }
                callback();
            });
    };

    exports.getSubInfo = function(PlayResX, PlayResY, filemd5, callback) {
        collection.findOne({
            filemd5: filemd5,
            PlayResX: PlayResX,
            PlayResY: PlayResY
        }, function(err, subinfo) {
            if (err) {
                return callback(err, null);
            }
            callback(null, subinfo);
        });
    };

    exports.addNewSubInfo = function(PlayResX, PlayResY, filemd5, callback) {
        collection.insert({
            filemd5: filemd5,
            PlayResX: PlayResX,
            PlayResY: PlayResY,
            download_count: 0
        }, {
            safe: true
        }, function(err) {
            if (err) {
                return callback(err, null);
            }
            collection.ensureIndex({
                filemd5: 1,
                PlayResX: -1,
                PlayResY: -1
            }, function(err) {
                if (err) {
                    return callback(err);
                }
                callback();
            });
        });
    };

    exports.generateSub = function(PlayResX, PlayResY, filemd5, callback) {

        // Script Info
        var scriptinfo = '[Script Info]\n' +
            'PlayResX: ' + PlayResX + '\n' +
            'PlayResY: ' + PlayResY + '\n';

        // Generate styles
        var styles = '[V4+ Styles]\n' +
            'Format: ' + config.format + '\n';
        config.styles.forEach(function(style) {
            styles += 'Style: ' + style + '\n';
        });

        // Add content
        var content = '[Events]\n' +
            'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n';

        var subTextCollection = db.collection('subtext');

        subTextCollection.find({
            filemd5: filemd5
        }).toArray(function(err, subtext) {
            if (err) {
                return callback(err);
            }
            subtext.forEach(function(text) {
                content += 'Dialogue: ' + text.data.join(',') + '\n';
            });

            // All information collected, now write to file.
            fs.writeFile(config.subtitle_path + filemd5 + '.ass', scriptinfo + '\n' + styles + '\n' + content, function (err) {
                if (err) {
                    return callback(err);
                }
                callback();
            });
        });
    };

    exports.addSub = function(filemd5, data, callback) {
        var subTextCollection = db.collection('subtext');

        subTextCollection.insert({
            filemd5: filemd5,
            data: data
        }, {
            safe: true
        }, function(err) {
            if (err) {
                return callback(err);
            }
            subTextCollection.ensureIndex({
                filemd5: 1
            }, function(err) {
                if (err) {
                    return callback(err);
                }

                // add subtitle data to file
                var content = 'Dialogue: ' + data.join(',') + '\n';

                fs.appendFile(config.subtitle_path + filemd5 + '.ass', content, function (err) {
                    if (err) {
                        return callback(err);
                    }
                    callback();
                });
            });
        });
    };

});