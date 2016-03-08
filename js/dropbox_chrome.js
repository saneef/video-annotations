import Utils from 'utils.js';
import Dropbox from 'vendor/dropbox.js';

var Chrome = function (clientOptions) {
  this.clientOptions = clientOptions;
  this._userInfo = null;
  this.onClient = new Dropbox.Util.EventSource();
};

Chrome.prototype.client = function (callback) {
  var client;
  var _this = this;
  client = new Dropbox.Client(this.clientOptions);
  client.authDriver(new Dropbox.AuthDriver.ChromeExtension({
    receiverPath: 'html/chrome_oauth_receiver.html',
  }));
  client.authenticate({ interactive: false }, function () {
    client.onAuthStepChange.addListener(function () {
      return (_this._userInfo = null);
    });

    _this.onClient.dispatch(client);
    return callback(client);
  });
};

Chrome.prototype.userInfo = function () {
  chrome.storage.local.get(Utils.userInfo, (function (_this) {
    return function (items) {
      var parseError;
      if (items && items[Utils.userInfo]) {
        try {
          _this._userInfo = Dropbox.AccountInfo.parse(items[Utils.userInfo]);
          return true;
        } catch (error) {
          parseError = error;
          _this._userInfo = null;
        }
      }

      _this.client(function (client) {
        if (!client.isAuthenticated()) {
          _this._userInfo = {};
          return false;
        }

        client.getUserInfo(function (error, userInfo) {
          if (error) {
            _this._userInfo = {};
            return false;
          }

          var opt = {};
          opt[Utils.userInfo] = userInfo.json();
          chrome.storage.local.set(opt, function () {
            _this._userInfo = userInfo;
          });
        });
      });
    };
  })(this));
};

Chrome.prototype.signOut = function (callback) {
  return this.client((function (_this) {
    return function (client) {
      if (!client.isAuthenticated()) {
        return callback();
      }

      return client.signOut(function () {
        _this._userInfo = null;
        return chrome.storage.local.remove(Utils.userInfo, function () {
          return callback();
        });
      });
    };
  })(this));
};

Dropbox.Chrome = Chrome;

export default Dropbox;
