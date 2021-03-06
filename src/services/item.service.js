import { axiosTokenHeader, axiosFormData } from "./AxiosInstance"
const API_URL = require("./index");

class ItemService {
    viewAllItems = () => {
        return axiosTokenHeader.get(API_URL + "items");
    }
    viewOneItem = async (itemid) => {
        return axiosTokenHeader.get(API_URL + "item/" + itemid);
    }

    createItem = (files) => {
        return axiosFormData.post(API_URL + "item", files);
    }

    editItem = (itemid, files) => {
        return axiosFormData.put(API_URL + "item/" + itemid, files);
    }

    deleteItem = (id) => {
        return axiosTokenHeader.delete(API_URL + "item/" + id);
    }

    getItemsByCategory = (category, page, limit) => {
        const url = `?category=${category.replace("/", "-")}&page=${page}&limit=${limit}`
        return axiosTokenHeader.get(API_URL + "items" + url);
    }

    getItems = (sort, page, limit) => {
        const url = `?sort=${sort}&page=${page}&limit=${limit}`
        return axiosTokenHeader.get(API_URL + "items" + url);
    }

    getItemsSortByField = (field, sort, page, limit) => {
        const url = `?field=${field}&sort=${sort}&page=${page}&limit=${limit}`
        return axiosTokenHeader.get(API_URL + "items-sorted-by-field" + url);
    }
}

export default new ItemService();