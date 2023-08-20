Dropzone.autoDiscover = false;

function init() {
  let dz = new Dropzone("#dropzone", {
    url: "/",
    maxFiles: 1,
    addRemoveLinks: true,
    dictDefaultMessage: "Some Message",
    autoProcessQueue: false,
  });

  dz.on("addedfile", function () {
    if (dz.files[1] != null) {
      dz.removeFile(dz.files[0]);
    }
  });

  dz.on("complete", function (file) {
    let imageData = file.dataURL;

    var url = "http://127.0.0.1:5000/classify_image";
    $.post(
      url,
      {
        image_data: imageData,
      },
      function (data, status) {
        console.log(data);

        if (!data || data.length == 0) {
          $("#resultHolder").hide();
          $("#divClassTable").hide();
          $("#error").show();
        }

        let match = null;
        let bestScore = -1;

        for (var i = 0; i < data.length; ++i) {
          let maxSore = Math.max(...data[i].class_probability);

          if (maxSore > bestScore) {
            match = data[i];
            bestScore = maxSore;
          }
        }
        if (match) {
          $("#error").hide();
          $("#resultHolder").show();
          $("#divClassTable").show();
          $("#resultHolder").html($(`[data-player = "${match.class}"`).html());

          let classDicitionary = match.class_dictionary;

          var data = [];

          for (person in classDicitionary) {
            let index = classDicitionary[person];
            let probability = match.class_probability[index];
            data.push({ name: person, score: probability });
          }
          data.sort(function (a, b) {
            return b.score - a.score; // Compare in descending order
          });

          var tableContainer = document.getElementById("divClassTable");

          // Create a table element
          var table = document.createElement("table");
          table.id = "classTable";
          // Create header row
          var headerRow = document.createElement("tr");
          var headerName = document.createElement("th");
          headerName.textContent = "Name";
          var headerScore = document.createElement("th");
          headerScore.textContent = "Similarity";
          headerRow.appendChild(headerName);
          headerRow.appendChild(headerScore);
          table.appendChild(headerRow);

          // Create rows and cells for data
          for (var i = 0; i < 5; i++) {
            tableContainer.innerHTML = '';
            var row = document.createElement("tr");
            var cellName = document.createElement("td");
            cellName.textContent = data[i].name;
            var cellScore = document.createElement("td");
            cellScore.textContent = data[i].score + "%";
            row.appendChild(cellName);
            row.appendChild(cellScore);
            table.appendChild(row);
          }

          // Append the table to the container
          tableContainer.appendChild(table);
        }
      }
    );
  });
  $("#submitBtn").on("click", function (e) {
    dz.processQueue();
  });
}

$(document).ready(function () {
  console.log("ready!");
  $("#error").hide();
  $("#resultholder").hide();
  $("#divClassTable").hide();
  init();
});
