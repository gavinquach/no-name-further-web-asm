import { axiosTokenHeader } from "./AxiosInstance"
const API_URL = require("./index");

class TransactionService {
    createTransaction(itemid, userid) {
        return axiosTokenHeader.post(API_URL + "/transaction", {
            itemid,
            userid
        });
    }

    deleteTransaction(id) {
        return axiosTokenHeader.delete(API_URL + "/transaction/" + id);
    }

    cancelTransaction(itemid, userid) {
        return axiosTokenHeader.patch(API_URL + "/cancel/transaction", {
            itemid,
            userid
        });
    }

    getAllTransactions() {
        return axiosTokenHeader.get(API_URL + "/transactions");
    }
    getTransactionsByBuyer(userid) {
        return axiosTokenHeader.get(API_URL + "/transactions/buyer/" + userid);
    }
    getTransactionsBySeller(userid) {
        return axiosTokenHeader.get(API_URL + "/transactions/seller/" + userid);
    }
    getTransactionsByItem(itemid) {
        return axiosTokenHeader.get(API_URL + "/transactions/item/" + itemid);
    }
}

export default new TransactionService();