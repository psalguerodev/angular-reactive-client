import { Component, NgZone } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public endSearch: boolean;
  public showProgressBar: boolean;
  public results: string[] = [];
  public resultsHotel: any[] = [];
  public resultsObserver: Observable<string[]>;
  public resultsHotelsObserver: Observable<any[]>;

  public isHotels: boolean;

  constructor(private ngZone: NgZone) {}


  search(value: any) {
    value.preventDefault();
    this.isHotels = false;
    this.showProgressBar = true;
    this.endSearch = false;
    this.results = [];
    this.resultsHotel = [];
    this.resultsObserver = this.createEventObserver();
  }

  searchHotels(value: any) {
    value.preventDefault();
    this.isHotels = true;
    this.showProgressBar = true;
    this.endSearch = false;
    this.results = [];
    this.resultsHotel = [];
    this.resultsHotelsObserver = this.createHotelEventObserver();
  }

  createHotelEventObserver(): Observable<any[]> {
    return new Observable<any[]> ((observer: Observer<any[]>) => {
      const source = new EventSource(environment.apiUrlHotels);

      source.onmessage = (event) => {
        console.log('Hotels' , JSON.parse(event.data));
        this.resultsHotel.push(JSON.parse(event.data));
        this.resultsHotel.sort();

         // NgZone
         this.ngZone.run(() => observer.next(this.resultsHotel));
      };

      source.onopen = (event) => {
        if(this.endSearch) {
          source.close();
          this.ngZone.run(() => {
            observer.complete();
            this.showProgressBar = false;
          });
        }

        this.endSearch = true;
      };
    });
  }

  createEventObserver(): Observable<string[]> {
    return new Observable<string[]>((observer: Observer<string[]>) => {
      const source = new EventSource(environment.apiUrl);

      source.onmessage = (event) => {
        console.log(event.data);
        this.results.push(event.data);
        this.results.sort();

        // NgZone
        this.ngZone.run(() => observer.next(this.results));
      };

      source.onopen = (event) => {
        if (this.endSearch) {
          source.close();
          this.ngZone.run(() => {
            observer.complete();
            this.showProgressBar = false;
          });
        }

        this.endSearch = true;
      };

    });

  }
}
