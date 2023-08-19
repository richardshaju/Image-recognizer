Dropzone.autoDiscover = false;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "/",
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Some Message",
        autoProcessQueue: false
    });
    
    dz.on("addedfile", function() {
        if (dz.files[1]!=null) {
            dz.removeFile(dz.files[0]);        
        }
    });

    dz.on("complete", function (file) {
        let imageData = file.dataURL;

        var url = 'http://127.0.0.1:5000/classify_image'
        $.post(url, {
            image_data : imageData
        }, function(data, status){
            console.log(data);

            if(!data || data.length == 0){
                $('#resultholder').hide()
                $('#divClassTable').hide()
                $('#error').show()
            }

            let match = null
            let bestScore = -1
            
            for(var i = 0;i<data.length;++i){
                let maxSore = Math.max(...data[i].class_probability)

                if(maxSore > bestScore){
                    match = data[i]
                    bestScore = maxSore
                }
            }
            if(match){
                $('#error').hide()
                $("#resultHolder").show()
                $("#divClassTable").show()
                $("#resultHolder").html($(`[data-player = "${match.class}"`).html())
            
                let classDicitionary = match.class_dictionary
                
                for(person in classDicitionary){
                
                    let index = classDicitionary[person]
                    let probability = match.class_probability[index]
                    let elementName = "#score_" + person
                    $(elementName).html(probability);
                }
            }
        })
    })
    $("#submitBtn").on('click', function (e) {
        dz.processQueue();		
    });
}

$(document).ready(function() {
    console.log( "ready!" );
    $('#error').hide()
    $('#resultholder').hide()
    $('#divClassTable').hide()
    init();
});