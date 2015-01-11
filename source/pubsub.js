/*global RM*/
RM.subscriberList = {};
RM.publish = function (message, publisher, data) {
  'use strict';
  var s, subscribers;
  subscribers = RM.subscriberList[message] || [];
  for (s in subscribers) {
    if (subscribers.hasOwnProperty(s)) {
      subscribers[s].handleMessage(message, publisher, data);
    }
  }
};
RM.subscribe = function (message, subscriber) {
  'use strict';
  if (!(RM.subscriberList.hasOwnProperty(subscriber))) {
    RM.subscriberList[message] = [];
  }
  RM.subscriberList[message].push(subscriber);
};
RM.unsubscribe = function (message, subscriber) {
  'use strict';
  var index = RM.subscriberList[message].indexOf(subscriber);
  RM.subscriberList[message].splice(index, 1);
};
