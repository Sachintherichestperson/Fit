const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
    CompanyName: String,
    CompanyType: String,
    CompanyURL: String,
    CompanyEmail: String,
    CompanyMobile: String,
    CompanyRepresentation: String,
    CompanyDesignation: String,
    CompanyLogo: String,
    TotalInvestment: Number,
    Challenges: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge'
    }],
    Products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    Analytics: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Analytics'
    }],
});

module.exports = mongoose.model('Brand', BrandSchema);