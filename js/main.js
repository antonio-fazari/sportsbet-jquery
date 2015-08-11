'use strict';

(function($) {
  // Load sportsbet data using jQuery ajax GET request.
  var url = 'http://affiliate.sportsbet.com.au/xmlfeeds/Racing.jsnp';

  $.ajax({
     type: 'GET',
      url: url,
      async: false,
      jsonpCallback: 'loadSportBetData',
      contentType: "application/json",
      dataType: 'jsonp',
      success: function(data) {
         loadSportBetData(data);
      },
      error: function(e) {
         console.log(e.message);
      }
  });

  /**
	 * Get url parameters.
	 */
	var urlParams;
	(window.onpopstate = function () {
	    var match,
	        pl     = /\+/g,  // Regex for replacing addition symbol with a space
	        search = /([^&=]+)=?([^&]*)/g,
	        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
	        query  = window.location.search.substring(1);

	    urlParams = {};
	    while (match = search.exec(query)) {
	       urlParams[decode(match[1]).toLowerCase()] = decode(match[2]).toLowerCase();
	    }
	})();

	/**
	 * Load and parse sportsbet data.
	 */
	function loadSportBetData(data) {
		// Hide loading message.
		$('.message').hide();

		// Initiate parser.
	  var parser = new Parser(data);
	  var events = parser.getCompetitionEvents('Horses - Aus/NZ');
	      events = parser.filterEventsByType(events, 'Fixed Odds');

	  // Get all venues and populate the select filter.
	  var venues = parser.getAllVenues(events);
	  populateVenueFilter(venues);

	  if (urlParams.venue !== undefined && urlParams.venue) {
	  	// Update the heading to include the current venue.
	  	var heading = $('h2.subtitle').html(urlParams.venue);
	  	events = parser.filterEventsByVenue(events, urlParams.venue);
	  }

	  var $eventsElement = $('#events');
	  var eventsData = { events: [] };

	  $.each(events, function(key, value) {
	  	var context = populateEventHeaderContext(events[key], {});
	  			context = populateEventRunnersContext(events[key], context);

	  	eventsData.events.push(context);
	  });

	  // Get the Handlebars template and compile it with the events data.
	  var eventsTemplateScript = $("#events-template").html();
		var theTemplate = Handlebars.compile(eventsTemplateScript);
		$eventsElement.append(theTemplate(eventsData));

	  // Build jump timer for each of the events.
	  setInterval(function() {
	  	$eventsElement.find('.event').each(function(index, element) {
	  		var $eventJumpTime = $(this).find('.event-jump-time');
	  		var utcDate = $eventJumpTime.data('utcDate');

	  		$eventJumpTime.html('Jump time: ' + getEventJumpTime(utcDate));
	  	});
	  }, 1000);
	}

	/**
	 * Create event header element.
	 */
	function populateEventHeaderContext(event, context) {
		var utcDate = moment.utc(event.EventDate).toDate();
		var formattedDate = moment(utcDate).format('DD/MM/YYYY	HH:mm a');
		var jumpTime = getEventJumpTime(utcDate);

  	context.eventName = event.EventName;
  	context.eventVenue = event.Venue;
  	context.eventDate = 'Event Date: ' + formattedDate;
  	context.eventMarketType = 'Event Market Type: ' + event.FixedOdds.Type;
  	context.eventTime = 'Jump Time: ' + jumpTime;
  	context.eventUtcDate = utcDate;

		return context;
	}

	/**
	 * Create event runners element
	 */
	function populateEventRunnersContext(event, context) {
		var eventSelections = event.FixedOdds.EventSelections;
				context.runners = [];

		$.each(eventSelections, function(key, value) {
			context.runners.push({
				eventRunnerName: eventSelections[key].EventSelectionName,
				eventRunnerOdds: eventSelections[key].Bet.Odds,
				rowClass: key % 2 === 0 ? 'even' : 'odd'
			});
		});

		return context;
	}

	/**
	 * Populate venue filter with venue options.
	 */
	function populateVenueFilter(venues) {
		var venueFilter = document.getElementById('venue-filter');
				venueFilter.addEventListener('change', filterByVenue);

		for (var i = 0; i < venues.length; i++) {
			var option = document.createElement('option');
					option.value = venues[i].toLowerCase();
					option.innerHTML = venues[i];

			venueFilter.appendChild(option);
		}
	}

	/**
	 * Filter by venue for change event.
	 */
	function filterByVenue() {
		var href;
		var venue = document.getElementById('venue-filter').value;
		// IE Fix - window.location.origin doesn't exist.
		if (window.location.origin === undefined) {
		  window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
		}
		var base = window.location.origin + window.location.pathname;

		if (venue !== 'default' && venue) {
			if (venue !== 'all') {
				href = base + '?venue=' + venue;
			} else {
				href = base;
			}
		}

		window.location.href = href;
	}

	/**
	 * Get the difference between a given date and the current one in minutes.
	 */
	function getEventJumpTime(eventDate) {
		var diffHours = -(moment().diff(eventDate, 'hours'));
		var diffMinutes = -(moment().diff(eventDate, 'minutes') % 60);
		var diffSeconds = -(moment().diff(eventDate, 'seconds') % 60);

		return diffHours + 'hrs ' + diffMinutes + 'mins ' + diffSeconds + 'secs';
	}

})(jQuery);
