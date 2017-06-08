//background.js

'use strict';

var log = console.log;

var backupListing;  // keep the reposted listing

//Listing object
function Listing(status, postID, manage, title, postedDate, from, subject){
  this.status = status || '';
  this.postID = postID || '';
  this.manage = manage || '';
  this.title = title || '';
  this.postedDate = postedDate || '';
  this.from = from || '';
  this.subject = subject || '';

};

backupListing = new Listing();

console.log("bg.0: background listners:");

chrome.runtime.onMessage.addListener(function (msg, sender, response) {
  
  log("bg.addListener.0: ", msg.from, msg.subject)
  // First, validate the message's structure
  if ((msg.from === 'content') && (msg.subject === 'showPageAction')) {
    console.log("bg.1:", msg.from, msg.subject);
    // Enable the page-action for the requesting tab
    chrome.pageAction.show(sender.tab.id);
  };

  if ((msg.from === 'readListing') && (msg.subject === 'listingReposted')){
    console.log("bg.2:",msg.from, msg.subject);
  	//keep the listing info to object listingbackup
  	backupListing = msg;
  	console.log("bg.2.1: write listing", backupListing);
  };

  if ((msg.from === 'readListing') && (msg.subject === 'fetchBackupListing')){
    console.log("bg.3:", msg.from, msg.subject);
  	//send back the previous listing
  	console.log("bg.3.1 send back the backupListing to readListing.js:", backupListing);
  	response(backupListing);
    return true;
  };

  //readinglist.js read a repostable listing, ask background.js to keep it as record
  if ((msg.from === 'readListing') && (msg.subject === 'backupListing')){
    console.log("bg.4:", msg.from, msg.subject);
    //keep the listing info to object listingbackup
    if (msg.status != ''){
        console.log("bg.4.1.backup a repostable listing as per readListing.js' request:", backupListing);
        backupListing = msg;
        console.log("bg.4.2.I send the backupListing back to readListing.js:");
        response(backupListing);
        return true;
    }
    else
    {
      console.log("bg.4.1.1.do not backup an empty listing:", backupListing);
    }
  };

});