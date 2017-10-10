// How long to wait after a statusGood call to display statusBad, in milliseconds.
var waitTime = 5000;
var element = document.getElementById('status');
element.insertAdjacentHTML('beforeend', '<img id="status-icon" src="" alt="Status icon">');
var icon = document.getElementById('status-icon');

function statusGood(message) {
  icon.src = 'check.svg';
}

function statusBad(message) {
  icon.src = 'error.svg';
}
