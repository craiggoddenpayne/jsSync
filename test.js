$().ready(function () {

    
        function writeResult(wittenResults) {
            var div = document.getElementById("results");
            div.innerHTML = div.innerHTML + "<br/>" + wittenResults;
        }

        function downloadImage(url) {
            return $.ajax({
                type: "GET",
                url: url,
                async: false,
            }).responseText;
        }

        function smallFunction() {
            writeResult("small function started");
            writeResult("small function ended");
            //small image
            downloadImage("https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Wiktionary_small.svg/350px-Wiktionary_small.svg.png");
            return "small function Result as result of syncHandler";
        }

        function mediumFunction() {
            writeResult("medium function started");
            writeResult("medium function ended");
            //medium image
            downloadImage("http://www.xmission.com/~tssphoto/vt/Shepherdess_700x1000.jpg");
            return "medium function Result as result of syncHandler";
        }            


    var smallChainedTask = new Task(function() {
        writeResult("small chained task started");
        writeResult("small chained task ended");
        return "small chained task Result as result of syncHandler";
    }).chainOnComplete(function() {
        writeResult("Chained function started");
        writeResult("Chained function ended");
        return "Chained function Result as result of syncHandler";
    });


    function workWithResults(task1Results) {
        for (var i = 0; i < task1Results.length; i++) {
            writeResult(task1Results[i]);
        }
        writeResult("Time:" + (new Date().getTime() - task1Time).toString());
    }

    
    var syncHandler = new TaskHandler();
    syncHandler.addTasks([mediumFunction,smallChainedTask,smallFunction]);

    var task1Time = new Date().getTime();
    syncHandler.execute(workWithResults);
});
        
