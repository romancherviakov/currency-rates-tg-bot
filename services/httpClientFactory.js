module.exports = ({
    logger,
    axios,
    setupCache
}) => {
    return {
        createHttpClient: (cacheTtlMilliseconds) => {
            const cache = setupCache({
                maxAge: cacheTtlMilliseconds
            });

            const api = axios.create({
                adapter: cache.adapter
            });

            return {
                get: async (url) => {
                    logger.info();
                    return api({
                        url: url,
                        method: 'get'
                    });
                }
            }
        }
    }
}
