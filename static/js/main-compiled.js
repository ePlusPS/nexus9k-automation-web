'use strict';

/**
 * The application was designed to be editable online, therefore the current
 * selections are not kept persistent - they are generated on the fly. This
 * is because a field could be edited online, and any persistent data would
 * not be useable in conversions.
 */

// Need CSV to array (Papaparse)
// Need CSV to Table (no library)
// Need Table to CSV (no library)
// ^ No relation
//
// Select CSV: Get CSV -> table
// Upload CSV: Get CSV -> table
// Generate CLI: Table -> CSV -> Input into tool
// Convert: CLI -> Input into tool

function csvToTable(csv) {
  var parsedCsv = Papa.parse(csv, {
    // sets the first row as keys for the other rows
    header: true,

    // prevent empty rows causing errors with header keys (often empty last row)
    skipEmptyLines: true
  });

  if (parsedCsv.errors.length > 0) {
    throw 'Could not parse csv';
  }

  var thead = parsedCsv.meta.fields.reduce(function (tablePartial, item) {
    return tablePartial += '<th>' + item + '</th>';
  }, '');

  var tbody = parsedCsv.data.reduce(function (tablePartial, item) {
    var row = parsedCsv.meta.fields.reduce(function (tableRowPartial, item2) {
      return tableRowPartial += '<td contenteditable="true">' + item[item2] + '</td>';
    }, '');

    return tablePartial += '<tr>' + row + '</tr>';
  }, ''); // to add row numbers `${index}` initial value

  return '<table><thead><tr>' + thead + '</tr></thead><tbody>' + tbody + '</tbody></table>';
}

function tableToCsv(table, url) {
  var elements = [].slice.call(table.tHead.children).concat([].slice.call(table.tBodies[0].children));

  return elements.reduce(function (csvPartial, tr) {
    var row = [].slice.call(tr.children).reduce(function (trPartial, td) {
      return trPartial += td.textContent + ',';
    }, '');

    return csvPartial += row.slice(0, -1) + (url ? '^' : '\n\r');
  }, '');
}

function generateFileDownload(content, type, fileName) {
  var a = document.createElement('a');

  a.href = encodeURI('data:attachment/' + type + ',' + content);

  a.target = '_BLANK';
  a.download = fileName;

  document.body.appendChild(a);

  return a;
}

var nexusConfigTableContainer = document.getElementById('nexus-config-table-container');

/*
document.getElementById('generate_config_cli').addEventListener('click', (event) => {
  let nexusConfigTable = nexusConfigTableContainer.querySelector('table');

  if (nexusConfigTable) {
    generateFileDownload(tableToCsv(nexusConfigTable), 'csv', 'nexus_config.csv').click();
  }
});
*/

document.getElementById('generate_config_cli').addEventListener('click', function (event) {
  document.location.href = 'http://104.236.21.104:9090/nexus_config_cli/convert/?config_csv=' + tableToCsv(nexusConfigTableContainer.querySelector('table'), 'url');
});

document.getElementById('code_file').addEventListener('change', function (event) {
  document.getElementById('file_button').innerHTML = this.value.split(/(\\|\/)/g).pop();
});

function updateList(current) {
  var listt = '';

  for (var file in localStorage) {
    var selected = file == current ? 'class="selected"' : '';
    listt += '<li ' + selected + '><button class="appearance-none">' + file + '</button> <i class="fa fa-download"></i></li>';
  }

  document.querySelector('#nexus-config-table-container').innerHTML = csvToTable(localStorage.getItem(current));
  document.getElementById('selector-files').innerHTML = listt;

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = document.querySelectorAll('#file-selector li')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var li = _step.value;

      li.querySelector('.fa-download').addEventListener('click', function (event) {
        var csv = '';

        if (this.previousElementSibling.textContent == current) {
          csv = tableToCsv(document.querySelector('#nexus-config-table-container table'));
        } else {
          csv = localStorage.getItem(this.previousElementSibling.textContent);
        }

        generateFileDownload(csv, 'csv', this.previousElementSibling.textContent).click();
      });

      li.querySelector('button').addEventListener('click', function (event) {
        document.querySelector('#file-selector .selected').classList.remove('selected');

        this.parentElement.classList.add('selected');

        document.querySelector('#nexus-config-table-container').innerHTML = csvToTable(localStorage.getItem(event.target.textContent));
      });
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator['return']) {
        _iterator['return']();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

request('../static/nexus_config.csv?v=1').then(function (nexusConfigCsv) {
  var csv = csvToTable(nexusConfigCsv);

  document.querySelector('#nexus-config-table-container').innerHTML = csv;

  /*
  if (!localStorage.getItem('Default.csv')) {
    localStorage.setItem('Default.csv', nexusConfigCsv);
  }

  updateList('Default.csv');
  */
});

document.getElementById('upload-config-file').addEventListener('change', function (event2) {
  var _this = this;

  var reader = new FileReader();

  reader.onload = function (event) {
    var contents = event.target.result;
    var name = _this.value.split(/(\\|\/)/g).pop();

    localStorage.setItem(name, contents);

    updateList(name);
  };

  reader.readAsText(event.target.files[0]);
});

function currentAutomation(current, previous) {
  document.getElementById(current).style.display = 'block';

  if (previous) {
    document.getElementById(previous).style.display = 'none';
  }
}

var previous = 'NX-API';

currentAutomation(previous);

document.getElementById('automation-select').addEventListener('change', function (event) {
  currentAutomation(event.target.value, previous);
  previous = event.target.value;
});

$(function () {
  $('#nxapi_code_convert').click(function () {
    var error_msg = 'Please check the error below.\n\n';
    var error_flag = false;
    var code_file = $('#code_file').val();

    if (code_file == 0) {
      error_msg += ' * Need to upload CLI Text file.\n';
      error_flag = true;
    }

    var ext = jQuery('#code_file').val().split('.').pop().toLowerCase();
    if (jQuery.inArray(ext, ['txt']) == -1) {
      error_msg += ' *  Invalid extension for file. Only \'txt\' files are supported..\n';
      error_flag = true;
    }

    if (error_flag == true) {
      alert(error_msg);
      return false;
    } else {
      var fileInput = document.getElementById('code_file');
      var file = fileInput.files[0];
      var code_filename = file.name.split('.')[0];

      if (file.type.match('text')) {
        var reader = new FileReader();
        reader.onload = function (e) {
          $('#nxapi_code_filename').val(code_filename);
          $('#nxapi_code_file_content').val(reader.result);

          var converturl = 'http://104.236.21.104:9090/nexus_config_nxapi/convert/?' + jQuery('form#nxapi_cli_convert_form').serialize();

          document.location.href = converturl;
          $('form#nxapi_cli_convert_form')[0].reset();
          $('#code_file').val('');
        };

        reader.readAsText(file);

        return false;
      }
    }
  });

  $('#puppet_code_convert').click(function () {
    var error_msg = 'Please check the error below.\n\n';
    var error_flag = false;
    var code_file = $('#code_file').val();

    if (code_file == 0) {
      error_msg += ' * Need to upload CLI Text file.\n';
      error_flag = true;
    }

    var ext = $('#code_file').val().split('.').pop().toLowerCase();

    if ($.inArray(ext, ['txt']) == -1) {
      error_msg += ' *  Invalid extension for file. Only \'txt\' files are supported..\n';
      error_flag = true;
    }

    if (error_flag == true) {
      alert(error_msg);
      return false;
    } else {
      var fileInput = document.getElementById('code_file');
      var file = fileInput.files[0];
      var code_filename = file.name.split('.')[0];

      if (file.type.match('text')) {
        var reader = new FileReader();

        reader.onload = function (e) {
          $('#puppet_code_classname').val(code_filename);
          $('#puppet_code_filename').val(code_filename);
          $('#puppet_code_file_content').val(reader.result);

          var converturl = 'http://104.236.21.104:9090/nexus_config_puppet/convert/?' + $('form#puppet_cli_convert_form').serialize();

          document.location.href = converturl;
          $('form#puppet_cli_convert_form')[0].reset();
          $('#code_file').val('');
        };

        reader.readAsText(file);

        return false;
      }
    }
  });

  $('#ansible_code_convert').click(function () {
    var error_msg = 'Please check the error below.\n\n';
    var error_flag = false;
    var code_file = $('#code_file').val();

    if (code_file == 0) {
      error_msg += ' * Need to upload CLI Text file.\n';
      error_flag = true;
    }

    var ext = $('#code_file').val().split('.').pop().toLowerCase();
    if ($.inArray(ext, ['txt']) == -1) {
      error_msg += ' *  Invalid extension for file. Only \'txt\' files are supported..\n';
      error_flag = true;
    }

    if (error_flag == true) {
      alert(error_msg);

      return false;
    } else {
      var fileInput = document.getElementById('code_file');
      var file = fileInput.files[0];
      var code_filename = file.name.split('.')[0];

      if (file.type.match('text')) {
        var reader = new FileReader();

        reader.onload = function (e) {
          $('#ansible_code_desc').val(code_filename);
          $('#ansible_code_filename').val(code_filename);
          $('#ansible_code_file_content').val(reader.result);

          var converturl = 'http://104.236.21.104:9090/nexus_config_ansible/convert/?' + $('form#ansible_cli_convert_form').serialize();

          document.location.href = converturl;
          $('form#ansible_cli_convert_form')[0].reset();
          $('#code_file').val('');
        };

        reader.readAsText(file);

        return false;
      }
    }
  });
});
