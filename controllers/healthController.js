const os = require('os');

module.exports = function() {
    return {
        indexAction: (req, res) => {
            return res.send({
                'cpus': os.cpus(),
                'total_mem': os.totalmem(),
                'free_mem': os.freemem(),
            });
        }
    };
}