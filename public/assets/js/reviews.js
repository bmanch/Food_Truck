getFoodTrucks();

function getFoodTrucks() {
	$.get("/api/foodtrucks", function(data) {
		for (var i = 0; i < data.length; i++) {
			var li = $("<li>");
			var link = $("<a>").addClass("ftNames").attr("href", "#").text(data[i].name);
			li.append(link);
			$("#currentTrucks").append(li);
		}

		$(".ftNames").on("click", function(event) {
			event.preventDefault();
			$("#selectedTruck").text($(this).text());
			$("#myModalLabel").text($(this).text());
			$("#tweets").empty();
			$("#currentReviews").empty();
			$("#received").text("");
			$("#averageRating").html("");
			$("#range").text("");
			$("#cuisine").text("");
			$("#popDish").text("");
			$("#menu").text("");
			$("#website").text("");
			$("#twitterHandle").text("");
			getFoodTruckData($(this).text());
		});
	});
}

function getFoodTruckData(ft) {
	var queryUrl = "/api/reviews/" + ft;

	$.get(queryUrl, function(data) {
		console.log(data);
		parseFTData(data);
	});
}

//AS OF NOW, WE ARE ONLY DISPLAYING THE REVIEWER'S NAME AND REVIEW, BUT WE CAN DISPLAY THEIR FAVORITE FOOD AND THEIR ACTUAL RATING IF WE WANT TO
function parseFTData(data) {
	var truckD = data.foodtruckData;
	var twitterD = data.tweetsData;
	var reviewsD = data.reviewsData;

	$("#truckName").text(truckD.name);
	$("#averageRating").html("Rating: <strong>" + truckD.current_rating + "</strong><small>       (" + truckD.total_ratings + " reviews)</small>");
	$("#range").text("1 = Don't bother ... 5 = Must try this truck");
	$("#cuisine").text("Cuisine: " + truckD.food_type);
	$("#truckReviews").text("Some real truckin' reviews...");

	if (truckD.popular_item !== "none") {
		$("#popDish").text("Gotta' try: " + truckD.popular_item);
	}

	if (truckD.menu_download !== "no menu") {
		var link = $("<a>");
		link.attr("href", truckD.menu_download);
		link.text("Download");
		$("#menu").text("Menu: ");
		$("#menu").append(link);
	}

	if (truckD.website !== "www.none.com") {

		var tWebsite = truckD.website;

		if (tWebsite.startsWith("http://") || tWebsite.startsWith("https://")) {
			if (tWebsite.startsWith("http://")) {
				tWebsite = tWebsite.replace("http://", "");
			} else {
				tWebsite = tWebsite.replace("https://", "");
			}
 		}

		var link = $("<a>");
		link.attr("href", "http://" + tWebsite);
		link.attr("target", "_blank");
		link.text(tWebsite);
		$("#website").text("Website: ");
		$("#website").append(link);
	}

	if (!twitterD) {
		$("#twitterHandle").text("This truck is old school and has no twitter.");
	} else {
		$("#truckDescription").text(twitterD.description);
		$("#twitterHandle").text("@" + truckD.twitter_handle);

		var tHeader = $("<h5>");
		tHeader.text(truckD.name + " tweets...");
		$("#tweets").append(tHeader);

		for (var i = 0; i < twitterD.tweet.length; i++) {
			var ptag = $("<p>");
			ptag.addClass("tweetLeft");
			ptag.html(twitterD.created[i] + ": " + twitterD.tweet[i]);
			$("#tweets").append(ptag);
		}
	}

	if (!reviewsD) {
		$("#truckReviews").text("There are no reviews yet for this truck. Be the first to review!");
	} else {
		for (var i = 0; i < reviewsD.length; i++) {
			if (reviewsD[i].review !== "") {
				var ptag = $("<p>");
				ptag.text(reviewsD[i].user_name + " says: " + reviewsD[i].review)
				$("#currentReviews").append(ptag);
			}
		}
	}

	$("#ftInfo").css("display", "block");
}

$("#reviewSubmit").on("click", function(event) {
	event.preventDefault();
	var rating = $("#rating").val().trim();
	console.log(rating);

	if (rating === "1" || rating === "2" || rating === "3" || rating === "4" || rating === "5") {

		var queryUrl = "/api/review/" + $("#myModalLabel").text();

		var reviewObject = {
			user_name: $("#userName").val().trim(),
			rating: $("#rating").val().trim(),
			fav_food: $("#exampleFavFood").val().trim(),
			review: $("#reviews").val().trim()
		}

		if (reviewObject.user_name === "") {
			reviewObject.user_name = "One food truck expert";
		}

		console.log(reviewObject);

		$.post(queryUrl, reviewObject, function(data) {
			$("#averageRating").html("Rating: <strong>" + data[0] + "</strong><small>       (" + data[1] + " reviews)</small>");
			$("#range").text("1 = Don't bother ... 5 = Must try this truck");
			var ptag = $("<p>");
			ptag.text(reviewObject.user_name + " says: " + reviewObject.review);
			$("#truckReviews").text("Some real truckin' reviews...");
			$("#currentReviews").prepend(ptag);
			$("#userName").val("");
			$("#rating").val("");
			$("#exampleFavFood").val("");
			$("#reviews").val("");
			$("#received").text("Thanks for your review!");
			$("#closer").click();
		});
	} else {
		$("#rating").val("");
		$("#isNum").addClass("has-error has-feedback");
		$("#rating").attr("placeholder", "Please choose a number from 1-5.");
	}
});

