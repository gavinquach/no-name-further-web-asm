const model = require("../models");
const ItemCategory = model.itemCategory;
const Transaction = model.transaction;


// ============= Duong Work for Advanced API  =============
// Duong'version with Pagination/ Filtering / Sorting  from Duong development branch

// Create API Features object to implement in other model if needed
// The default sorting is sort by _id
class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
        this.totalPage = 0;
    }

    // Advanced filtering with
    // greater than, greater than or equal to,
    // less than, less than or equal to
    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ["page", "sort", "limit", "fields", "category"];
        excludedFields.forEach(el => delete queryObj[el]);

        let queryStr = JSON.stringify(queryObj);

        // Replace all case with new string including $ sign before for mongoose query
        queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}`);

        // initialize query based on param
        this.query = this.query.find(JSON.parse(queryStr))
        return this;
    }

    // Sorting (sort a field by ascending or descending)
    sort() {
        if (this.queryString.sort) {
            // split elements to sort
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy)
        } else {
            this.query = this.query.sort('_id');
        }
        return this;
    }

    // Field limiting
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    // // Pagination with param page, and object limit per page
    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        
        return this;
    }

    // Filter by category 
    async filterByCategory() {
        if (this.queryString.category && this.queryString.category !== "undefined") {
            const category = await ItemCategory.findOne({
                name: this.queryString.category.replace("-", "/")
            }).exec();

            this.query = this.query.find(JSON.parse(`{"type":"${category._id}"}`));
        }

        return this;
    }


}

module.exports = APIFeatures;