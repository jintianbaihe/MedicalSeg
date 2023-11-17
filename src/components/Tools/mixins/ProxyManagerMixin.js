import { mapState } from 'vuex';

const pxmSubsKey = Symbol('ProxyManagerSubsKey');

export default {
  computed: mapState(['proxyManager']),
  mounted() {
    if (this.$options.proxyManager) {
      const pxm = this.proxyManager;
      const hooks = this.$options.proxyManager;

      this[pxmSubsKey] = [];

      const forwardMethod = (methodName) => {
        if (hooks[methodName]) {
          this[pxmSubsKey].push(pxm[methodName](hooks[methodName].bind(this)));
        }
      };

      forwardMethod('onProxyRegistrationChange');
      forwardMethod('onActiveSourceChange');
      forwardMethod('onActiveViewChange');

      if (hooks.onSourceDeletion) {
        this[pxmSubsKey].push(
          pxm.onProxyRegistrationChange((info) => {
            if (info.proxyGroup === 'Sources' && info.action === 'unregister') {
              hooks.onSourceDeletion(info.proxyId);
            }
          })
        );
      }
    }
  },
  beforeDestroy() {
    while (this[pxmSubsKey].length) {
      this[pxmSubsKey].pop().unsubscribe();
    }
  },
  methods: {
    forEachView(callback) {
      const pxm = this.proxyManager;
      pxm.getViews().forEach((view) => callback(view));
      this[pxmSubsKey].push(
        pxm.onProxyRegistrationChange((info) => {
          if (info.proxyGroup === 'Views' && info.action === 'register') {
            callback(info.proxy);
          }
        })
      );
    },

    forEachRepresentation(source, callback) {
      const pxm = this.proxyManager;
      pxm
        .getRepresentations()
        .filter((rep) => rep.getInput() === source)
        .forEach((view) => callback(view));
      this[pxmSubsKey].push(
        pxm.onProxyRegistrationChange((info) => {
          if (
            info.proxyGroup === 'Representations' &&
            info.action === 'register' &&
            info.proxy.getInput() === source
          ) {
            callback(info.proxy);
          }
        })
      );
    },
  },
};
