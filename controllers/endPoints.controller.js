const { fetchEndPoints } = require("../models/endPoints.model")

exports.getEndPoints = (req, res, next) => {
    fetchEndPoints()
    .then(endpoint => {
        res.status(200).send(endpoint)
    })
    .catch((err) => {
        next(err)
    })

}