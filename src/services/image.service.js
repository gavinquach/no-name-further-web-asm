import { axiosTokenHeader, axiosFormData } from "./AxiosInstance"
const API_URL = require("./index");

class ImageService {
    uploadSingleImage(file) {
        return axiosFormData.post(API_URL + "/upload-single", file);
    }
    uploadMultipleImages(files) {
        return axiosFormData.post(API_URL + "/upload-multiple", files);
    }
}

export default new ImageService();