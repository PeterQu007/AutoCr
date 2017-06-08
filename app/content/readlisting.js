//content layer for reading the craigslist table from web pages
// {
// 		"matches": ["https://accounts.craigslist.org/login/home?*"],
// 		"js": ["jquery-3.2.1.js","readlisting.js"]
// }
'use strict';

var log = console.log;

var BreakException = {};
var form; //keep the submit form, for auto click 'repost' link
var words; // compare the title, if the first a few words same, skip to next listing
var backupListing  // keep the candidate listings for repost records
var listingInfo //keep the repostable listing details

//define a Listing object, 
//constructor function Listing();
function Listing(status, postID, manage, title, postedDate, from, subject){
  this.status = status || '';
  this.postID = postID || '';
  this.manage = manage || '';
  this.title = title || '';
  this.postedDate = postedDate || '';
  this.from = from || '';
  this.subject = subject || '';

};

//read a repostable listing from the table
//parameter: table - web page selecotr
//parameter: baseListing - get a Listing with postID > baseListing.postID
//return: Listing object
function readTable(table, baseListing){

	var status, postID, manage, title, postedDate;
	var thisListing; //return thisListing

	if($(table)){

		var myListings = $($('table tr').get().reverse());
		
		//for each listing, get to the first repostable one
		try {
			myListings.each(function(){

				var currentListing = $(this);
				log("readTable.1.00..read currentListing from the Table: ", currentListing);

				status = currentListing.find("td:eq(0)").text().trim(); 
				postID = currentListing.find("td:eq(6)").text().trim();
				manage = $.map(currentListing
								.find("td:eq(1)")
								.find('input[type="submit"]'), function(value){
									return value.value;});

				//check if the post is repostable, and the ID has been reposted
				console.log("readTable.1.01..check mangage[0]=='repost': ", manage[0], manage[0]=="repost");
				console.log("readTable.1.02..check baseListing.postID == '': ", baseListing.postID, baseListing.postID == '');
				console.log("readTable.1.03..check postID > baseListing.postID: ", postID, postID > baseListing.postID);
				if (manage[0]=="repost" && (baseListing.postID == '' || postID > baseListing.postID)){
					
					form = currentListing
								.find("td:eq(1)")
								.find('form')

					title = currentListing.find("td:eq(2)").text().trim(); 
					postedDate = currentListing.find("td:eq(4)").text().trim();

					log('readTable.1.04..currentListing fields are ', postID, status, manage, title, postedDate);
					log('readTable.1.05..currentListng field Lengths are ', postID.length, status.length, manage.length, title.length, postedDate.length);
					thisListing = new Listing(status, postID, manage, title, postedDate, 
													"readTable", "backupListing");
					//highlight the currentListing row in the Table
					currentListing.addClass('currentRow');
					//exit the for each loop
					throw BreakException;

				}
			});

			log("readTable.1.06.no repostabel listing found, return base listing: ", baseListing);
			return baseListing;

		} catch (e) {

			if (e !== BreakException) throw e;
			
		} //end of Try block

		log('readTable.1.0x..return the listing: ')
		return thisListing
	}
	else{
		console.log('readTable.2.0x..No Table found in the web page! ')
	}


}

//defind a readingListing function
//read the repostable but not reposted post from the table
//mode.0: read backupListing from background.js, use it as base Listing
//mode.1: use currentListing listingInfo as base Listing
//compare with the base Listing, read a new repostable listing
function readListing(mode){

	switch(mode) {

		case 0:
			//read backupListing
			//readlisting first send message to background, fetch the backup listing
			var msg = {from: 'readListing', subject: 'fetchBackupListing'};
			
			log("readListing.1.0: read backuped listing ", msg);
			chrome.runtime.sendMessage(

				msg,

				function(response){
			
					backupListing = response;
					log("readListing.1.00: read backuped listing ", backupListing);

					listingInfo = readTable('table', backupListing);
					
				}

			);

			break;
		case 1:
			//read Next Listing
			log('readListing.2.00..read Next listing: ', listingInfo);
			listingInfo = readTable('table', listingInfo);
			log('readListing.2.0x..result is: ', listingInfo);
			break;
		default:
			break;

	}

};

//build two listing objects
console.log("Start.0.0.build new object: ", backupListing, listingInfo);
backupListing = new Listing();
listingInfo = new Listing();

//call readListing
console.log("Start.0.00.call readlisting(): ");
readListing(0);
	

//Listen for messages from the popup
//Setup the listener for popup layer
chrome.runtime.onMessage.addListener(function (msg, sender, response){

	//First, validate the message's structure
	console.log("onMessage.0.0..readinglist.js got a message:")

	if ((msg.from === 'popup') && (msg.subject === 'listingInfo')) {

		console.log('onMessage.1.0..popup request to read next listing:');

		readListing(1);

		response(listingInfo);

	};

	if ((msg.from === 'popup') && (msg.subject === 'currentListingInfo')) {

		console.log('onMessage.2.0..popup request to read Current listing:');

		response(listingInfo);

	};

	if ((msg.from === 'popup') && (msg.subject === 'repost')) {

		console.log("onMessage.3.0..get request to repost a listing: ");

		console.log("onMessage.3.1..readListing.js is posting: ", listingInfo)

		//send the reposted listing to background
		listingInfo.from = "readListing",
		listingInfo.subject = "backupListing";
		chrome.runtime.sendMessage(

			listingInfo,

			function(response){
				//send out the repost command
				//form object was saved when read the listing
				form.submit();
			}

		); 

		
		//send the feedback to popup.js
		//inform the popup.js the next listing info
		log('onMessage.3.2..read next Listing, send next Listing to popup: ')
		readListing(1);
		listingInfo.from = "readList";
		listingInfo.subject = "reposted";
		response(listingInfo);
	};
})


		
