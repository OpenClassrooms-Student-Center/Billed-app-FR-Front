
import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, firestore, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.firestore = firestore
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    new Logout({ document, localStorage, onNavigate })
  }

  firestoreHandler = (fileName, file, isExtensionCorrect) => {
    if (this.firestore) {
      this.firestore.storage
        .ref(`justificatifs/${fileName}`)
        .put(file)
        .then((snapshot) => snapshot.ref.getDownloadURL())
        .then((url) => {
          this.fileUrl = url
          this.fileName = fileName
        });
    }
  };

  handleChangeFile = () => {
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    const filePath = file.name.split(/\\/g)
    const fileName = filePath[filePath.length - 1]

    const fileExtension = fileName.split(".").pop()
    const extensionRgx = /(png|jpg|jpeg)/g
    const isExtensionCorrect = fileExtension.toLowerCase().match(extensionRgx)

    if(isExtensionCorrect) {
      this.firestoreHandler(fileName, file, isExtensionCorrect)
    } else if(!isExtensionCorrect) {
      alert('file type not allowed')
      this.document.querySelector(`input[data-testid="file"]`).value = null
    }
  };
  
  handleSubmit = e => {
    e.preventDefault()
    
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    this.createBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  createBill = (bill) => {
    if (this.firestore) {
      this.firestore
        .bills()
        .add(bill)
        .then(() => {
          this.onNavigate(ROUTES_PATH['Bills'])
        })
        .catch(error => error)
    }
  }
}