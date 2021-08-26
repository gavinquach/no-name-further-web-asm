import axios from "axios";
const API_URL = require("./index");

class ItemService {
    viewAllItems() {
        return axios.get(API_URL + "/items");
    }
    viewOneItem(itemid) {
        return axios.get(API_URL + "/item/" + itemid);
    }

    createItem(files, config) {
        return axios.post(API_URL + "/item", files, config);
    }

    editItem(itemid, files, config) {
        return axios.put(API_URL + "/item/" + itemid, files, config);
    }

    deleteItem(id) {
        return axios.delete(API_URL + "/item/" + id);
    }
}

export default new ItemService();