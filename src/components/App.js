import React, {Component} from 'react';
import LocationList from './LocationList';

class App extends Component {
    /**
     * Constructor
     */
    constructor(props) {
        super(props);
        this.state = {
            'alllocations': [
                {'name': "Ujjawal Packers and Movers",
                    'type': "Moving Company",
                    'latitude': 26.9053802,
                    'longitude': 75.7259451,
                    'streetAddress': "Lalarpura Rd, Gandhi Path, Ind"},
                {'name': "Rahul Bakery Shop",
                    'type': "Backer's Shop",
                    'latitude': 26.9055411,
                    'longitude': 75.725137,
                    'streetAddress': "Plot No. 11, Vivek Vihar, Ind"},
                {'name': "Taj",
                    'type': "Restaurant",
                    'latitude': 26.906970,
                    'longitude': 75.743848,
                    'streetAddress': "18th Street, Gautam Marg, Ind"},
                {'name': "PVR Cinemas",
                    'type': "Movie Theater",
                    'latitude': 26.912831,
                    'longitude': 75.748389,
                    'streetAddress': "B-19, Vaibhav Complex, Ind"},
                {'name': "DTDC Courier",
                    'type': "Courier Service",
                    'latitude': 26.911203,
                    'longitude': 75.738678,
                    'streetAddress': "A5/19, Vaishali Tower, Ind"},
                {'name': "Hotel Seven Stars",
                    'type': "5 Star Hotel",
                    'latitude': 26.906269,
                    'longitude': 75.739383,
                    'streetAddress': "A-63, Nemi Nagar, Gandhi Path, Ind"},
                {'name': "Vedik Vidya Niketan Public School",
                    'type': "School",
                    'latitude': 26.905546,
                    'longitude': 75.738765,
                    'streetAddress': "B-1, Opposite Bharat Apartment, Ind"},
                {'name': "Shri Hanuman Mandir",
                    'type': "Hindu Temple",
                    'latitude': 26.902166,
                    'longitude': 75.740979,
                    'streetAddress': "B-12, Sector 9, Chitrakoot, Ind"},
                {'name': "Raj Marriage Garden",
                    'type': "Banquet Hall",
                    'latitude': 26.906864,
                    'longitude': 75.739889,
                    'streetAddress': "A1/15, Arpit Nagar, Ind"},
                {'name': "ICICI Bank ATM",
                    'type': "ATM",
                    'latitude': 26.913079,
                    'longitude': 75.743407,
                    'streetAddress': "D-15, Lalarpura Road, Gandhi Path, Ind"}
            ],
            'map': '',
            'infowindow': '',
            'prevmarker': ''
        };

        // retain object instance when used in the function
        this.initMap = this.initMap.bind(this);
        this.openInfoWindow = this.openInfoWindow.bind(this);
        this.closeInfoWindow = this.closeInfoWindow.bind(this);
    }

    componentDidMount() {
        // Connect the initMap() function with-in this class to the global window context, the so Google Maps can invoke it
        window.initMap = this.initMap;
        // For Asynchronou loading of Google Maps script, passing in the callback reference
        loadMapJS('https://maps.googleapis.com/maps/api/js?key=AIzaSyDh3g5CPsOlDQjg84GHiGr78n8XPVQxOwA&callback=initMap')
    }

    /**
     * Initialising the map once the google map's script is loaded
     */
    initMap() {
        var self = this;

        var mapview = document.getElementById('map');
        mapview.style.height = window.innerHeight + "px";
        var map = new window.google.maps.Map(mapview, {
            center: {lat: 26.9053802, lng: 75.7259451},
            zoom: 16,
            mapTypeControl: false
        });

        var InfoWindow = new window.google.maps.InfoWindow({});

        window.google.maps.event.addListener(InfoWindow, 'closeclick', function () {
            self.closeInfoWindow();
        });

        this.setState({
            'map': map,
            'infowindow': InfoWindow
        });

        window.google.maps.event.addDomListener(window, "resize", function () {
            var center = map.getCenter();
            window.google.maps.event.trigger(map, "resize");
            self.state.map.setCenter(center);
        });

        window.google.maps.event.addListener(map, 'click', function () {
            self.closeInfoWindow();
        });

        var alllocations = [];
        this.state.alllocations.forEach(function (location) {
            var longname = location.name + ' - ' + location.type;
            var marker = new window.google.maps.Marker({
                position: new window.google.maps.LatLng(location.latitude, location.longitude),
                animation: window.google.maps.Animation.DROP,
                map: map
            });

            marker.addListener('click', function () {
                self.openInfoWindow(marker);
            });

            location.longname = longname;
            location.marker = marker;
            location.display = true;
            alllocations.push(location);
        });
        this.setState({
            'alllocations': alllocations
        });
    }

    /**
     * Open the infowindow for the marker
     * @param {object} location marker
     */
    openInfoWindow(marker) {
        this.closeInfoWindow();
        this.state.infowindow.open(this.state.map, marker);
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
        this.setState({
            'prevmarker': marker
        });
        this.state.infowindow.setContent('Loading Data...');
        this.state.map.setCenter(marker.getPosition());
        this.state.map.panBy(0, -200);
        this.getMarkerInfo(marker);
    }

    /**
     * Retrive the location data from the foursquare api for the marker and display it in the infowindow
     * @param {object} location marker
     */
    getMarkerInfo(marker) {
        var self = this;
        var clientId = "M3RBGV3RIU2DWOHMC2UCWJC1OMDBDV2OXLY3Y1XTT1FSIRVU";
        var clientSecret = "PM3DMNBDGTZHJRJVQYVKKS0CRDCZEXOT2SVYSPMSMQRDWHM5";
        var url = "https://api.foursquare.com/v2/venues/search?client_id=" + clientId + "&client_secret=" + clientSecret + "&v=20130815&ll=" + marker.getPosition().lat() + "," + marker.getPosition().lng() + "&limit=1";
        fetch(url)
            .then(
                function (response) {
                    if (response.status !== 200) {
                        self.state.infowindow.setContent("Sorry data can't be loaded");
                        return;
                    }

                    // Examine the text in the response
                    response.json().then(function (data) {
                        var location_data = data.response.venues[0];
                        var verified = '<b>Verified Location: </b>' + (location_data.verified ? 'Yes' : 'No') + '<br>';
                        var checkinsCount = '<b>Number of CheckIn: </b>' + location_data.stats.checkinsCount + '<br>';
                        var usersCount = '<b>Number of Users: </b>' + location_data.stats.usersCount + '<br>';
                        var tipCount = '<b>Number of Tips: </b>' + location_data.stats.tipCount + '<br>';
                        var readMore = '<a href="https://foursquare.com/v/'+ location_data.id +'" target="_blank">Read More on Foursquare Website</a>'
                        self.state.infowindow.setContent(checkinsCount + usersCount + tipCount + verified + readMore);
                    });
                }
            )
            .catch(function (err) {
                self.state.infowindow.setContent("Sorry data can't be loaded");
            });
    }

    /**
     * Close the infowindow for the marker
     * @param {object} location marker
     */
    closeInfoWindow() {
        if (this.state.prevmarker) {
            this.state.prevmarker.setAnimation(null);
        }
        this.setState({
            'prevmarker': ''
        });
        this.state.infowindow.close();
    }

    /**
     * Render function of App
     */
    render() {
        return (
            <div>
                <LocationList key="100" alllocations={this.state.alllocations} openInfoWindow={this.openInfoWindow}
                              closeInfoWindow={this.closeInfoWindow}/>
                <div id="map" role="application" aria-label="map"></div>
            </div>
        );
    }
}

export default App;

/**
 * Load the google maps Asynchronously
 * @param {url} url of the google maps script
 */
function loadMapJS(src) {
    var ref = window.document.getElementsByTagName("script")[0];
    var script = window.document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    window.gm_authFailure = () => {
        document.write("Google Maps API Authorization Failure");
    };
    script.onerror = function () {
        document.write("Google Maps can't be loaded");
    };
    ref.parentNode.insertBefore(script, ref);
}