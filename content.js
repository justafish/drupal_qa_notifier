var addButton = function (files, index, testID) {
  var btn = document.createElement("button")
  chrome.storage.sync.get("subscriptions", function (item) {
    if (typeof item.subscriptions === "undefined") {
      item.subscriptions = {};
    }

    if (item.subscriptions[testID] === "undefined" || item.subscriptions[testID] !== testID) {
      var t = document.createTextNode("Subscribe");
      btn.appendChild(t);
    }
    else {
      var t = document.createTextNode("Subscribed");
      btn.appendChild(t);
    }
  });

  btn.onclick = function () {
    chrome.storage.sync.get("subscriptions", function (item) {
      if (typeof item.subscriptions === "undefined") {
        item.subscriptions = {};
      }

      item.subscriptions[testID] = testID;
      chrome.storage.sync.set({subscriptions: item.subscriptions});
      btn.innerHTML = "Subscribed";
    });
  };
  files[index].appendChild(btn);
};

var processTests = function (files) {
  for (var i = 0; i < files.length; i++) {
    var testID = files[i].getElementsByTagName('a')[0].href.split("/").pop();
    addButton(files, i, testID);
  }
}

// drupal.org Issues
var sent = document.querySelectorAll('li.pift-ci-sent');
processTests(sent);
var running = document.querySelectorAll('li.pift-ci-running');
processTests(running);
