const os = require('os');

module.exports = function() {
    return {
        indexAction: () => {
            return {
                'cpus': os.cpus(),
                'total_mem': os.totalmem(),
                'free_mem': os.freemem(),
            };
        }
    };
}