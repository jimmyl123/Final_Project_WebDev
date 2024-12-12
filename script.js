const OPENWEATHERMAP_API_KEY = 'dcf0ac3b4daa47827b9d0aac4f0aa00d';
const TICKETMASTER_API_KEY = 'rmzAR7ukIuwPu57UwFjRzApBALNh1q6p';

let currentWeatherCondition = '';


function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}


document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        scrollToSection(targetId);
    });
});

document.getElementById('get-started-button').addEventListener('click', () => {
    scrollToSection('weather');
});

// Set default mood board message
function setDefaultMoodBoardMessage() {
    const moodMessage = document.getElementById('mood-message');
    const moodBoard = document.getElementById('mood-board');
    moodMessage.textContent = 'Here you will see some cute images of the weather to help make a decision about what to do today.';
    moodBoard.style.backgroundImage = 'none';
}

// Fetch weather data based on user input
function getWeather() {
    const city = document.getElementById('city-input').value.trim();
    if (!city) {
        alert('Please enter a city name.');
        return;
    }

    // Get city coordinates
    const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${OPENWEATHERMAP_API_KEY}`;

    fetch(geocodeUrl)
        .then(response => response.json())
        .then(geocodeData => {
            if (geocodeData.length === 0) {
                throw new Error('City not found. Please check the city name and try again.');
            }
            const { lat, lon } = geocodeData[0];
            getWeatherData(lat, lon, city);
        })
        .catch(error => {
            console.error('Error fetching geolocation data:', error);
            alert(error.message);
        });
}

// Fetch weather data using OpenWeatherMap
function getWeatherData(lat, lon, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=imperial`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching weather data.');
            }
            return response.json();
        })
        .then(data => {
            displayWeather(data);
            getEvents(city);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            alert(error.message);
        });
}

function displayWeather(data) {
    const weatherDisplay = document.getElementById('weather-display');
    const weatherHeading = document.getElementById('weather-heading');
    const weatherDescription = document.getElementById('weather-description');
    const moodMessage = document.getElementById('mood-message');
    const moodBoard = document.getElementById('mood-board');

    const weatherTemp = document.getElementById('weather-temp');
    const weatherMainDesc = document.getElementById('weather-main-desc');
    const weatherIcon = document.getElementById('weather-icon');
    const weatherHumidity = document.getElementById('weather-humidity');
    const weatherWind = document.getElementById('weather-wind');

    const temp = data.main.temp;
    const weatherCondition = data.weather[0].main;
    const description = data.weather[0].description;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const iconCode = data.weather[0].icon;

    weatherHeading.textContent = `${data.name}: ${temp}°F, ${weatherCondition}`;
    weatherDescription.textContent = getActivitySuggestion(weatherCondition);

    weatherTemp.textContent = `${temp}°F`;
    weatherMainDesc.textContent = capitalizeFirstLetter(description);
    weatherIcon.src = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = weatherCondition;

    weatherHumidity.textContent = humidity;
    weatherWind.textContent = windSpeed.toFixed(1);

    // Update mood board with image and activity suggestion
    const moodImage = getMoodImage(weatherCondition);
    const activitySuggestion = getActivitySuggestion(weatherCondition);
    moodBoard.style.backgroundImage = `url(${moodImage})`;
    moodMessage.textContent = activitySuggestion;

    weatherDisplay.classList.remove('hidden');
    currentWeatherCondition = weatherCondition;
}

// Fetch events using Ticketmaster API
function getEvents(city) {
    const eventsUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TICKETMASTER_API_KEY}&city=${encodeURIComponent(city)}`;

    fetch(eventsUrl)
        .then(response => response.json())
        .then(data => {
            if (!data._embedded || data.page.totalElements === 0) {
                console.log('No events found.');
                displayNoEventsMessage();
                return;
            }
            const events = data._embedded.events.slice(0, 5);
            displayEvents(events);
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            alert('Error fetching events. Please try again later.');
        });
}

function displayEvents(events) {
    const eventsContainer = document.getElementById('events');
    const eventsList = document.getElementById('events-list');
    eventsList.innerHTML = '';

    events.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event';

        const eventName = event.name || 'No title';
        const eventDescription = event.info || 'No description available.';
        const eventDate = event.dates.start.dateTime || event.dates.start.localDate;
        const eventUrl = event.url || '#';

        eventDiv.innerHTML = `
            <h3>${eventName}</h3>
            <p>${eventDescription}</p>
            <p><strong>Date:</strong> ${new Date(eventDate).toLocaleString()}</p>
            <a href="${eventUrl}" target="_blank" rel="noopener noreferrer">View Event</a>
        `;

        eventsList.appendChild(eventDiv);
    });

    eventsContainer.classList.remove('hidden');
}

// Display message if no events are found
function displayNoEventsMessage() {
    const eventsContainer = document.getElementById('events');
    const eventsList = document.getElementById('events-list');
    eventsList.innerHTML = '<p>No events found for this location.</p>';
    eventsContainer.classList.remove('hidden');
}

const recommendations = {
    Clear: {
        activity: "It's a beautiful day! Consider attending an outdoor event.",
        moodImage: "images/sunny.png"
    },
    Rain: {
        activity: "It's raining. Maybe check out some indoor events.",
        moodImage: "images/rainy.png"
    },
    Snow: {
        activity: "Snow is falling! Look for cozy indoor activities.",
        moodImage: "images/snowy.png"
    },
    Clouds: {
        activity: "A cloudy day. Perfect for any event!",
        moodImage: "images/cloudy.png"
    },
    Thunderstorm: {
        activity: "Stormy weather outside. Stay safe and consider indoor events.",
        moodImage: "images/thunderstorm.png"
    },
    Drizzle: {
        activity: "Light rain outside. Maybe find something indoors.",
        moodImage: "images/drizzle.png"
    },
    Mist: {
        activity: "A misty day. Explore some local events!",
        moodImage: "images/mist.png"
    },
    Fog: {
        activity: "Foggy conditions. Indoor events might be best.",
        moodImage: "images/fog.png"
    },
    Haze: {
        activity: "Hazy weather. Stay safe and enjoy indoor activities.",
        moodImage: "images/haze.png"
    },
    Dust: {
        activity: "Dusty conditions. Best to stay indoors.",
        moodImage: "images/dust.png"
    },
    Sand: {
        activity: "Sandy weather. Indoor events are recommended.",
        moodImage: "images/sand.png"
    }
};

// Get activity suggestion based on weather condition
function getActivitySuggestion(weatherCondition) {
    return recommendations[weatherCondition]?.activity || "Enjoy your day!";
}

// Get mood image based on weather condition
function getMoodImage(weatherCondition) {
    return recommendations[weatherCondition]?.moodImage || "images/default.jpg";
}

// Capitalize the first letter of a string
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Attach the weather fetch to the button
document.getElementById('get-weather-button').addEventListener('click', getWeather);

// Initialize default mood board message on load
document.addEventListener('DOMContentLoaded', setDefaultMoodBoardMessage);