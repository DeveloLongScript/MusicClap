const { contextBridge, ipcRenderer } = require('electron')

function waitForElementToDisplay(selector, callback, checkFrequencyInMs, timeoutInMs) {
  var startTimeInMs = Date.now();
  (function loopSearch() {
    if (document.querySelector(selector) != null) {
      callback();
      return;
    }
    else {
      setTimeout(function () {
        if (timeoutInMs && Date.now() - startTimeInMs > timeoutInMs)
          return;
        loopSearch();
      }, checkFrequencyInMs);
    }
  })();
}

process.once('loaded', () => {

  waitForElementToDisplay("#closeWindow", function () {
    var elm = document.getElementById("closeWindow")

    function close() {
      ipcRenderer.send("close")
    }

    elm.addEventListener("click", close)


  }, 1000)
  waitForElementToDisplay("#closeWindowB", function () {
    var elm = document.getElementById("closeWindowB")

    function close() {
      ipcRenderer.send("closeB")
    }

    elm.addEventListener("click", close)


  }, 1000)

  waitForElementToDisplay("#closeWindowC", function () {
    var elm = document.getElementById("closeWindowC")

    function close() {
      ipcRenderer.send("closeC")
    }

    elm.addEventListener("click", close)


  }, 1000)

  waitForElementToDisplay("#openGit", function () {
    var elm = document.getElementById("openGit")

    function close() {
      ipcRenderer.send("openGitHubPage")
    }

    elm.addEventListener("click", close)


  }, 1000)
  waitForElementToDisplay("#settings", function () {
    var elm = document.getElementById("settings")

    function close() {
      ipcRenderer.send("openSettings")
    }

    elm.addEventListener("click", close)


  }, 1000)
  waitForElementToDisplay("#devModeSwitch", function () {
    var elm = document.getElementById("devModeSwitch")
    elm.addEventListener("change", () => {
      ipcRenderer.send("devMode", elm.checked)
      
    })
    
    var client = new XMLHttpRequest();
    client.open('GET', '../settings.json');
    client.onreadystatechange = function() {
      json = JSON.parse(client.responseText);
      elm.checked = json.config.devMode
    }
    client.send();

  }, 1000)

  

})
