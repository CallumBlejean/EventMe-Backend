const endPoints = require("../endPoints.json")

exports.fetchEndPoints = () => {
    return Promise.resolve(endPoints)
}