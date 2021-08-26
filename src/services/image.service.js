import axios from "axios";
const API_URL = require("./index");

class ImageService {
    uploadSingleImage(file, config) {
        return axios.post(API_URL + "/upload-single", file, config);
    }
    uploadMultipleImages(files, config) {
        return axios.post(API_URL + "/upload-multiple", files, config);
    }
}

export default new ImageService();