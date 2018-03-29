/**
 * Created by B00189991 on 28/04/2015.
 */

$(document).on("pageinit", "#scorePage", function() {

    var top10 = [];

    function PlayerEntry(name, score){

        this.name = name;
        this.score = score;
    }

    if(localStorage.top10 == undefined){

        var emptyDiv = document.getElementById("playerNameDiv");

        emptyDiv.innerHTML += "<center><p>No scores entered yet</p></center>";
    }

    if(localStorage.score != "null" && localStorage.score != undefined) {

        //If localStorage.score is not null, then the player has just played a game and wants to submit details.
        console.log("localStorage.score != null");
        var finalScore = JSON.parse(localStorage.score);

        if(localStorage.top10 == null && localStorage.top10 == undefined){

            localStorage.top10 = JSON.stringify(top10);
            localStorage.initialised = "true";
        }

        generateInput();

        if(document.getElementById("scoreTable") != undefined || null){

            updateTable();
        }else{

            generateTable()
        }

        //Empty local storage so it's ready for the next score.
        console.log("Player's score is: " + finalScore);
    }else{

        console.log("localStorage.score == null");
        if(localStorage.score != undefined) {

            removeInput();
        }
        //if localStorage.score is null then the player has navigated to this page on their own.
    }

    if(localStorage.top10 != null && localStorage.top10 != undefined) {

        console.log("creating top 10");

        top10 = JSON.parse(localStorage.top10);

        if(document.getElementById("scoreTable") == undefined) {

            generateTable();
        }

        updateTable();
    }

    $("#submitBTN").on("click", function(){

        var name = "" + $("#playerName").val();

        //Create a new PlayerEntry by taking the value of the textbox and the player score.
        top10 = JSON.parse(localStorage.top10);

        //top10.unshift(new PlayerEntry(name, localStorage.score));
        console.log(top10);

        //Temporarily store the latest entry to the table.
        var tempEntry = new PlayerEntry(name, localStorage.score);
        top10.unshift(tempEntry);

        if(top10.length == 0){

            top10.unshift(tempEntry);
        }else {

        //Reversed bubble sort to organise the high scores list.
        /*http://www.stoimen.com/blog/2010/07/09/friday-algorithms-javascript-bubble-sort/
         */
            var swapped = true;
            do {
                swapped = false;
                for (var i=0; i < top10.length-1; i++) {
                    if (top10[i].score < top10[i+1].score) {
                        var temp = top10[i];
                        top10[i] = top10[i+1];
                        top10[i+1] = temp;
                        swapped = true;
                    }
                }
            } while (swapped);
        }

        if(top10.length > 10){

            //Remove the last element of the array to keep the list at 10.
            top10.pop();
        }

        updateTable();

        //Create or update the top 10 held in local storage.
        localStorage.top10 = JSON.stringify(top10);
        localStorage.initialised = "true";
        //Wipe the score held in local storage.
        localStorage.score = null;
        removeInput();
    });

    function generateInput(){

        var emptyDiv = document.getElementById("playerNameDiv");

        //Make sure the emptyDiv is clear.
        emptyDiv.innerHTML = "";
        //Get the user to enter their name.
        emptyDiv.innerHTML += "<center><p><label>Enter your name.</label><input type='text' id='playerName'></p><p><input type='button' value='Submit' id='submitBTN'></p></center>";

    }

    function removeInput(){

        var emptyDiv = document.getElementById("playerNameDiv");

        emptyDiv.innerHTML = null;
    }

    function generateTable(){

        var tableDiv = document.getElementById("tableDiv");
        var table = "<center><p><table data-role='table' class='ui-responsive ui-shadow' data-mode='columntoggle' id='scoreTable'>";

        //Add 10 rows with 2 columns.
        for(var i = 0; i < 10; i++){

            table += "<tr><td class='playerCell' id='nameCell" + i + "'>Name here</td><td class='playerScoreCell' id='scoreCell" + i + "'>5000</td></tr>";
        };

        //Finish the table code.
        table += "</table></p></center>";

        //Add all the table code to the div prepared.
        tableDiv.innerHTML += table;
    }

    function updateTable(){

        for(var j = 0; j < 10; j++){

            if(top10[j] != undefined) {

                //top10[j] = new PlayerEntry(top10[j].name, top10[j].score);
                document.getElementById("nameCell" + j).innerText = top10[j].name;
                document.getElementById("scoreCell" + j).innerText = top10[j].score;
            }else{

                document.getElementById("nameCell" + j).innerText = "No entry";
                document.getElementById("scoreCell" + j).innerText = "" + 0;
            }
        }
    }
});