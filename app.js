function initialize() {
  var mapOptions = {
    center: { lat: 39, lng: -95},
    zoom: 5
  };
  return new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
}

//function getDogs() {
//  var dogs = [];
//  console.log("starting recursive search");
//  searchRecursive(dogs,'');
//  console.log(dogs.length);
//}

//function searchRecursive(dogs,lastOffset) {
//  var request = {
//    key      : "27b4cabee8cd541f668231c32fb140fc",
//    animal   : "dog",
//    location : "80134",
//    offset   : lastOffset,
//    count    : 1000,
//    format   : "json"
//  };
//	
//	var r = $.ajax({
//		url: "http://api.petfinder.com/pet.find",
//		data: request,
//		dataType: "jsonp",
//		type: "GET",
//		})
//	.done(function(r){
//    console.log(r);
//    var petArray = r.petfinder.pets.pet;
//    for (var i in petArray) {
//      dogs.push(petArray[i]);
//    }
//    searchRecursive(dogs,r.petfinder.lastOffset);
//	})
//	.fail(function(jqXHR, error, errorThrown){
//    console.log("fail");
//	});
//}

function setBreeds() {
  var b = $('#breeds');

  var request = {
    key    : "27b4cabee8cd541f668231c32fb140fc",
    animal : "dog",
    format : "json"
  };
	
	var r = $.ajax({
		url: "http://api.petfinder.com/breed.list",
		data: request,
		dataType: "jsonp",
		type: "GET",
		})
	.done(function(r){
    var breedArray = r.petfinder.breeds.breed;
    for (var i in breedArray) {
      b.append('<option>'+breedArray[i].$t+'</option>');
    }
	})
	.fail(function(jqXHR, error, errorThrown){
    console.log("fail");
	});
}

function search(zip,breed,sex,callback) {
  //console.log("zip="+zip);
  //console.log("breed="+breed);
  //console.log("sex="+sex);

  var request = {
    key      : "27b4cabee8cd541f668231c32fb140fc",
    animal   : "dog",
    breed    : breed,
    sex      : sex,
    location : zip,
    count    : 50,
    format   : "json"
  };
	
	var r = $.ajax({
		url: "http://api.petfinder.com/pet.find",
		data: request,
		dataType: "jsonp",
		type: "GET",
    success: callback,
		})
	.done(function(r){
    console.log("done");
	})
	.fail(function(jqXHR, error, errorThrown){
    console.log("fail");
	});
}

function setMarker(address,dogs,map) {
	var request = {
    address: address,
    key    : "AIzaSyB7inW471vVvUL883yr0BITjG53T7b1Gl8"};
	
	var r = $.ajax({
		url: "https://maps.googleapis.com/maps/api/geocode/json",
		data: request,
		dataType: "json",
		type: "GET",
		})
	.done(function(r){
    var loc = r.results[0].geometry.location;
    var latLng = new google.maps.LatLng(loc.lat,loc.lng);
    console.log(latLng);
    var marker = new google.maps.Marker({
      position: latLng,
      map: map,
      animation: google.maps.Animation.DROP});
    markers.push(marker);

    var contentString = 
      '<p>'+dogs.length+' matching dogs at this location. Click for more details</p>';
    var infowindow = new google.maps.InfoWindow({content: contentString});

    google.maps.event.addListener(marker,'mouseover',function() {
      infowindow.open(map,marker);
    });

    google.maps.event.addListener(marker,'mouseout',function() {
      infowindow.close();
    });

    google.maps.event.addListener(marker,'click',function() {
      console.log(dogs);
      classie.add(document.body,'pmr-open');
      document.body.appendChild(mask);
      var results = $('#resultsBody');
      results.empty();
      for (var i in dogs) {
        var dogInfo = showSelected(dogs[i]);
			  results.append(dogInfo);
      }
    });

	})
	.fail(function(jqXHR, error, errorThrown){
    console.log("fail");
	});
}

function showSelected(dog) {
  var img = '';
  if (typeof dog.media.photos != 'undefined') {
    var photoArray = dog.media.photos.photo;
    if (typeof photoArray != 'undefined') {
      img = '<img src="'+photoArray[3].$t+'" style="width:200px;height:200px">';
    }
  }

	var result = $('.templates .dog').clone();

	var photo = result.find('.photo');
  photo.html(img);

  var name = result.find('.info #name');
  var nt = dog.name.$t;
  nt = nt.replace(/\d+/g,'').replace('-','');
  name.text(nt);

  var sex = result.find('.info #sex');
  var st = dog.sex.$t;
  if (st=='M') st = 'Male';
  else if (st=='F') st = 'Female';
  sex.html('<span class="label">Sex:</span> '+st);

  var age = result.find('.info #age');
  var at = dog.age.$t;
  age.html('<span class="label">Age:</span> '+at);

  var breed = result.find('.info #breed');
  var breedArray = dog.breeds.breed;
  var bt = '';
  if (breedArray.length>1) {
    bt = breedArray[0].$t;
  } else {
    bt = breedArray.$t;
  }
  if (dog.mix.$t=='yes') {
    bt = bt+' (mixed)';
  }
  breed.html('<span class="label">Breed:</span> '+bt);

  var desc = result.find('.info #desc');
  var dt = dog.description.$t;
  desc.html('<span class="label">Info:</span> '+dt);
  //desc.mouseover(function() {
  //  console.log('set full desc');
  //  $('#descFull').html(dt).toggle(true);
  //})
  //.mouseout(function() {
  //  $('#descFull').toggle(false);
  //});;

  var email = result.find('.info #email');
  var et = dog.contact.email.$t;
  email.html('<span class="label">Email:</span> '+et);

  var phone = result.find('.info #phone');
  var pt = dog.contact.phone.$t;
  phone.html('<span class="label">Phone:</span> '+pt);

  return result;
}

function setDogs(data) {
  //console.log("setDogs called");
  console.log(data);
  var petArray = data.petfinder.pets.pet;
  var dogs = [];
  for (var i in petArray) {
    dogs.push(petArray[i]);
  }
  updateMap(dogs);
}

function updateMap(dogs) {
  var addressDogs = {};
  for (var i in dogs) {
    var contact = dogs[i].contact;
    var a1 = contact.address1.$t;
    var c = contact.city.$t;
    var z = contact.zip.$t;
    var as = a1+', '+c+', '+z;

    var dlist = addressDogs[as];
    if (typeof dlist == 'undefined') {
      dlist = [dogs[i]];
      addressDogs[as] = dlist;
    } else {
      dlist.push(dogs[i]);
    }
  }
  for (var key in addressDogs) {
    console.log(key);
    setMarker(key,addressDogs[key],map);
  }
}

var map;
var markers = [];
var mask = document.createElement('div');
mask.className = 'mask';

$(document).ready(function() {
  map = initialize();
  //var m = setMarker("14098 Hillrose Dr, Parker, CO 80134",map);

  setBreeds();

  $('.goSearch').submit(function() {

    // Clear any old markers
    for (var i=0; i<markers.length; i++) {
      markers[i].setMap(null);
    }

    var zip = $('#zip').val();

    var be = document.getElementById('breeds');
    var bt = be.options[be.selectedIndex].text;

    var se = document.getElementById('sex');
    var st = se.options[se.selectedIndex].text;

    if (bt=="All Breeds") bt = '';
    if (st=="Male or Female") {
      st = '';
    } else if (st=="Male") {
      st = 'M';
    } else {
      st = 'F';
    }

    search(zip,bt,st,setDogs);
  });

  mask.addEventListener('click',function() {
    classie.remove(document.body,'pmr-open');
    document.body.removeChild(mask);
  });
});
