# disruptive
Internship case of study by Thibault THEOLOGIEN

## Requirements
* [nodejs](https://nodejs.org/en/)
* [npm](https://www.npmjs.com)
* [curl](https://curl.haxx.se)

## Quick start
```bash
# Install dependancies
$ npm install

# Get events from RSS
$ node script.js rss

# Get events from RSS
$ node script.js web

# Display events sent
$ cat save.json
```

## Goal
Write down an algorithm that will :
* Produce queries on Fintech event
* Translate those results in the right format to suggest events to the calendar.

This automated suggestions will still use Manual interaction to confirm or delete suggested events.

You should be able to launch your algorithm with previous notification for us to know when it started & when it finished.


## Resolution of the problem

### How data are sent to the server?
At first, I needed to know how the information entered by the user on the web agenda is sent to the server.
With an analysis of the source code, I found that it's the wordpress plugin [pro event calendar](http://wpsleek.com/pro-event-calendar-documentation/), which generate and control the agenda. But the documentation of this plugin is very minimalist, and it was impossible for me to know how the data is sent to the server.

Next, I tried to find directly in the source code if the server url was specified somewhere, but without real success. I only found that the form which permit to send the data written by the user to the server are using POST method, but any `action` attribute is specified.

Finally, I found a solution with the chrome devtool: when the form is sent, it's possible to get the http request from the network tab.

So, from this tool, I found that the request has the following format (using curl):
```bash
$ curl 'http://www.disruptivefinance.co.uk/wp-admin/admin-ajax.php?lang='-H 'Cookie: PHPSESSID=liqmrurpcn3ba3g6pj5jvktel6; __smToken=0qh4kCMsxZ6dr9kmHPC3VRI6' -H 'Origin: http://www.disruptivefinance.co.uk' -H 'Accept-Encoding: gzip, deflate'  -H 'Accept-Language: fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36' -H 'Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryD0gOHOowhRasNcqp' -H 'Accept: */*' -H 'Referer: http://www.disruptivefinance.co.uk/fintech-events-in-london/' -H 'X-Requested-With: XMLHttpRequest' -H 'Connection: keep-alive' --data-binary $'------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="title"\r\n\r\ntitle\r\n------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="description"\r\n\r\ndescription\r\n------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="category-162"\r\n\r\n162\r\n------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="category-176"\r\n\r\n176\r\n------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="category-164"\r\n\r\n164\r\n------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="category-89"\r\n\r\n89\r\n------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="category-163"\r\n\r\n163\r\n------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="category-245"\r\n\r\n245\r\n------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="date"\r\n\r\n2017-05-03\r\n------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="end_date"\r\n\r\n2017-05-04\r\n------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="time_hours"\r\n\r\n00\r\n------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="time_minutes"\r\n\r\n00\r\n------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="end_time_hh"\r\n\r\n01\r\n------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="end_time_mm"\r\n\r\n00\r\n------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="event_image"\r\n\r\n\r\n------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="link"\r\n\r\nlink\r\n------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="location"\r\n\r\nlocation\r\n------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="pec_custom_contact"\r\n\r\nemail\r\n------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="pec_custom_name"\r\n\r\nname\r\n------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="calendar"\r\n\r\n1\r\n------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="action"\r\n\r\nsubmitEvent\r\n------WebKitFormBoundaryD0gOHOowhRasNcqp\r\nContent-Disposition: form-data; name="postEventsNonce"\r\n\r\n590fabe094\r\n------WebKitFormBoundaryD0gOHOowhRasNcqp--\r\n' --compressed
```

### How subscribing to fintech event feeds?
The first solution I've thought was to subscribe to RSS feed which talking about Fintech events in London. But there are very few. For example, one of them is subscribing to your [Fintech agenda](http://www.disruptivefinance.co.uk/2017/02/27/london-fintech-calendar-back/).
The others only refer web articles on the Fintech subject, but not on events.

So I thought to use `google news` to find Fintech events. But the functionality to transform search request into RSS feed, and to subscribe to them was removed few months ago.

Next, I decided to search on Twitter if Fintech events are announced with some hashtags or some professional account. But all the events I found were outdated.

Finally, I chose to develop two solutions:
  * the first one consume [this](https://www.fnlondon.com/fintech/rss/) RSS feed to generate http queries. I know that this feed only provide some Fintech news, and not events. But if an RSS feed with events is found, we just need (in theory) to change the `requestRSSLink` constant in the code, for having a workable London Fintech event query generator.
  * the second one used a regularly updated [website](http://fintechprofile.com/fintech-event-calendar-2017/) that display related events. So I developed a small HTML parser.

  The main problem of this solution is that the code is totally dependent to the website. Another is that, in contrary of RSS feeds, the text is not formatted: the date format used by the editor is different in several places, so I didn't implement the post of the date of the event in the queries.

### How to produce queries?
With the chrome devtool I obtained an example of curl request. So the script just needed to run a similar curl command. The http header used is almost the same, I just deleted unused parameters.
For the data (like the title, the description or the date of the event), I was just needed to fill the gaps in the `--data-binary` part of the request, from the results of the two functions cited upper.

__NOTE__: As we can see in the curl request, a bit higher in the text, the form input data are visible in the `--data-binary` part of the command. They are always preceded by `WebKitFormBoundary` followed by a hashed string. But I don't know this hash is generated, so I always use the same and I don't guaranty the success of the request.

### How to notify the user?
An import and an export as JSON function were developed for the script. It permit to know when was the last execution of the script, and to detect if an event was already sent in an older execution (all the sent events are saved in the JSON file).

## Conclusion
It's impossible for me to tell if the script is functional or not for several reasons.
The main is that I haven't got any access to the server, so it's impossible for me to know if the generated http requests are well received.
Furthermore, there are too much unknown points, like the hashed string after `WebKitFormBoundary` in the request.
But I think that the script I made is good proof of concept if we considere the time I spent to develop it and the informations I had.

In conclusion, I'm a little bit disapointed by the result of my work. I expected to find some good RSS feed on the net: I think that's the best solution to produce easily formated queries.
Furthermore, I think that the wordpress plugin used is too much restrive and the documentation not complete enought for this type of problem.
But perhaps I went in the wrong direction, and there was an easier way to resolve this problem.
