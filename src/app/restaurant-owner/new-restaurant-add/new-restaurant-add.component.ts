import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { imageOverlay } from 'leaflet';
import { OwnerService } from '../../services/owner.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-restaurant-add',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './new-restaurant-add.component.html',
  styleUrl: './new-restaurant-add.component.css'
})
export class NewRestaurantAddComponent {
  restaurantInfoForm!: FormGroup;
  isImageSaved: boolean = false;
  cardImageBase64: string = '';
  restaurantImages:string[]=[];
  userId: number | null = null;
  constructor(private fb: FormBuilder,private ownerService:OwnerService) { }
  ngOnInit(): void {
    this.userId = Number(localStorage.getItem('userid'));
    this.initForm();
  }
  initForm(): void {
    this.restaurantInfoForm = this.fb.group({
      restaurantName: ['', Validators.required],
      address: ['', Validators.required],
      resimage: ['', Validators.required],
      OpeningTime: ['', Validators.required],
      ClosingTime: ['', Validators.required],
      menuItems: this.fb.array([])
    });
  }
  
  get menuItems(): FormArray {
    return this.restaurantInfoForm.get('menuItems') as FormArray;
  }
  addMenuItem(): void {
    this.menuItems.push(this.createMenuItem());
  }


  createMenuItem(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      price: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      image: [null, Validators.required],
    });
  }

  removeMenuItem(index: number): void {
    this.menuItems.removeAt(index);
  }
  convertToHHMMSS(time: string): string {
    return `${time}:00`;
  }
   removeBase64Prefix(base64String: string): string {
    const prefix = "data:image/jpeg;base64,";
    return base64String.replace(prefix, "");
  }
  
   base64ToByteArray(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
  
  async onSubmit(): Promise<void> {
    console.log("hello")
    if (this.restaurantInfoForm.valid) {
      
      const formData = this.restaurantInfoForm.value;

      console.log(formData)
      const openingTime = this.convertToHHMMSS(formData.OpeningTime);
      const closingTime = this.convertToHHMMSS(formData.ClosingTime);
      const menuItems = await Promise.all(formData.menuItems.map(async (item: any,index: number) => {
  
        return {
          itemName: item.name,
          price: item.price,
          description: item.description,
          category: item.category,
          image: this.removeBase64Prefix(this.restaurantImages[index])
        };
      }));

      const dataToSubmit = {
        restaurantName: formData.restaurantName,
        location: formData.address,
        latitude: 40.7128,
        longitude: -74.0060,
        ratings: 0,
        resimage: this.removeBase64Prefix(this.cardImageBase64),
        opening: openingTime,
        closing: closingTime,
        isClosed: false,
        closeStartDate: null,
        closeEndDate: null,
        availableTables: 20,
        bookingTimings: 2,
        menuItems: menuItems,
        userId: this.userId
      };

      console.log('Data to submit:', dataToSubmit);
      try {
        const response = await this.ownerService.addRestaurantWithMenu(dataToSubmit).toPromise();
        console.log('Response:', response);
        this.resetForm();
        Swal.fire({
          title: 'Success!',
          text: 'New Restaurant has success BigBite. \n Enjoy Your BigBite Experience',
          icon: 'success',
          confirmButtonText: 'OK'
        });      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          title: 'Error!',
          text: 'There was an in adding your restaurant. \n Please try again after sometime.',
          icon: 'error',
          confirmButtonText: 'OK'
        });      }
    } else {
      this.restaurantInfoForm.markAllAsTouched();
    }
  }

  resetForm(): void {
    this.restaurantInfoForm.reset();
    this.restaurantInfoForm.setControl('menuItems', this.fb.array([]));
  }
  CreateBase64String(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const image = new Image();
        image.src = e.target.result;
        image.onload = rs => {
          const imgBase64Path = e.target.result;
          this.cardImageBase64 = imgBase64Path;         
          this.isImageSaved = true;
          console.log(this.cardImageBase64);
        };
      };
      reader.readAsDataURL(fileInput.target.files[0]);
    }
  }
  RestaurantImages(fileInput: any,index:any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const image = new Image();
        image.src = e.target.result;
        image.onload = rs => {
          const imgBase64Path = e.target.result;
          this.restaurantImages[index] = imgBase64Path;         
          this.isImageSaved = true;
          console.log(this.cardImageBase64);
        };
      };
      reader.readAsDataURL(fileInput.target.files[0]);
    }
  }
  
  scrollToSection(sectionId: string) {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.error(`Element with id '${sectionId}' not found.`);
    }
  }
  async convertImageToBase64(imageFile: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(imageFile);
    });
  }
  
  handleImageUpload(imageFile: HTMLInputElement, index: number): void {
    if (imageFile.files && imageFile.files.length > 0) {
      const file = imageFile.files[0]; 
      const menuItemForm = this.menuItems.at(index) as FormGroup;
      menuItemForm.get('image')?.setValue(file); 
    }
  }
}
