// =======================
// OLD CODE

// const model = require("../models");
// const Image = model.image;

// exports.uploadImage = (req, res) => {
//     const img = new Image({
//         name: req.body.name,
//         size: req.body.size,
//         type: req.body.type,
//         upload_date: req.body.upload_date,
//         data_url: req.body.data_url,
//         item: req.body.item
//     });

//     Item.findById(req.body.id)
//         .exec((err, item) => {
//             if (err) return res.status(500).send({ message: err });
//             if (!item) return res.status(404).send({ message: "Item not found." });

//             img.save(err => {
//                 if (err) return res.status(500).send({ message: err });
//                 res.send({ message: "Image uploaded successfully!" });
//             });
//         });
// };

// exports.deleteImage = (req, res) => {
//     Image.findByIdAndRemove({ _id: req.params.id }, function (err, image) {
//         if (err) return res.status(500).send({ message: err });
//         if (!image) return res.status(404).send({ message: "Image not found." });
//         res.json('Image successfully removed');
//     });
// };

// exports.getImage = (req, res) => {
//     Image.findById({ _id: req.params.id }, function (err, image) {
//         if (err) return res.status(500).send({ message: err });
//         if (!image) return res.status(404).send({ message: "Image not found." });
//         res.json(image);
//     });
// };

// OLD CODE
// =======================

const img = require("../config/img.config");
const fs = require("fs");

exports.uploadSingle = async (req, res) => {
    try {
        if (req.file == undefined) {
            return res.status(404).send({ message: "Incorrect file type or file not found" });
        }

        res.status(200).send({
            message: "File uploaded successfully: " + req.file.originalname,
        });
    } catch (err) {
        if (err.code == "LIMIT_FILE_SIZE") {
            return res.status(500).send({
                message: `File size cannot be larger than ${img.maxSize / (1024 * 1024)} MB!`,
            });
        }

        res.status(500).send({
            message: `Error uploading file. ${err}`,
        });
    }
};

exports.uploadMultiple = async (req, res) => {
    try {
        if (req.files.length <= 0) {
            return res.send("You must upload at least 1 file.");
        }

        if (req.files == undefined) {
            return res.status(404).send({ message: "Incorrect file type or file not found" });
        }

        res.status(200).send({ message: "Files uploaded successfully." });
    } catch (err) {
        if (err.code == "LIMIT_FILE_SIZE") {
            return res.status(500).send({
                message: `File size cannot be larger than ${img.maxSize / (1024 * 1024)} MB!`,
            });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.send("Max number of file upload exceeded!");
        }

        res.status(500).send({
            message: `Error uploading: ${err}`,
        });
    }
};

exports.getListFiles = async (req, res) => {
    fs.readdir(img.path, function (err, files) {
        if (err) return res.status(500).send({ message: "Unable to scan files!", });
        if (!files) return res.status(404).send({ message: "Files not found." });

        let fileInfos = [];

        files.forEach((file) => {
            fileInfos.push({
                name: file,
                url: req.get('host') + "/images/" + file,
            });
        });

        res.status(200).send(fileInfos);
    });
};
