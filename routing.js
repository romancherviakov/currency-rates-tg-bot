module.exports = (container, app) => {
    app.get('/_health', (req, res) => container
        .resolve('healthController')
        .indexAction(req,res)
    );

    app.post('/callback', (req,res) => container
        .resolve('callbackController')
        .callbackAction(req, res)
    );
};
