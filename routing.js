module.exports = (container, express) => {
    express.get('/_health', (req, res) => {
        let data = container.resolve('healthController').indexAction();
        res.send({status: 200, data });
    });
    express.post('/callback', (req,res) => {
        container.resolve('callbackController').callbackAction(req.body).then((data) => {
            res.send(data)
        }).catch((err) => {
            res.send({status: 500, error: err.message})
        });
    });
}
