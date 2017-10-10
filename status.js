// How long to wait after a statusGood call to display statusBad, in milliseconds.
var waitTime = 5000;

var element = document.getElementById('status');
element.insertAdjacentHTML('beforeend', '<img id="status-icon" src="">');
var icon = document.getElementById('status-icon');
element.insertAdjacentHTML('beforeend', '<p id="message-div"></p>');
var messageDiv = document.getElementById('message-div');

function statusGood(message) {
  icon.src = 'check.svg';
  messageDiv.innerText = message;
}

function statusBad(message) {
  icon.src = 'error.svg';
  messageDiv.innerText = message;
}
