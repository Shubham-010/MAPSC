'use strict';


const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
let map, mapEvent,workout;





//! Date and workout data
class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10); // Unique ID for each workout
  clicks = 0;
  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
   
  }
    __setDescription(){
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${this.date.getMonth()} ${this.date.getDate()}`;
}
_clicks(){
  this.clicks += 1;
}
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence; // in steps/min
    this.calcPace();
     this._setDescription();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain; // in meters
    this.calcSpeed();
    this._setDescription()
  }
  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}
class App {
  #map;
  #mapEvent;
  #mapZoomLevel;
  #workout = [];
  constructor() {
    this._getPosition();
    this._setLocalStorage();
    //! Form input validation
    //! Form submission
    form.addEventListener('submit', this._newWorkout.bind(this));

    //! Toggle elevation/cadence input fields based on workout type
    inputType.addEventListener('change', this._toggleElevationField.bind(this));

    containerWorkouts.addEventListener('click',this._moveToPopup);
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

  _showForm(mapE) {
    this.#mapEvent = mapE;
    console.log('mapEvent', mapEvent);
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _hideForm(){
      inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(()=> form.style.display === 'none' ? "":"" )
  }



  _toggleElevationField() {
    debugger;
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.value = inputElevation.value = '';
  }

  _newWorkout(e) {
    const validInput = (...inputs) => inputs.every(inp => Number.isFinite(inp));
    const allpositive = (...inputs) => inputs.every(inp => inp > 0);

    debugger;
    console.log(this, 'neww');
    e.preventDefault();

// Get Data from form

const type = inputType.value;
const distance = inputDistance.value;
const duration = inputDuration.value;
const { lat, lng } = this.#mapEvent.latlng;


if(type === 'running'){
  //? Check if the data is valid.
  const cadence = +inputCadence.value;
  if (!validInput(distance,duration,cadence) || !allpositive(distance,duration)) return alert('Input has to be positive numbers...!!'); 

  workout = new Running([lat,lng],distance,duration,cadence);
}

if(type === 'cycling'){
  const elevation = +inputElevation.value;
  if(!validInput(distance,duration,elevation) || !allpositive(distance,duration)) return alert("Input has to be positive numbers...!!")
    workout = new Cycling([lat,lng],distance,duration,elevation);
  }

this.#workout.push(workout);

console.log('workout :>> ', workout);

    // Clear input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
 
   this._renderWorkoutMarker(workout);
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(`${workout.type === 'running' ? '🏃‍♀️' : '🚴‍♀️'}`)
      .openPopup();
  }

  _renderworkout(){
    const html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.name === 'running' ? '🏃‍♂️' : '🚴‍♂️'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">24</span>
            <span class="workout__unit">min</span>
          </div>
    `;
    if(workout.type === 'running'){
      html += `
       <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(2)}</span>
            <span class="workout__unit">min/km</span>
          </div>
           <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
      `
    }
    if(workout.type === 'cycling'){
      html += `
         <div class="workout__details">
            <span class="workout__icon">🏃‍♂️</span>
            <span class="workout__value">5.2</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">24</span>
            <span class="workout__unit">min</span>
          </div>
      `;

      form.insertAdjacentHTML('afterend',)
    }
  }

  _moveToPopup(){
    const workoutEL = e.target.closest('.workout');
    console.log('workout :>> ', workoutEL);
    if(!workoutEL) return;

    const workout = this.#workout.find(  
      work => work.id === workoutEL.dataset.id
    );
    console.log('workout :>> ', workout);

    this.#map.setView(workout.coords,this.#mapZoomLevel,{
      animate:true,
      pan:{
        duration:1
      }
    }
  )
  workout.click();
};
_setLocalStorage(){
 localStorage.setItem('workout',JSON.stringify(this.#workout))
}
}

const app = new App();
