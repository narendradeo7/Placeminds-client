const mongoose = require("mongoose");

const driveSchema = new mongoose.Schema({
    name: { type: String, required: true },
    profile: { type: String, required: true },
    location: { type: String, required: true },
    ctc: { type: String, required: true },
    branch: { type: Array, required: true },
    year: { type: String, required: true },
    deadline: { type: String, required: true},
    drivecode: { type: String, required: true },
    totalapplied: {type: Number, default: 0},
    publishDate: {type: Date, default: Date.now}
})

const Drive = mongoose.model('drive', driveSchema);

module.exports = Drive