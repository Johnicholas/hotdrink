(function () {

  var proxies = hd.__private.proxies = {};

  /* Proxies are functions. Since we cannot subclass Function, any methods
   * that we want every proxy to have must be copied onto each one. Further,
   * any instance data (e.g. the variable proxied) must be hidden under a
   * special member. */

  var PROTO_NAME = hd.PROTO_NAME = "__hd_proto__";

  /* Make the "prototype" for proxies publicly extensible. */
  var proto = hd.proxy = {};

  proto.unwrap = function unwrap() { return this[PROTO_NAME]; };

  proto.subscribe = function subscribe() {
    var vv = this.unwrap();
    return vv.subscribe.apply(vv, arguments);
  };

  proxies.finishProxy = function finishProxy(vv, proxy) {
    ASSERT(!vv.proxy, "only one proxy should exist per variable");
    vv.proxy          = proxy;
    proxy[PROTO_NAME] = vv;
    Object.keys(proto).forEach(function (key) {
      proxy[key] = proto[key];
    });
    return proxy;
  };

  /**
   * @name is
   * @methodOf hd.__private.Variable
   * @param {Unknown} proxy
   * @returns {boolean} True if the argument is a {@link concept.model.Proxy}.
   */
  hd.isProxy = function isProxy(unknown) {
    /* Cannot use Object.hasOwnProperty on functions. */
    return (typeof unknown === "function") && (PROTO_NAME in unknown);
  };

}());

