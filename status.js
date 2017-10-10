// How long to wait after a statusGood call to display statusBad, in seconds.
var waitTime = 5;
var lastStatus;

var element = document.getElementById('status');
element.insertAdjacentHTML('beforeend', '<img id="status-icon" src="">');
var icon = document.getElementById('status-icon');
element.insertAdjacentHTML('beforeend', '<p id="message-div"></p>');
var messageDiv = document.getElementById('message-div');

function statusGood(message) {
  lastStatus = new Date() / 1000;
  icon.src = 'check.svg';
  messageDiv.innerText = message;
}

function statusBad(message) {
  lastStatus = new Date() / 1000;
  icon.src = 'error.svg';
  messageDiv.innerText = message;
}

var intervalID = window.setInterval(check, 10000);

function check() {
  if (lastStatus > (new Date() / 1000) + waitTime) {
    statusBad('Disconnected');
  }
}
