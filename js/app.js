var persons = [];
var googleMapsAPIKey = "GOOGLE_MAPS_API_KEY_INSERT_HERE";

function getCountries() {
  // Object containing all the supported countries
  var countries = {
    "DK": "Denmark",
    "US": "USA"
  };

  // Return the object
  return countries;
}

function getCountryCode(countryShort) {
  var countryCode = null;
  // Switch to find countrycode based on the country key
  switch(countryShort) {
    case "DK":
      countryCode = "+45";
    break;
    case "US":
      countryCode = "+1";
    break;
    default:
    break;
  }

  // Return the result
  return countryCode;
}

function updateCountries() {
  var countries = getCountries();

  for (var key in countries) {
    var option = $("<option></option>", {
      text: countries[key],
      value: key
    });

    $("#country").append(option);
  }
}

function removePerson(index) {
  // Check how many persons exists
  var personCount = persons.length;
  // Remove person from array, if it's more than 1
  if (personCount > 1) {
    var remove = persons.splice($.inArray(index, persons), 1);
  } else {
    // Clear the array, if there's only 1 person
    persons = [];
  }

  // Save the new persons array/storage
  savePersons();
  // Refresh the menu and storage
  getSavedPersons();
  // Remove the person info container
  $("#person-info").remove();
}

function getFormDataIds() {
  var formData = [];

  // Fetch all the forms fields and the labels related to them
  $("form div").each(function() {
    var result = $(this).find(':input').attr("id");
    var label = $("form label[for='" + result + "']").text();

    // Insert the information into the array
    formData[label] = result;
  });

  // Return the result
  return formData;
}

function showPersonInfo(index) {
  var formData = getFormDataIds();
  var infoId = "person-info";

  // Check if person info exists on page
  // Insert the container if it doesn't
  var infoCheck = $("#" + infoId).length;
  if (!infoCheck) {
    var info = $("<div></div>", {
      id: infoId
    }).appendTo("#content");

    for (var key in formData) {
      $("<p id='" + formData[key] + "-info'></p>").appendTo("#" + infoId);
    }
    $("<a href='#' class='remove' onClick='removePerson(" + index + ")'>Remove</a>").appendTo("#" + infoId);
  }

  // Check if google maps exists on the page
  // If it doesn't insert one
  var gMapsCheck = $("#google-maps").length;
  if (!gMapsCheck) {
    $("<iframe id='google-maps' width='100%' height='450' frameborder='0' style='border:0' src='' allowfullscreen></iframe>").appendTo("#" + infoId);
  }

  var person = persons[index];

  // Interate over the persons data and print it out.
  for (var key in formData) {
    var value = formData[key];
    if (person[value] !== "") {
      $("#" + value + "-info").text(key + ": " + person[value]);
    } else {
      $("#" + value + "-info").text(key + ": None given.");
    }
  }

  // If the person has location data, insert a google map with the address
  if (person.street && person.zipcode && person.city && person.country) {
    var googleMapsQuery = "https://www.google.com/maps/embed/v1/place?key=" + googleMapsAPIKey + "&q=" + encodeURIComponent(person.street + ", " + person.zipcode + ", " + person.city + ", " + person.country);
    $("#google-maps").attr("src", googleMapsQuery);
  } else {
    // Remove google maps
    $("#google-maps").remove();
    console.log("Removing Google maps!");
  }
}

function addPersonToMenu(index) {
  // Get full name and add it to the menu.
  var fullname = persons[index].firstname + " " + persons[index].lastname;
  var menuItem = $("<li><a href='#' onClick='showPersonInfo(" + index + ")'>" + fullname + "</a></li>").appendTo("#menu ul");
}

function resetMenu() {
  // Clears the menu except for the first element
  $("#menu ul li").not(":first").remove();
}

function uppercaseFirstLetter(str) {
  return str[0].toUpperCase() + str.slice(1);
}

function sortByName(a, b) {
  // Retreive both persons fullname and make it uppercase (just in case)
  var aFullname = uppercaseFirstLetter(a.firstname + " " + a.lastname);
  var bFullname = uppercaseFirstLetter(b.firstname + " " + b.lastname);
  // Compare names and return the value for the sort function
  return ((aFullname < bFullname) ? -1: ((aFullname > bFullname) ? 1 : 0));
}

function getSavedPersons() {
  // Retrieves persons from local storage
  var personData = JSON.parse(localStorage.getItem("persons"));
  if (personData !== null) {
    var personCount = personData.length;
    // If it's not empty then rebuild the menu and set the persons object equal to the value of the local storage
    resetMenu();
    if (personCount > 0) {
      persons = personData;
      console.log("Sorting persons...");
      persons.sort(sortByName);
      for (var key in persons){
        addPersonToMenu(key);
      }
    } else {
      console.log("No saved persons found...");
    }
  }
}

function clearFormular() {
  // Clears all the value fields in the form
  var formData = getFormDataIds();
  for (var key in formData) {
    var field = formData[key];
    if (field !== "country") {
      $("#" + formData[key]).val("");
    } else {
      $("#" + formData[key]).val("none");
    }
  }
}

function onSubmit(e) {
  e.preventDefault(); // Prevent redirect for submit

  // Check if local storage is supported
  if (typeof(Storage) !== "undefined") {
    console.log("Begin storage!");

    // Check how many persons exists
    var personCount = 0;
    if (persons !== null) {
      personCount = persons.length;
    }

    // Get country code based on the value
    var country = $("#country").val();
    var countryCode = getCountryCode(country);

    // Prepend countrycode in the phone number
    var phone = $("#phone").val();
    if (countryCode !== null) {
      phone = countryCode + phone;
    }

    // Set persons values
    var formData = getFormDataIds();
    var person = {};
    for (var key in formData) {
      var field = formData[key];
      if (field !== "phone" && field !== "firstname" && field !== "lastname") {
        person[field] = $("#" + field).val();
      } else if (field === "firstname" || field === "lastname") {
        var value = $("#" + field).val();
        // Makes the name in uppercase (to make it grammatically correct)
        person[field] = uppercaseFirstLetter(value);
      } else {
        person[field] = phone;
      }
    }

    // Insert the new person in the persons storage
    persons[personCount] = person;
    // Save the current persons storage
    savePersons();
    console.log("Person saved...");
    // Reload persons and menu
    getSavedPersons();
    console.log("Persons refreshed!");
    // Clear the forms value fields
    clearFormular();
  } else {
    console.log("No storage available...");
    $("<p class='notification error'>Sorry, but your browser doesn't support local storage.</p>").appendTo("#content");
  }
}

function savePersons() {
  localStorage.setItem("persons", JSON.stringify(persons));
}

$("form").submit(onSubmit);

$(document).ready(function() {
  // Update the select with countries
  console.log("Retrieving countries...");
  updateCountries();
  // Retrieve the saved persons
  console.log("Checking for saved persons...");
  getSavedPersons();
});
