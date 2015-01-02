var pubsub = (function () {
  'use strict';
	var subscriberList = {};
	window.publish = function (message, publisher, data) {
		var subscribers = subscriberList[message] || [];
		subscribers.forEach(function (subscriber) {
			subscriber.handleMessage(message, publisher, data);
		});
	};
	window.subscribe = function (message, subscriber) {
		if (!(subscriberList.hasOwnProperty(subscriber))) {
			subscriberList[message] = [];
		}
		subscriberList[message].push(subscriber);
	};
	window.unsubscribe = function (message, subscriber) {
		var index = subscriberList[message].indexOf(subscriber);
		subscriberList[message].splice(index, 1);
	};
}());
