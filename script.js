// Thibault THEOLOGIEN
// 2017-05-04

// IMPORTS
var http = require('http');
var cheerio = require('cheerio');
var exec = require('child_process').exec;
var fs = require('fs');
var diff = require('deep-diff').diff;
var feed = require("feed-read");

// VARIABLES
const fileName = './save.json';
const requestLink = 'http://fintechprofile.com/fintech-event-calendar-2017/';
const postLink = 'http://www.disruptivefinance.co.uk/wp-admin/admin-ajax.php?lang=';
const requestRSSLink = 'https://www.fnlondon.com/fintech/rss/';
const headers = " \
-H 'Cookie: PHPSESSID=liqmrurpcn3ba3g6pj5jvktel6; __smToken=0qh4kCMsxZ6dr9kmHPC3VRI6' \
-H 'Origin: http://www.disruptivefinance.co.uk' \
-H 'Accept-Encoding: gzip, deflate' \
-H 'Accept-Language: fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4' \
-H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36' \
-H 'Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryD0gOHOowhRasNcqp' \
-H 'Accept: */*' \
-H 'Referer: http://www.disruptivefinance.co.uk/fintech-events-in-london/' \
-H 'X-Requested-With: XMLHttpRequest' \
-H 'Connection: keep-alive'";
var contentTemplate = {
  "title": "",
  "description": "",
  "category162": "",
  "category176": "",
  "category164": "",
  "category89": "",
  "category163": "",
  "category245": "",
  "date": "",
  "end_date": "",
  "time_hours": "",
  "time_minutes": "",
  "end_time_hh": "",
  "end_time_mm": "",
  "link": "",
  "location": "",
  "pec_custom_contact": "",
  "pec_custom_name": "",
  "calendar": ""
}

// FUNCTIONS
const getRSSEvents = function(link, lastExecution) {
  var content;
  var send = [];
  var eventList = lastExecution.eventList;

  feed(link, function(err, events) {
    var event;
    var date;
    if (err) throw err;

    for (var i = 0; i < events.length; i++) {
      event = events[i];
      date = new Date(event.published);
      content = JSON.parse(JSON.stringify(contentTemplate));
      content.title = event.title;
      content.link = event.link;
      content.description = event.content;
      content.date = date.toLocaleDateString();
      content.time_hours = date.getHours();
      content.time_minutes = date.getMinutes();
      if (!isEventAlreadySent(lastExecution.eventList, content)) {
        send.push(content);
        eventList.push(content);
      }
    }
    saveJSON(fileName, eventList);
    curl(send);
  });
}

// TODO Recover web link from <a> tag
const getWebsiteEvents = function(link, lastExecution) {
  var content = '';
  var send = [];
  var eventList = lastExecution.eventList;
  var req = http.request(link, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      content += chunk;
    });

    res.on('end', function () {
      var $ = cheerio.load(content)
      var children = $('.entry > ul > li > strong');

      for (var i = 1; i < children.length; i++) {
        var child = children[i];
        var info = $(child.parent).clone().children().remove().end().text().toLowerCase().replace('\n', '');
        var name = $(child).text().replace('\n', '');
        if (info.includes('london')) {
          content = JSON.parse(JSON.stringify(contentTemplate));
          info = info.substring(0, info.indexOf('london') - 2);
          content.title = name;
          content.date = info;
          content.location = 'london';
          if (!isEventAlreadySent(lastExecution.eventList, content)) {
            send.push(content);
            eventList.push(content);
          }
        }
      }
      saveJSON(fileName, eventList);
      curl(send);
    });
  });

  req.end();
}

const curl = function(send) {
  var cmd;
  send.map((content, indice) => {
    cmd = 'curl ' + postLink + headers + completeDataBinaries(content) + ' --compressed';
    exec(cmd, function(error, stdout, stderr) {
      console.log("POST REQUEST :" + stdout);
    });
  });
}

const completeDataBinaries = function(content) {
  return ' --data-binary \
  $\'------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="title"\r\n\r\n' + content.title + '\r\n\
  ------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="description"\r\n\r\n' + content.description + '\r\n\
  ------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="category-162"\r\n\r\n' + content.category162 + '\r\n\
  ------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="category-176"\r\n\r\n' + content.category176 + '\r\n\
  ------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="category-164"\r\n\r\n' + content.category164 + '\r\n\
  ------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="category-89"\r\n\r\n' + content.category89 + '\r\n\
  ------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="category-163"\r\n\r\n' + content.category163 + '\r\n\
  ------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="category-245"\r\n\r\n' + content.category245 + '\r\n\
  ------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="date"\r\n\r\n' + content.date + '\r\n\
  ------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="end_date"\r\n\r\n' + content.end_date + '\r\n\
  ------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="time_hours"\r\n\r\n' + content.time_hours + '\r\n\
  ------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="time_minutes"\r\n\r\n' + content.time_minutes + '\r\n\
  ------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="end_time_hh"\r\n\r\n' + content.end_time_hh + '\r\n\
  ------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="end_time_mm"\r\n\r\n' + content.end_time_mm + '\r\n\
  ------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="event_image"\r\n\r\n\r\n\
  ------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="link"\r\n\r\n' + content.link + '\r\n\
  ------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="location"\r\n\r\n' + content.location + '\r\n\
  ------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="pec_custom_contact"\r\n\r\n' + content.pec_custom_contact + '\r\n\
  ------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="pec_custom_name"\r\n\r\n' + content.pec_custom_name + '\r\n\
  ------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="calendar"\r\n\r\n' + content.calendar + '\r\n\
  ------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="action"\r\n\r\nsubmitEvent\r\n\
  ------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="postEventsNonce"\r\n\r\n590fabe094\r\n\
  ------WebKitFormBoundaryD0gOHOowhRasNcqp--\r\n\''
}

const isEventAlreadySent = function(oldList, newEvent) {
  for (var i=0; i < oldList.length; i++) {
    if (diff(oldList[i], newEvent) === undefined)
      return true;
  }
  return false;
}

const saveJSON = function(fileName, eventList) {
  var date = new Date(Date.now());
  var json = {
    date,
    eventList
  }

  fs.writeFile(fileName, JSON.stringify(json), function(err) {
    if(err) throw new Error(err);
    console.log('Save of event list done');
  });
}

const importJSON = function(fileName) {
  return require(fileName);
}

const fileExists = function(fileName) {
  return fs.existsSync(fileName);
}

const main = function() {
  var lastExecution = {
    date: "",
    eventList: []
  };

  if (fileExists(fileName)) {
    lastExecution = importJSON(fileName);
    let date = new Date(lastExecution.date);
    console.log('Last execution: ' + date.toLocaleDateString() + ' at ' + date.toLocaleTimeString());
  }
  else console.log('First execution');

  if (process.argv.length >=3) {
    if (process.argv[2] === 'rss') getRSSEvents(requestRSSLink, lastExecution);
    if (process.argv[2] === 'web') getWebsiteEvents(requestRSSLink, lastExecution);
  }
}

main();
