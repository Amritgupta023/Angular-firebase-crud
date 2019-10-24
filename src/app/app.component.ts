import { Component, OnInit } from '@angular/core';
import { AngularFirestore, } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';

import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from 'angularfire2/storage';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'angular-firebase-crud';
  // products: Observable<any[]>;
  products: any;
  productform: FormGroup;

  ref: AngularFireStorageReference;
  task: AngularFireUploadTask;



  constructor(
    private firestore: AngularFirestore,
    private fb: FormBuilder,
    private afStorage: AngularFireStorage
  ) {
    this.getProduct().subscribe((el) => {
      this.products = el.map((item) => {
        return { ...item.payload.doc.data(), id: item.payload.doc.id };
      });
    })
  }





  ngOnInit() {
    this.initializeProductForm();
  }


  getProduct() {
    return this.firestore.collection('products').snapshotChanges();
  }
  onFileChanged(event) {
    console.log("event", event);
    let file = event.target.files[0];
    this.getBase64(file).then((res) => {
      this.productform.get('base64String').setValue(res);
    });
  }

  getBase64(file) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = function (error) {
        console.log('Error: ', error);
      };
    })
  }

  initializeProductForm() {
    this.productform = new FormGroup({
      name: new FormControl(''),
      price: new FormControl(''),
      description: new FormControl(''),
      base64String: new FormControl('')
    });
  }

  onSubmitProduct() {
    console.log("the form value will be:", this.productform.value);
    let submittedProduct = this.firestore.collection('products')
      .add(this.productform.value)
      .then((res) => {
        this.productform.reset();
      })
      .catch((error) => {
        console.log("the catch will be::", error);
      });
    console.log("submitted product will be:", submittedProduct);
  }
  onUpdateProduct(product) {
    console.log("on update product", product);
  }

  onDeleteProduct(product) {
    console.log("the product will be::", product, product.$key);
    let deletedProduct = this.firestore.collection('products').doc(product.id)
      .delete()
      .then((res) => {
        console.log("the deleted Product will be::", res);
      })
      .catch((error) => {
        console.log("the error will be::in deleted prodcut will be::", error);
      })
  }

  uploadProgress:any;
  fileUrl:any;
  // : Observable<number>;

  onFileChangedCloud(event) {
    console.log("Event::", event.target.files[0]);
    const id = Math.random().toString(36).substring(2);
    console.log("id",id);
    this.ref = this.afStorage.ref(id);
    this.task = this.ref.put(event.target.files[0]);
    this.uploadProgress = this.task.percentageChanges().subscribe((res)=>{
      console.log("ssss",res,typeof res);
      this.uploadProgress = res;
    });
    this.fileUrl = this.task.snapshotChanges().subscribe((res)=>{
      console.log("res",res);
    })

  }

}
