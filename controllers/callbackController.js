module.exports = () => {
    return {
        callbackAction: (req, res) => {
            console.log(req.body);
            res.send({status: 200})
        }
    }
}