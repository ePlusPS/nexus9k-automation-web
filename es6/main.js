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
  let parsedCsv = Papa.parse(csv, {
    // sets the first row as keys for the other rows
    header: true,

    // prevent empty rows causing errors with header keys (often empty last row)
    skipEmptyLines: true
  });

  if (parsedCsv.errors.length > 0) {
    throw 'Could not parse csv';
  }

  let thead = parsedCsv.meta.fields.reduce((tablePartial, item) => {
    return tablePartial += `<th>${item}</th>`;
  }, '');

  let tbody = parsedCsv.data.reduce((tablePartial, item) => {
    let row = parsedCsv.meta.fields.reduce((tableRowPartial, item2) => {
      return tableRowPartial += `<td contenteditable="true">${item[item2]}</td>`;
    }, '');

    return tablePartial += `<tr>${row}</tr>`;
  }, ''); // to add row numbers `${index}` initial value

  return `<table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>`;
}

function tableToCsv(table, url) {
  let elements = [].slice.call(table.tHead.children).concat([].slice.call(table.tBodies[0].children));

  return elements.reduce((csvPartial, tr) => {
    let row = [].slice.call(tr.children).reduce((trPartial, td) => {
      return trPartial += td.textContent + ',';
    }, '');

    return csvPartial += row.slice(0, -1) + (url ? '^' : "\n\r");
  }, '');
}

function generateFileDownload(content, type, fileName) {
  let a = document.createElement('a');

  a.href = encodeURI(`data:attachment/${type},${content}`);

  a.target = '_BLANK';
  a.download = fileName;

  document.body.appendChild(a);

  return a;
}

let nexusConfigTableContainer = document.getElementById('nexus-config-table-container');

/*
document.getElementById('generate_config_cli').addEventListener('click', (event) => {
  let nexusConfigTable = nexusConfigTableContainer.querySelector('table');

  if (nexusConfigTable) {
    generateFileDownload(tableToCsv(nexusConfigTable), 'csv', 'nexus_config.csv').click();
  }
});
*/

document.getElementById('generate_config_cli').addEventListener('click', (event) => {
  document.location.href = 'http://104.236.21.104:9090/nexus_config_cli/convert/?config_csv=' + tableToCsv(nexusConfigTableContainer.querySelector('table'), 'url');
});

document.getElementById('code_file').addEventListener('change', function (event) {
  document.getElementById('file_button').innerHTML = this.value.split(/(\\|\/)/g).pop();
});

function updateList(current) {
  var listt = '';

  for (let file in localStorage) {
    let selected = file == current ? 'class="selected"' : '';
    listt += `<li ${selected}><button class="appearance-none">${file}</button> <i class="fa fa-download"></i></li>`;
  }

  document.querySelector('#nexus-config-table-container').innerHTML = csvToTable(localStorage.getItem(current));
  document.getElementById('selector-files').innerHTML = listt;

  for (let li of document.querySelectorAll('#file-selector li')) {
    li.querySelector('.fa-download').addEventListener('click', function (event) {
      var csv = '';

      if (this.previousElementSibling.textContent == current) {
        csv = tableToCsv(document.querySelector('#nexus-config-table-container table'));
      }
      else {
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
}

request('../static/nexus_config.csv').then(function(nexusConfigCsv) {
  let csv = csvToTable(nexusConfigCsv);

  document.querySelector('#nexus-config-table-container').innerHTML = csv;

  /*
  if (!localStorage.getItem('Default.csv')) {
    localStorage.setItem('Default.csv', nexusConfigCsv);
  }

  updateList('Default.csv');
  */
});

document.getElementById('upload-config-file').addEventListener('change', function (event2) {
  let reader = new FileReader();

  reader.onload = (event) => {
    let contents = event.target.result;
    let name = this.value.split(/(\\|\/)/g).pop();

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

document.getElementById('automation-select').addEventListener('change', (event) => {
  currentAutomation(event.target.value, previous);
  previous = event.target.value;
});

$(function () {
  $("#nxapi_code_convert").click( function (){
    var error_msg = "Please check the error below.\n\n";
    var error_flag = false;
    var code_file = $("#code_file").val();

    if( code_file == 0) {
      error_msg += " * Need to upload CLI Text file.\n";
      error_flag = true;
    }

    var ext = jQuery('#code_file').val().split('.').pop().toLowerCase();
    if(jQuery.inArray(ext, ['txt']) == -1) {
      error_msg += " *  Invalid extension for file. Only 'txt' files are supported..\n";
      error_flag = true;
    }

    if(error_flag == true) {
      alert(error_msg);
      return false;
    }
    else {
      var fileInput = document.getElementById('code_file');
      var file = fileInput.files[0];
      var code_filename = file.name.split('.')[0];

      if (file.type.match("text")) {
        var reader = new FileReader();
        reader.onload = function(e) {
          $("#nxapi_code_filename").val(code_filename);
          $("#nxapi_code_file_content").val(reader.result);

          var converturl = "http://104.236.21.104:9090/nexus_config_nxapi/convert/?"+jQuery("form#nxapi_cli_convert_form").serialize();

          document.location.href = converturl;
          $("form#nxapi_cli_convert_form")[0].reset();
          $("#code_file").val('');
        }

        reader.readAsText(file);

        return false;
      }
    }
  });

  $("#puppet_code_convert").click( function (){
    var error_msg = "Please check the error below.\n\n";
    var error_flag = false;
    var code_file = $("#code_file").val();

    if(code_file == 0) {
      error_msg += " * Need to upload CLI Text file.\n";
      error_flag = true;
    }

    var ext = $('#code_file').val().split('.').pop().toLowerCase();

    if($.inArray(ext, ['txt']) == -1) {
      error_msg += " *  Invalid extension for file. Only 'txt' files are supported..\n";
      error_flag = true;
    }

    if(error_flag == true) {
      alert(error_msg);
      return false;
    }
    else {
      var fileInput = document.getElementById('code_file');
      var file = fileInput.files[0];
      var code_filename = file.name.split('.')[0];

      if (file.type.match("text")) {
        var reader = new FileReader();

        reader.onload = function(e) {
          $("#puppet_code_classname").val(code_filename);
          $("#puppet_code_filename").val(code_filename);
          $("#puppet_code_file_content").val(reader.result);

          var converturl = "http://104.236.21.104:9090/nexus_config_puppet/convert/?"+$("form#puppet_cli_convert_form").serialize();

          document.location.href = converturl;
          $("form#puppet_cli_convert_form")[0].reset();
          $("#code_file").val('');
        }

        reader.readAsText(file);

        return false;
      }
    }
  });

  $("#ansible_code_convert").click(function () {
    var error_msg = "Please check the error below.\n\n";
    var error_flag = false;
    var code_file = $("#code_file").val();

    if(code_file == 0) {
      error_msg += " * Need to upload CLI Text file.\n";
      error_flag = true;
    }

    var ext = $('#code_file').val().split('.').pop().toLowerCase();
    if($.inArray(ext, ['txt']) == -1) {
      error_msg += " *  Invalid extension for file. Only 'txt' files are supported..\n";
      error_flag = true;
    }

    if(error_flag == true) {
      alert(error_msg);

      return false;
    }
    else {
      var fileInput = document.getElementById('code_file');
      var file = fileInput.files[0];
      var code_filename = file.name.split('.')[0];

      if (file.type.match("text")) {
        var reader = new FileReader();

        reader.onload = function(e) {
          $("#ansible_code_desc").val(code_filename);
          $("#ansible_code_filename").val(code_filename);
          $("#ansible_code_file_content").val(reader.result);

          var converturl = "http://104.236.21.104:9090/nexus_config_ansible/convert/?"+$("form#ansible_cli_convert_form").serialize();

          document.location.href = converturl;
          $("form#ansible_cli_convert_form")[0].reset();
          $("#code_file").val('');
        }

        reader.readAsText(file);

        return false;
      }
    }
  });
});
