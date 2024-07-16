import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  constructor() { }

  private filteredRestaurantsSource = new BehaviorSubject<any[]>([]);
  filteredRestaurants$ = this.filteredRestaurantsSource.asObservable();
 
  private filteredMenuSource = new BehaviorSubject<any[]>([]);
  filteredMenu$ = this.filteredMenuSource.asObservable();

  setFilteredRestaurants(restaurants: any[]) {
    this.filteredRestaurantsSource.next(restaurants);
  }
  setFilteredMenu(menu: any[]) {
    this.filteredMenuSource.next(menu);
  }
  
}
