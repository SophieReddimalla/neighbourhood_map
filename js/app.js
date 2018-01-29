var map, clientID, clientSecret;
clientID = 'SQSGESXCSAYVICAACUP2PM2QKJVNFRKFVC4ISJMXMQE454U3';
clientSecret = '2KV3KHVLV0DLQJ2YGB12TWXPH305HPNQ0LFLUIUNUSWMZBKI';

function ViewModel() {
    var self = this;

    this.searchOption = ko.observable("");
    this.markers = [];

    this.BounceMarker = function () {
        //TODO : Open InfoWindow
        self.showInfoWindow(this, self.currentInfoWindow);
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout((function () {
            this.setAnimation(null);
        }).bind(this), 1500);
    };

    this.showInfoWindow = function (marker, currentInfoWindow) {

        var fsApiUrl = 'https://api.foursquare.com/v2/venues/search' +
        '?ll=' +  marker.position.lat() + ',' + marker.position.lng() + 
        '&client_id=' + clientID +
        '&client_secret=' + clientSecret + 
        '&query=' + marker.title +
        '&v=20170801' +
        '&limit=1' ;
        
        $.getJSON(fsApiUrl).done(function(json) {
            var response = json.response.venues[0];
            self.street = response.location.formattedAddress[0];
            self.city = response.location.formattedAddress[1];
            self.zip = response.location.formattedAddress[2];
            self.category = response.categories[0].name;
            
            self.infoWindowContent =
                '<h5>' + marker.title + '</h5>' +
                '<h5>(' + self.category +')</h5>' +
                '<div>' +
                '<h6> Address: </h6>' +
                '<p>' + self.street + '</p>' +
                '<p>' + self.city + '</p>' +
                '<p>' + self.zip + '</p>' +
                '</div>' ;
                currentInfoWindow.setContent(self.infoWindowContent);
        }).fail(function() {
            // Send alert
            alert(
                "There was an Problem with Foursquare API. Please check your connection and try again."
            );
            
        });
        

        
        
        currentInfoWindow.open(map,marker);
    }
    this.initMap = function () {
        //set canvas and options of map - center of map at kharadi pune.
        var mapCanvas = document.getElementById('map');
        var mapOptions = {
            zoom: 19,
            center: new google.maps.LatLng(18.549782, 73.942344),
            styles: styles
        };

        map = new google.maps.Map(mapCanvas, mapOptions);

        //Create a general Infowindow to be used later.

        this.currentInfoWindow = new google.maps.InfoWindow();
        this.new_marker = null;
        for (var i = 0; i < locationData.length; i++) {

            this.new_marker = new google.maps.Marker({
                map: map,
                position: {
                    lat: locationData[i].lat,  
                    lng: locationData[i].lng
                },
                title: locationData[i].title,
                id: i,
                animation: google.maps.Animation.DROP
            });
            
            this.new_marker.addListener('click', self.BounceMarker);
            this.markers.push(this.new_marker);
            this.new_marker = null
        }
    };

    this.initMap();

    this.LocationFilter = ko.computed(function () {
        var result = [];
        for (var i = 0; i < this.markers.length; i++) {
            var markerLocation = this.markers[i];
            if (markerLocation.title.toLowerCase().includes(this.searchOption().toLowerCase())) {
                result.push(markerLocation);
                this.markers[i].setVisible(true);
            } else {
                this.markers[i].setVisible(false);
            }
        }
        return result;
    }, this);
}


googleError = function googleError() {
    alert(
        'Oops. Google Maps did not load. Please refresh the page and try again!'
    );
};

function startApp() {
    ko.applyBindings(new ViewModel());
};