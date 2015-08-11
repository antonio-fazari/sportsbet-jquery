'use strict';

var Parser = (function($) {

	function Parser(data) {
		this.data = data;
	}

	Parser.prototype.getData = function() {
	  return this.data;
	};

	Parser.prototype.getCompetitionEvents = function(competitionName) {
	  var events;
	  var competitions = this.data.Sportsbet.Competition;

	  $.each(competitions, function(key, value) {
	  	if (competitions[key].CompetitionName === competitionName) {
	  		events = competitions[key].Round.Event;
	  	}
	  });

	  return events;
	};

	Parser.prototype.getAllVenues = function(events) {
		var venues = [];
		var venueIsPresent;

		$.each(events, function(eventKey, value) {
			$.each(venues, function(venueKey, value) {
				if (venues[venueKey] == events[eventKey].Venue) {
					venueIsPresent = true;
					return false;
				} else {
					venueIsPresent = false;
				}
			});

			if (!venueIsPresent) {
				venues.push(events[eventKey].Venue);
			}
		});

		return venues;
	}

	Parser.prototype.filterEventsByType = function(events, marketType) {
		var filteredEvents = [];
		var key = marketType.replace(/\s/g, '');

		$.each(events, function(eventKey, value) {
			if (events[eventKey].Market !== undefined &&
					events[eventKey].Market instanceof Object) {
				// This event does not have multiple markets.
				if (events[eventKey].Market.Type === marketType) {
					events[eventKey][key] = events[eventKey].Market;
					filteredEvents.push(events[eventKey]);
				}
			} else if (events[eventKey].Market !== undefined &&
				events[eventKey].Market instanceof Array) {
				// This event has multiple markets, check if the given type is one
				// of them.
				$.each(events[eventKey].Market, function(marketKey, value) {
					if (events[eventKey].Market[marketKey].Type === marketType) {
						events[eventKey][key] = events[eventKey].Market[marketKey];
						filteredEvents.push(events[eventKey]);
					}
				});
			}
		});

		return filteredEvents;
	}

	Parser.prototype.filterEventsByVenue = function(events, venue) {
		var filteredEvents = [];

		$.each(events, function(key, value) {
			// Cycle through each event and filter events with the given venue.
			var Venue = events[key].Venue.toLowerCase();
			if (Venue !== undefined && Venue === venue) {
				filteredEvents.push(events[key]);
			}
		});

		return filteredEvents;
	};

	return Parser;

})(jQuery);
