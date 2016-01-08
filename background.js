chrome.runtime.onInstalled.addListener(onInit);
chrome.alarms.onAlarm.addListener(onAlarm);

function onInit() {
  chrome.alarms.create('watchdog', {periodInMinutes: 1});
  onWatchdog();
}

function onAlarm(alarm) {
  if (alarm && alarm.name == 'watchdog') {
    onWatchdog();
  }
}

function onWatchdog() {
  chrome.alarms.get('watchdog', function (alarm) {
    if (alarm) {
      chrome.storage.sync.get("subscriptions", function(item) {
        if (typeof item.subscriptions === "undefined") {
          item.subscriptions = {};
        }

        var subscriptions = [];
        for (var prop in item.subscriptions) {
          if (item.subscriptions.hasOwnProperty(prop)) {
            subscriptions.push((prop));
          }
        }

        if (subscriptions.length > 0) {
          for (var i = 0; i < tests.length; i++) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "https://www.drupal.org/api-d7/pift_ci_job/" + tests + ".json", true);
            xhr.onreadystatechange = function () {
              if (xhr.readyState === 4 && typeof xhr.responseText !== "undefined") {
                try {
                  var test = JSON.parse(xhr.responseText);
                  if (test.status == "complete") {

                    item.subscriptions[test.job_id] = null;
                    delete item.subscriptions[test.job_id];

                    if (!("Notification" in window)) {
                    }
                    else if (Notification.permission === "granted") {
                      // If it's okay let's create a notification
                      showResultNotification(test);
                    }
                    else if (Notification.permission !== 'denied') {
                      Notification.requestPermission(function (permission) {

                        // Whatever the user answers, we make sure we store the information
                        if (!('permission' in Notification)) {
                          Notification.permission = permission;
                        }

                        if (permission === "granted") {
                          showResultNotification(test);
                        }
                      });
                    }
                  }
                }
                catch(e) {}
                finally {
                  chrome.storage.sync.set({subscriptions: item.subscriptions});
                }
              }
            };
            xhr.send();
          }
        }
      });
    }
  });
}

function showResultNotification(test) {
  var notification = new Notification(test.title, {
    body: 'Completed',
    icon: '48.png'
  });
  notification.onclick = function () {
    if (typeof test.issue_nid !== "undefined" && test.issue_nid.length > 0) {
      window.open('https://www.drupal.org/node/' + test.issue_nid);
    }
    else {
      window.open(test.url);
    }
  }
  notification.show();
}
