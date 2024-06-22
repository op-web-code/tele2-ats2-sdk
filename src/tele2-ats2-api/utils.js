
/**
 * @param { import('../../types').ProxyHttp } [proxy]
 * @returns { import('axios').AxiosProxyConfig }
 */
const proxyHttpToAxiosProxy = (proxy) => {
  if (!proxy) {
    return false;
  }

  const axiosProxy = {
    host: proxy.host,
    port: proxy.port,
    auth:
      proxy.user && proxy.pass
        ? {
            username: proxy.user,
            password: proxy.pass,
          }
        : undefined,
  };

  return axiosProxy;
};

module.exports = {
  proxyHttpToAxiosProxy,
};
