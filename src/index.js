var io = require('socket.io');

/**
 * Mixin constructor
 * @param {string} url Namespace you want to subscribe to with socket.io
 */
var Mixin = function SocketMixin(url) {
  // private socket instance
  // TODO: determine if its a good idea to expose this or not...
  var socket = url ? io.connect(url) : io.connect();

  /**
  * Private helper method to determine if value exists and is a function
  * @param {Mixed} val The value you want to check
  */
  function existsAndFunc(val) {
    return val && {}.toString.call(val) === '[object Function]';
  }

  return {
    /**
    * Loop through all of our listeners and subscribe to the socket event
    */
    componentWillMount: function() {
      // TODO: determine if this should be kept in state
      this.socketEvents = {};

      if (!this.listeners) {
        throw new Error('SocketMixin requires listeners to be defined on the component');
      }

      for (var key in this.listeners) {
        if (this.listeners.hasOwnProperty(key)) {
          var listener = this.listeners[key];

          if (existsAndFunc(listener)) {
            this.socketEvents[key] = listener.bind(this);
            socket.on(key, this.socketEvents[key]);
          } else {
            throw new Error('Listener: "' + key + '" is not a function');
          }
        }
      }
    },

    /**
    * Clean up all of our even listeners
    */
    componentWillUnmount: function() {
      this.socketOffAll();
    },

    /**
    * Public method to emit a socket event to the server
    * @param {[type]} key     [description]
    * @param {[type]} payload [description]
    */
    socketEmit: function(key, payload) {
      if (key) {
        socket.emit(key, payload);
      }
    },

    /**
    * Public method to subscribe to socket event just in case you remove
    * your subscription and want to add it back on at a later time.
    *
    * Note: this will reference an existing event on the listeners property
    *
    * @param {string} key The event name youw wish to subscribe to
    */
    socketOn: function(key) {
      if (this.listeners && key) {
        this.socketEvents[key] = this.listeners[key].bind(this);
        socket.on(key, this.socketEvents[key]);
      }
    },

    /**
    * Public method to remove a specific listener from the component
    * @param {string} key The event name you wish to remove
    */
    socketOff: function(key) {
      if (this.listeners && key) {
        if (existsAndFunc(this.listeners[key])) {
          socket.removeListener(key, this.socketEvents[key]);
          this.socketEvents[key] = null; //gc
        }
      }
    },

    /**
    * Public method for removing all listeners for the component
    */
    socketOffAll: function() {
      if (this.listeners) {
        for (var key in this.listeners) {
          if (this.listeners.hasOwnProperty(key)) {
            if (existsAndFunc(this.listeners[key])) {
              socket.removeListener(key, this.socketEvents[key]);
            }
          }
        }

        // garbage collect our socketEvents object
        this.socketEvents = null;
      }
    },
  };
};

module.exports = Mixin;
