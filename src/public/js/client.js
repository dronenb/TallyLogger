/**
 Jquery code for responsive UI and 
 server communication via AJAX
 */

// currently the /api/colors isn't working

$(document).ready(function () { // Once page is loaded...
  fetch('/api/framerate')
    .then(response => response.json())
    .then(data => {
      $('#frameRateInput').val(data.frameRate);
    });

  // Fetch initial button states
  $.get('/api/button-states', function (data) {
    // console.log('Fetched Initial Button States:', data);
    const udpButton = $('#btn4');
    const tcpButton = $('#btn5');

    // Update UDP button state
    if (data.udpEnabled) {
      udpButton.addClass("btn-success").removeClass("btn-light").val('UDP ON');
    } else {
      udpButton.addClass("btn-light").removeClass("btn-success").val('UDP OFF');
    }

    // Update TCP button state
    if (data.tcpEnabled) {
      tcpButton.addClass("btn-success").removeClass("btn-light").val('TCP ON');
    } else {
      tcpButton.addClass("btn-light").removeClass("btn-success").val('TCP OFF');
    }
  });

  // Fetch color options from the server
  $.get('/api/colors', function(colors) {
      // Generate the options string
      const colorOptions = colors.map(color => `<option value="${color.name}">${color.name}</option>`).join('');
      initializeDataTable(colorOptions); // Pass the colorOptions to the DataTable initialization
  });

  // Set initial start and end times - currently UTC
  const now = new Date().toISOString();
  $('#logStartTime').data('datetime', now);   
  $('#logEndTime').data('datetime', now);   
});



function initializeDataTable(colorOptions) {
  var table = $('#myDataTable').DataTable({
      "pageLength": 50,
      "ajax": {
          url: '/api/tape-data',
          dataSrc: ''
      },
      "columns": [
          { "data": 'label' },
          { "data": 'tapeName', "className": 'editable' },
          { "data": 'clipColorName' },
          { "data": 'clipColorRGB' }
      ],
      "createdRow": function(row, data) {
          $(row).attr('data-id', data.id);
          if (/^#[0-9A-F]{6}$/i.test(data.clipColorName) || /^[a-zA-Z]+$/.test(data.clipColorName)) {
            // set background color of row to match selected color
              $(row).css({
                  'background-color': data.clipColorName,
                  'color': '#fff',
                  'text-shadow': '0px 0px 3px rgba(0,0,0,0.6)'
              });
          }
      },
      "columnDefs": [{
              "targets": 0,
              "width": '15%'
          },
          {
              "targets": 1,
              "width": '25%'
          },
          {
              "targets": 2,
              "width": '20%',
              "render": function(data, type, row) {
                // populate drop-down
                  if (type === 'display') {
                      let selectHTML = `<select class="form-control color-select" data-row-id="${row.id}">`;
                      // Add the color options to the select element
                      selectHTML += colorOptions.split('\n').map(option => {
                          // Mark the current color as selected
                          const modifiedOption = option.includes(`value="${data}"`) ? option.replace(`value="${data}">`, `value="${data}" selected>`) : option;
                          return modifiedOption;
                         }).join('');
                      selectHTML += `</select>`;
                      return selectHTML;
                  }
                  return data;
              }
          },
          {
              "targets": 3,
              "width": '10%',

          }
      ]
  });

  // Listen for changes on the color-select dropdowns
  $('#myDataTable tbody').on('change', 'select.color-select', function() {
      const selectedColor = $(this).val();
      const rowId = $(this).data('row-id');
      const row = $(this).closest('tr');
    // Navigate up to the parent cell (td) and then find the next cell (td)
      const nextCell = $(this).closest('td').next();

      // AJAX call to update the color in the database
      $.ajax({
          url: '/api/update-color',
          type: 'POST',
          data: {
              id: rowId,
              newColor: selectedColor
          },
          success: function(response) {
              // Update the row's background color upon successful color change
              row.css('background-color', selectedColor);
              nextCell.text(response.clipColorRGB);
          },
          error: function(error) {
              console.log('Error updating color:', error);
          }
      });
  });

  // other listeners

  $('#myDataTable tbody').on('click', 'td.editable', function () {
    var cell = table.cell(this);
    var originalContent = cell.data();
    var rowId = $(this).closest('tr').data('id'); // Get the data-id of the row

    // Skip if the cell is currently being edited
    if ($(this).find('input').length) return;

    // Replace cell content with an input element
    $(this).html('<input type="text" class="form-control" value="' + originalContent + '"/>');

    // Focus on the input and select its content to facilitate editing
    var input = $(this).find('input').focus().select();

    // Attach event handler for when the input loses focus (blur event)
    input.blur(function () {
        updateCellValue($(this), cell, originalContent, rowId);
    });

    // Attach event handler for the Enter key
    input.keypress(function (e) {
        if (e.which == 13) { // 13 is the Enter key code
            updateCellValue($(this), cell, originalContent, rowId);
        }
    });
}); // end myDataTable tbody

function updateCellValue(input, cell, originalContent, rowId) {
    var newValue = input.val();

    // Optionally, update the server with the new value
    $.ajax({
        url: '/update-tape-name', // Endpoint for updating data
        type: 'POST',
        data: {
            id: rowId, // Send the unique ID
            tapeName: newValue
        },
        success: function (response) {
            // Update cell data only on successful server update
            cell.data(newValue).draw();
        },
        error: function () {
            console.log('Update failed');
            // Revert to original content if update fails
            cell.data(originalContent).draw();
        }
    }); // end ajax
}


  //       // Event listener for change on dropdown
  $('#myDataTable tbody').on('change', 'select.color-select', function () {
    const selectedColor = $(this).val();
    const rowId = $(this).data('row-id');
    const $thisSelect = $(this); // Preserve the $(this) reference


    // AJAX call to update the color in the database
    $.ajax({
      url: '/api/update-color',
      type: 'POST',
      data: {
        id: rowId,
        newColor: selectedColor
      },
      success: function (response) {
        // Since $thisSelect is the select element, we need to navigate to its parent row
        $thisSelect.closest('tr').css('background-color', selectedColor); // Correctly targets the row
      },
      error: function (error) {
        // Handle error
      }
    });
  });
}


$(function () { //wait for the page to be fully loaded

  // Change cell background if input value is dirty
  $('#frameRateInput').on('input', function () {
    $(this).css({ 'background': 'khaki' });
  });

  $('#frameRateInput').on('keypress', function (e) {
    if (e.which === 13) { // Enter key is pressed
      let inputFrameRate = parseFloat($(this).val());
      if (inputFrameRate === 23.98) {
        inputFrameRate = 23.976; // Correcting to 23.976
        $(this).val(inputFrameRate); // Update the input box to reflect the change
      }
      const allowedFrameRates = [23.976, 24, 25, 29.97, 30, 50, 59.94, 60];

      if (allowedFrameRates.includes(inputFrameRate)) {
        // Frame rate is valid, proceed to update
        fetch('/api/framerate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ frameRate: inputFrameRate }),
        })
          .then(response => response.json())
          .then(data => {
            // console.log('FrameRate updated:', data.frameRate);
            $(this).css({ 'background': 'lightGreen' });
          })
          .catch((error) => {
            console.error('Error:', error);
            $(this).css({ 'background': 'red' }); // Optionally, indicate error
          });
      } else {
        // Invalid frame rate, provide feedback
        $(this).css({ 'background': 'red' });
        alert("Invalid frame rate. Please choose one of the following: " + allowedFrameRates.join(", "));
      }
    }
  });

  $("#clearTable").click(function (event) {
    const table = $('#dataTable tbody');
    table.empty(); // Clear existing table rows, except for the header
  });

  $('#udpDataTable').on('click', 'tbody tr', function (event) {
    $(this).addClass('highlight').siblings().removeClass('highlight');
  });

  $("#getLogs").click(function (event) {
    // console.log('get logs')
    // Fetch new data and populate the table - TODO - currently dummy data
    $.ajax({
      url: '/fetchLogs',
      type: 'GET',
      success: function (response) {
        // console.log('fetched data...');
        // console.log(response);
        const data = response.data;
        const table = $('#dataTable tbody');
        table.empty(); // Clear existing table rows, except for the header
        response.forEach(item => {
          // console.log(item);
          const row = $('<tr>').appendTo(table);
          let tc = item.formatted_time.slice(0, -4);
          tc += ":"; // bweare frameRate here
          tc += Math.ceil(item.formatted_time.slice(-3) / 1000 * (frameRate = 24)).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
          // console.log(tc);
          $('<td>').addClass('timecode').text(tc).appendTo(row);
          $('<td>').text('').appendTo(row); // blank UDP
          $('<td>').text('').appendTo(row); // blank TCP          
          $('<td>').text('').appendTo(row); // blank LH
          $('<td>').text('').appendTo(row); // blank Text
          $('<td>').text('').appendTo(row); // blank RH
          $('<td>').text(item.tally_source).appendTo(row);
          $('<td>').text(item.tape_name).appendTo(row);
          $('<td>').css({ 'background': item.color_name, 'color': 'white', 'text-shadow': '1px 1px 2px black' }).text(item.color_name).appendTo(row);
        });
      },
      error: function (error) {
        console.error("Error fetching data: ", error);
      }
    });
  });

  $(".btn").not("#getLogs").click(function clickHandling() { //if element of class "btn" is clicked
    // console.log('other buttons');
    var btn_status = { 
      id: "", 
      val: "", 
      logStartTime: "", 
      logEndTime: "" 
    }; // data to send to server
    btn_status.id = $(this).attr("id"); //get which button was clicked
    btn_status.logStartTime = $('#logStartTime').data('datetime'); // Get the start time
    btn_status.logEndTime = $('#logEndTime').data('datetime'); // Get the end time

    // console.log('button pressed');
    // console.log(btn_status.id);
    // console.log($(this).attr("value"));

    if (btn_status.id == "btn2") { // Output
      btn_status.val = "";
    }
    if (btn_status.id == "btn3") { // Output and reset
      btn_status.val = "";
    }
    if (btn_status.id == "btn4") {
      if ($(this).attr("value") == 'UDP OFF') {
        $(this).addClass("btn-success").removeClass("btn-light");
        $(this).attr('value', 'UDP ON');
        btn_status.val = "udp-on"; // tell server that udp should be started
      }
      else {
        $(this).addClass("btn-light").removeClass("btn-success");
        $(this).attr('value', 'UDP OFF');
        btn_status.val = "udp-off"; // tell server that udp should be started
      }
    }
    if (btn_status.id == "btn5") {
      if ($(this).attr("value") == 'TCP OFF') {
        $(this).addClass("btn-success").removeClass("btn-light");
        $(this).attr('value', 'TCP ON');
        btn_status.val = "tcp-on"; // tell server that udp should be started
      }
      else {
        $(this).addClass("btn-light").removeClass("btn-success");
        $(this).attr('value', 'TCP OFF');
        btn_status.val = "tcp-off"; // tell server that udp should be started
      }
    }

    $.post("/tally", btn_status, function (data, status) { //send data to the server via HTTP POST
      // console.log('post event');
      if (status == "success") { //if server responds ok
        // console.log(data);//print server response to the console
      }
    }, "json"); //server response shuld be in JSON encoded format
  }); // end getLogs button


}); // end commands after page fully loaded

function debounce(func, wait) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}// end function debounce
const socket = io(); // HTTP connection

// Listen for source updates
socket.on('sourceUpdated', (sourceData) => {
    fetchSources(); // Refresh the sources list when a source is updated
});

socket.on('reload', (data) => {
  location.reload(); // Reload the page
  console.log('Reload event received:', data);
});
// A reusable function to handle data
function handleData(eventType, data) {
  const table = $('#dataTable tbody');
  const row = $('<tr>').prependTo(table);
  const timeCodeCell = $('<td>').addClass('timecode').text(data.TIMECODE).appendTo(row);

  // Initialize empty cells that may be filled based on the event type
  const udpDataCell = $('<td>').appendTo(row);
  const tcpDataCell = $('<td>').appendTo(row);
  const lhDataCell = $('<td>').appendTo(row);
  const txtDataCell = $('<td>').appendTo(row);
  const rhDataCell = $('<td>').appendTo(row);

  // Add two more cells for potential future use or to maintain table structure
  $('<td>').text('').appendTo(row); // blank SQL
  $('<td>').text('').appendTo(row); // blank SQL

  // Decide where to place the data based on the eventType
  if (eventType.startsWith('udpData')) {
    udpDataCell.text(data.TEXT);
  } else if (eventType.startsWith('tcpData')) {
    tcpDataCell.text(data.TEXT);
  }
  lhDataCell.text(data.LH_TALLY);
  lhDataCell.css('background', getCssColor(data.LH_TALLY));
  txtDataCell.text(data.TEXT_TALLY);
  txtDataCell.css('background', getCssColor(data.TEXT_TALLY));
  rhDataCell.text(data.RH_TALLY);
  rhDataCell.css('background', getCssColor(data.RH_TALLY));

  if (eventType.includes('reset')) {
    timeCodeCell.css('background', 'pink');
  } else if (eventType.includes('info') || eventType.includes('start')) {
    timeCodeCell.css('background', 'yellow');
  }

  // Adjust time inputs based on type
  if (eventType.includes('start')) {
    // set start time
    $('#logStartTime').val(data.TIMECODE.substring(0, 8));
    $('#logStartTime').data('datetime', data.TIMESTAMP); 
    if ($('#logEndTime').val() === ""){
      $('#logEndTime').val(data.TIMECODE.substring(0, 8));
      $('#logEndTime').data('datetime', data.TIMESTAMP); 
    }
  } 
  else if(eventType.includes('reset')){
    console.log(data);
    // checking this out....
    $('#logStartTime').val(data.NEW_START_TIMECODE.substring(0, 8));
    $('#logStartTime').data('datetime', data.NEW_START_TIME); 
    $('#logEndTime').val(data.NEW_START_TIMECODE.substring(0, 8));
    $('#logEndTime').data('datetime', data.NEW_START_TIME); 
  }
  else {
    // set end time
    $('#logEndTime').val(data.TIMECODE.substring(0, 8));
    $('#logEndTime').data('datetime', data.TIMESTAMP);   
  }
}

// Consolidate socket event handling
const eventTypes = ['udpData', 'tcpData', 'udpData-reset', 'tcpData-reset', 'udpData-info', 'tcpData-info', 'udpData-start', 'tcpData-start'];
eventTypes.forEach(eventType => {
  socket.on(eventType, data => {
    handleData(eventType, data);
  });
});

// Define a mapping from your custom color names to actual CSS colors
const colorMapping = {
  'OFF': 'transparent', // Assuming you want no color for "OFF"
  'RED': 'red',
  'GREEN': 'green',
  'AMBER': '#FFBF00', // Hexadecimal value for amber
  // Add any other custom colors as needed
};

// A function to get the CSS color from the mapping
function getCssColor(colorName) {
  if (typeof colorName === 'undefined') {
      return 'transparent'; // Default color when the input is undefined
  }
  return colorMapping[colorName.toUpperCase()] || 'transparent'; // Default to transparent if not found
}

