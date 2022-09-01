
import { ROUTES_PATH } from '../constants/routes.js'
export let PREVIOUS_LOCATION = ''

// we use a class so as to test its methods in e2e tests
export default class Login {
  constructor({ document, localStorage, onNavigate, PREVIOUS_LOCATION, firestore }) {
    this.document = document
    this.localStorage = localStorage
    this.onNavigate = onNavigate
    this.PREVIOUS_LOCATION = PREVIOUS_LOCATION
    this.firestore = firestore
    const formEmployee = this.document.querySelector(`form[data-testid="form-employee"]`)
    formEmployee.addEventListener("submit", this.handleSubmitEmployee)
    const formAdmin = this.document.querySelector(`form[data-testid="form-admin"]`)
    formAdmin.addEventListener("submit", this.handleSubmitAdmin)
  }

  handleSubmitEmployee = (e) => {
    const user = {
      type: "Employee",
      email: e.target.querySelector(`input[data-testid="employee-email-input"]`).value,
      password: e.target.querySelector(`input[data-testid="employee-password-input"]`).value,
      status: "connected"
    }
    this.localStorage.setItem("user", JSON.stringify(user))
    const userExists = this.checkIfUserExists(user)
    if (!userExists) this.createUser(user)
    e.preventDefault()
    this.onNavigate(ROUTES_PATH['Bills'])
    this.PREVIOUS_LOCATION = ROUTES_PATH['Bills']
    PREVIOUS_LOCATION = this.PREVIOUS_LOCATION
    this.document.body.style.backgroundColor="#fff"
  }

  handleSubmitAdmin = (e) => {
    const user = {
      type: "Admin",
      email: e.target.querySelector(`input[data-testid="admin-email-input"]`).value,
      password: e.target.querySelector(`input[data-testid="admin-password-input"]`).value,
      status: "connected"
    }
    this.localStorage.setItem("user", JSON.stringify(user))
    const userExists = this.checkIfUserExists(user)
    if (!userExists) this.createUser(user)
    e.preventDefault()
    this.onNavigate(ROUTES_PATH['Dashboard'])
    this.PREVIOUS_LOCATION = ROUTES_PATH['Dashboard']
    PREVIOUS_LOCATION = this.PREVIOUS_LOCATION
    document.body.style.backgroundColor="#fff"
  }

  // not need to cover this function by tests
  checkIfUserExists = (user) => {
    if (this.firestore) {
      this.firestore
      .user(user.email)
      .get()
      .then((doc) => {
        if (doc.exists) {
          console.log(`User with ${user.email} exists`)
          return true
        } else {
          return false
        }
      })
      .catch(error => error)
    } else {
      return null
    }
  }

  // not need to cover this function by tests
  createUser = (user) => {
    if (this.firestore) {
      this.firestore
      .users()
      .doc(user.email)
      .set({
        type: user.type,
        name: user.email.split('@')[0] 
      })
      .then(() => console.log(`User with ${user.email} is created`))
      .catch(error => error)
    } else {
      return null
    }
  }
} 