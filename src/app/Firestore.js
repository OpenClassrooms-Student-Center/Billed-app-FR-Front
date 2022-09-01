class Firestore {
  constructor() {
    this.store = window.firebase ? window.firebase.firestore() : () => null
    this.storage = window.firebase ? window.firebase.storage() : () => null
  }

  user = uid => this.store.doc(`users/${uid}`)
  users = () => this.store.collection('users')

  ref = (path) => this.store.doc(path)

  bill = bid => this.store.doc(`bills/${bid}`)
  bills = () => this.store.collection('bills')
}
export default new Firestore()