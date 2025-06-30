'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
let map, mapEvent;

class App {
  #map;
  #mapEvent;
  constructor() {
    this._getPosition();
    //! Form input validation
    //! Form submission
    form.addEventListener('submit', this._newWorkout.bind(this));

    //! Toggle elevation/cadence input fields based on workout type
    inputType.addEventListener('change', this._toggleElevationField.bind(this));
  }

  _getPosition() {
    //!Navigating to user's current location and logging it
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert(
            'Could not get your position. Please allow location access in your browser settings.'
          );
        },
        {}
      );
    }
  }

  _loadMap(position) {

    console.log(position);
    console.log(this);
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    //   console.log(`https://www.google.com/maps/@${latitude},${longitude},15z`);

    this.#map = L.map('map').setView([latitude, longitude], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //! Add Marker on click
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE){
    debugger
      this.#mapEvent = mapE;
        console.log('mapEvent', mapEvent);
        form.classList.remove('hidden');
        inputDistance.focus();
  }

  _toggleElevationField(){
    debugger
     inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
      inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
      inputCadence.value = inputElevation.value = '';
  }

  _newWorkout(){
    debugger
    console.log(this,"neww")
  e.preventDefault();
  // Clear input fields
  inputDistance.value =
    inputDuration.value =
    inputCadence.value =
    inputElevation.value =
      '';
  const { lat, lng } = this.#mapEvent.latlng;
  L.marker([lat, lng])
    .addTo(this.#map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup',
      })
    )
    .setPopupContent('New workout')
    .openPopup();
  }

}


const app = new App();







