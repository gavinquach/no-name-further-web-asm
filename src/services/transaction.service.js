import axios from "axios";
const API_URL = require("./index");

class TransactionService {
    createTransaction(itemid, userid) {
        return axios.post(API_URL + "/transaction", {
            itemid,
            userid
        });
    }

    deleteTransaction(id) {
        return axios.delete(API_URL + "/transaction/" + id);
    }

    cancelTransaction(itemid, userid) {
        return axios.patch(API_URL + "/cancel/transaction", {
            itemid,
            userid
        });
    }

    getAllTransactions() {
        return axios.get(API_URL + "/transactions");
    }
    getTransactionsByBuyer(userid) {
        return axios.get(API_URL + "/transactions/buyer/" + userid);
    }
    getTransactionsBySeller(userid) {
        return axios.get(API_URL + "/transactions/seller/" + userid);
    }
    getTransactionsByItem(itemid) {
        return axios.get(API_URL + "/transactions/item/" + itemid);
    }
}

export default new TransactionService();