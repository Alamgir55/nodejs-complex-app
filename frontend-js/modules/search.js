import axios from 'axios';

export default class Search{
    // 1. Select DOM elements, and keep track of any usefull data
    constructor(){
        this.injectHTML();
        this.headerSearchIcon = document.querySelector('.header-search-icon');
        this.overlay = document.querySelector('.search-overlay');
        this.closeIcon = document.querySelector('.close-live-search');
        this.inputField = document.querySelector('#live-search-field');
        this.resultsArea = document.querySelector('.live-search-results');
        this.loaderIcon = document.querySelector('.circle-loader');
        this.typingWaitTimer;
        this.previousValue = "";
        this.events();
    }


    // Events
    events(){
        this.inputField.addEventListener('keyup', ()=> this.keyPressHandler());
        this.closeIcon.addEventListener('click', () => this.removeMethod());
        this.headerSearchIcon.addEventListener('click', (e)=>{
            e.preventDefault();
            this.openOverlay();
        });
    }


    // Methods
    openOverlay(){
        this.overlay.classList.add('search-overlay--visible');
        setTimeout(()=> this.inputField.focus(), 50);
    }
    removeMethod(){
        this.overlay.classList.remove('search-overlay--visible');
    }
    keyPressHandler(){
      let value = this.inputField.value;

        if(value == ""){
          clearTimeout(this.typingWaitTimer);
            this.hideLoaderIcon();
            this.hideResultsArea();
        }
        
        if(value != "" && value != this.previousValue){
          clearTimeout(this.typingWaitTimer);
          this.showLoaderIcon();
          this.hideResultsArea();
          this.typingWaitTimer = setTimeout(()=> this.sendRequest(), 3000);
        }
      this.previousValue = value;
    }
    showLoaderIcon(){
      this.loaderIcon.classList.add('circle-loader--visible');
    }
    hideLoaderIcon(){
      this.loaderIcon.classList.remove('circle-loader--visible');
    }
    showResultsArea(){
      this.resultsArea.classList.add('live-search-results--visible')
    }

    hideResultsArea(){
      this.resultsArea.classList.remove('live-search-results--visible')
    }

    sendRequest(){
      axios.post('/search', {searchTerm: this.inputField.value}).then(response => {
        console.log(response.data);
        this.renderResultsHTML(response.data);
      }).catch(()=>{
        alert('Hello, Resquest Failed');
      })
    }

    renderResultsHTML(posts){
      if(posts.length){
        this.resultsArea.innerHTML = `<div class="list-group shadow-sm">
          <div class="list-group-item active"><strong>Search Results</strong> (4 items found)</div>

          <a href="#" class="list-group-item list-group-item-action">
            <img class="avatar-tiny" src="https://gravatar.com/avatar/b9216295c1e3931655bae6574ac0e4c2?s=128"> <strong>Example Post #1</strong>
            <span class="text-muted small">by barksalot on 0/14/2019</span>
          </a>
          <a href="#" class="list-group-item list-group-item-action">
            <img class="avatar-tiny" src="https://gravatar.com/avatar/b9408a09298632b5151200f3449434ef?s=128"> <strong>Example Post #2</strong>
            <span class="text-muted small">by brad on 0/12/2019</span>
          </a>
          <a href="#" class="list-group-item list-group-item-action">
            <img class="avatar-tiny" src="https://gravatar.com/avatar/b9216295c1e3931655bae6574ac0e4c2?s=128"> <strong>Example Post #3</strong>
            <span class="text-muted small">by barksalot on 0/14/2019</span>
          </a>
          <a href="#" class="list-group-item list-group-item-action">
            <img class="avatar-tiny" src="https://gravatar.com/avatar/b9408a09298632b5151200f3449434ef?s=128"> <strong>Example Post #4</strong>
            <span class="text-muted small">by brad on 0/12/2019</span>
          </a>
        </div>`;
      }else{
        this.resultsArea.innerHTML = `<p class="alert alert-danger text-center shadow-sm">Sorry, We could not find any results for that.</p>`;
      }
      this.hideLoaderIcon();
      this.showResultsArea();
    }

    injectHTML(){
        document.body.insertAdjacentHTML('beforeend', `<div class="search-overlay">
        <div class="search-overlay-top shadow-sm">
          <div class="container container--narrow">
            <label for="live-search-field" class="search-overlay-icon"><i class="fas fa-search"></i></label>
            <input type="text" id="live-search-field" class="live-search-field" placeholder="What are you interested in?">
            <span class="close-live-search"><i class="fas fa-times-circle"></i></span>
          </div>
        </div>
    
        <div class="search-overlay-bottom">
          <div class="container container--narrow py-3">
            <div class="circle-loader"></div>
            <div class="live-search-results"></div>
          </div>
        </div>
      </div>`);
    }
}