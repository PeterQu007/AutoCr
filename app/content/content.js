(function(){

    var countTimer = setInterval (checkComplete, 100);

    console.log("I am in Content.js now!");

    function checkComplete(){

    	console.log("complete run!");
    	console.log(document.querySelector('button.accountform-btn'));


        if (document.querySelector('button.accountform-btn')){

        	console.log(document.getElementById('inputEmailHandle').value);
            clearInterval (countTimer);
            document.getElementById('inputEmailHandle').value="peterqu007@gmail.com";
            document.getElementById('inputPassword').value="inform69";
            document.forms[0].submit();
        }
    };

    // setTimeout(function(){
    // 	document.forms[0].submit();
    // }, 3000)
    

}())