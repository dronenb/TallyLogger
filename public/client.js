/**
 Jquery code for responsive UI and 
 server communication via AJAX
 */

 $(document).ready(function() {
  fetch('/api/framerate')
    .then(response => response.json())
    .then(data => {
      $('#frameRateInput').val(data.frameRate);
    });
});

 $(function(){ //wait for the page to be fully loaded

    // Change cell background if input value is dirty
    $('#frameRateInput').on('input', function() {
      $(this).css({'background': 'khaki'});
    });


    $('#frameRateInput').on('keypress', function(e) {
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
            $(this).css({'background': 'lightGreen'});
          })
          .catch((error) => {
            console.error('Error:', error);
            $(this).css({'background': 'red'}); // Optionally, indicate error
          });
        } else {
          // Invalid frame rate, provide feedback
          $(this).css({'background': 'red'});
          alert("Invalid frame rate. Please choose one of the following: " + allowedFrameRates.join(", "));
        }
      }
    });
    


    $("#clearTable").click(function (event){      
      const table = $('#dataTable tbody');
      table.empty(); // Clear existing table rows, except for the header
    });
    

    $('#udpDataTable').on('click', 'tbody tr', function(event) {
      // console.log('udpTable');
        $(this).addClass('highlight').siblings().removeClass('highlight');
        // var currentRow=$(this).closest("tr"); 
        // var col1=currentRow.find("td:eq(0)").text(); // get current row 1st TD value
        // $('#logStartTime').attr("value", col1.substring(0,8)); 
      });
  
      $("#getLogs").click(function (event){      
        // console.log('get logs')
          // Fetch new data and populate the table - TODO - currently dummy data
          $.ajax({
            url: '/fetchLogs',
            type: 'GET',
            success: function(response) {
              // console.log('fetched data...');
              // console.log(response);
              const data = response.data;
              const table = $('#dataTable tbody');
              table.empty(); // Clear existing table rows, except for the header
              response.forEach(item => {
                // console.log(item);
                const row = $('<tr>').appendTo(table);
                let tc = item.formatted_time.slice(0,-4);
                tc += ":"; // bweare frameRate here
                tc += Math.ceil(item.formatted_time.slice(-3)/1000*(frameRate=24)).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
                // console.log(tc);
                $('<td>').addClass('timecode').text(tc).appendTo(row);
                $('<td>').text('').appendTo(row); // blank UDP
                $('<td>').text('').appendTo(row); // blank TCP
                $('<td>').text(item.tally_source).appendTo(row);
                $('<td>').text(item.tape_name).appendTo(row);
                $('<td>').css({'background': item.color_name, 'color': 'white', 'text-shadow': '1px 1px 2px black'}).text(item.color_name).appendTo(row);
              });
            },
            error: function(error) {
              console.error("Error fetching data: ", error);
            }
          });
      });

    $(".btn").not("#getLogs").click(function clickHandling(){ //if element of class "btn" is clicked
      // console.log('other buttons');
      var btn_status = {id:"", val:""}; //data to be sent to the server
          btn_status.id = $(this).attr("id"); //get which button was clicked
          // console.log('button pressed');
          // console.log(btn_status.id);
          // console.log($(this).attr("value"));

          if(btn_status.id == "btn2"){
              btn_status.val="";
          }
          if(btn_status.id =="btn3"){
              btn_status.val="";
          }        
          if(btn_status.id =="btn4"){
              if ($(this).attr("value")=='UDP OFF') { 
                  $(this).addClass("btn-success").removeClass("btn-light");
                  $(this).attr('value', 'UDP ON'); 
                  btn_status.val="udp-on"; // tell server that udp should be started
          }
              else { 
                  $(this).addClass("btn-light").removeClass("btn-success");
                  $(this).attr('value', 'UDP OFF'); 
                  btn_status.val="udp-off"; // tell server that udp should be started
          }
          }        
          if(btn_status.id =="btn5"){
              if ($(this).attr("value")=='TCP OFF') { 
                  $(this).addClass("btn-success").removeClass("btn-light");
                  $(this).attr('value', 'TCP ON'); 
                  btn_status.val="tcp-on"; // tell server that udp should be started
          }
              else { 
                  $(this).addClass("btn-light").removeClass("btn-success");
                  $(this).attr('value', 'TCP OFF'); 
                  btn_status.val="tcp-off"; // tell server that udp should be started
          }
          }

      $.post("/tally", btn_status, function (data, status){ //send data to the server via HTTP POST
        // console.log('post event');
        if(status == "success"){ //if server responds ok
          // console.log(data);//print server response to the console
        }
      },"json"); //server response shuld be in JSON encoded format
    });
  

});

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
}