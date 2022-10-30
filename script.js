'use strict';

class Workout {
    date = new Date()
    id = (Date.now() + '').slice(-10)
  
    constructor(coords, distance, duration) {
      // this.date = ...
      // this.id = ...
      this.coords = coords; // [lat, lng]
      this.distance = distance; // in km
      this.duration = duration; // in min
    }
  
    _setDescription() {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
      this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
        months[this.date.getMonth()]
      } ${this.date.getDate()}`;
    }
  
    click() {
      this.clicks++;
    }
  }
  
  class Running extends Workout {
    type = 'running';
  
    constructor(coords, distance, duration, cadence) {
      super(coords, distance, duration);
      this.cadence = cadence;
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
      this.elevationGain = elevationGain;
      // this.type = 'cycling';
      this.calcSpeed();
      this._setDescription();
    }
  
    calcSpeed() {
      // km/h
      this.speed = this.distance / (this.duration / 60);
      return this.speed;
    }
  }
  


const form = document.querySelector('.form')
const containerWorkouts = document.querySelector('.workouts')
const inputType = document.querySelector('.form__input--type')
const inputDistance = document.querySelector('.form__input--distance')
const inputDuration = document.querySelector('.form__input--duration')
const inputCadence = document.querySelector('.form__input--cadence')
const inputElevation = document.querySelector('.form__input--elevation')


const son = new Running(12, 12, [12,12], 12)
console.log(son)

class App{
    #map;
    #mapEvent
    #workouts = []
    #mapZoomLevel = 13;

    constructor(){
        this._getPosition()
        form.addEventListener('submit', this._newWorkout.bind(this))
        inputType.addEventListener('change', function(){
            inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
            inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
        })
        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this))
        this._getLocalStorage()
    }
    _getPosition(){
        if(navigator.geolocation)
            navigator.geolocation.getCurrentPosition
            (this._loadMap.bind(this), function (){
                alert('could not locate your position')
            })
    }                
    _loadMap(position){
        // const longtitute = position.coords.longtitute
        // console.log(longtitute, latitute)
        console.log(position.coords.latitude,position.coords.longitude)
        const coords = [position.coords.latitude, position.coords.longitude]
        const lat = position.coords.latitude
        const long = position.coords.longitude
        this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="https://www.openstreetmap.fr/hot/copyright">OpenStreetMap</a> contributors'}).addTo(this.#map);
        this.#map.on('click', this._showForm.bind(this))
        this.#workouts.forEach(work => {
          this._renderWorkoutMarker(work);
        });
        console.log(this)
    }
    _showForm(mapE){
        this.#mapEvent = mapE
        form.classList.remove('hidden')
    }
    _hideForm() {
      // Empty inputs
      inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value =
        '';
    }

    _newWorkout(e){
        e.preventDefault()
        const validInputs = (...inputs) =>
        inputs.every(inp => Number.isFinite(inp));
        const allPositive = (...inputs) => inputs.every(inp => inp > 0);
        // Get data from form
        const type = inputType.value;
        const distance = +inputDistance.value
        const duration = +inputDuration.value
        const { lat, lng } = this.#mapEvent.latlng
        let workout;
        //check if data is valid
        if (type === 'running') {
            const cadence = +inputCadence.value;
      
            // Check if data is valid
            if (
              // !Number.isFinite(distance) ||
              // !Number.isFinite(duration) ||
              // !Number.isFinite(cadence)
              !validInputs(distance, duration, cadence) ||
              !allPositive(distance, duration, cadence)
            )
              return alert('Inputs have to be positive numbers!');
                
            workout = new Running([lat, lng], distance, duration, cadence);
          }
        //if cycling running create workout
        if (type === 'cycling') {
          const elevation = +inputElevation.value;
    
          if (
            !validInputs(distance, duration, elevation) || !allPositive(distance, duration)
          )
            return alert('Inputs have to be positive numbers!');
    
           workout = new Cycling([lat, lng], distance, duration, elevation);
        }
      // Add new object to workout array
      this.#workouts.push(workout)

      // Render workout on map as marker
      this._renderWorkoutMarker(workout)

      // Render workout on list
      this._renderWorkout(workout)

      // Hide form + clear input fields
      this._hideForm()

      // Set local storage to all workouts
      this._setLocalStorage()
    


    }
    _renderWorkoutMarker(workout){
      var geojsonFeature = {

        "type": "Feature",
        "properties": {},
        "geometry": {
                "type": "Point",
                "coordinates": [workout.coords]
        }
    }

        L.marker(workout.coords).addTo(this.#map).bindPopup(L.popup({
            maxWidth:  200,
            minWidth:100,
            closeOnClick: false,
            className: `${workout.type}-popup`,
            autoClose: false
            })
        )
        .setPopupContent(`${
          workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
         } ${workout.description}`)
        .openPopup(); 
        var tempMarker = this;


    }

    
    _renderWorkout(workout) {
      let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
      `

      if (workout.type === 'running')
        html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
        `
  
      if (workout.type === 'cycling')
        html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
        `
  
      form.insertAdjacentHTML('afterend', html)
    }
    _moveToPopup(e) {
      if (!this.#map) return
  
      const workoutEl = e.target.closest('.workout');
  
      if (!workoutEl) return
  
      const workout = this.#workouts.find(
        work => work.id === workoutEl.dataset.id
      );
  
      this.#map.setView(workout.coords, this.#mapZoomLevel, {
        animate: true,
        pan: {
          duration: 1,
        },
      })

    }
    _setLocalStorage() {
      localStorage.setItem('workouts', JSON.stringify(this.#workouts))
    }
    _getLocalStorage(){
      const data = JSON.parse(localStorage.getItem('workouts'))
      
      if (!data) return

      this.#workouts = data

      this.#workouts.forEach(work => {
        this._renderWorkout(work)
      })
    }
    reset() {
      localStorage.removeItem('workouts');
      location.reload();
    }

}

const app = new App()
