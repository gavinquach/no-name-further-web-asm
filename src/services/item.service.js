import { axiosTokenHeader, axiosFormData } from "./AxiosInstance"
const API_URL = require("./index");

class ItemService {
    viewAllItems() {
        return axiosTokenHeader.get(API_URL + "items");
    }
    viewOneItem(itemid) {
        return axiosTokenHeader.get(API_URL + "item/" + itemid);
    }

    createItem(files) {
        return axiosFormData.post(API_URL + "item", files);
    }

    editItem(itemid, files) {
        return axiosFormData.put(API_URL + "item/" + itemid, files);
    }

    deleteItem(id) {
        return axiosTokenHeader.delete(API_URL + "item/" + id);
    }
}

export default new ItemService();