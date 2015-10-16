'use strict';

function request(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();

    xhr.open(method, url);
    xhr.onload = function (e) {
      if (this.status == 200) {
        resolve(this.responseText);
      }
      else {
        reject(this.status);
      }
    };

    xhr.onerror = function () {
      reject(this.status);
    };

    xhr.send();
  });
}
