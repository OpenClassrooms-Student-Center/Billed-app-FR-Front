/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { screen,fireEvent, getByTestId} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI  from '../views/BillsUI.js'
import {localStorageMock } from '../__mocks__/localStorage.js'
import { ROUTES ,ROUTES_PATH} from '../constants/routes.js'
import Router from "../app/Router.js"
import store from "../__mocks__/store.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted",()=>{
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))// défini l'user en tant qu'employé dans le local storage
      Object.defineProperty(window, "location", { value: { hash: ROUTES_PATH['NewBill'] } });// défini l'url comme étant '#employee/bill/new'
      document.body.innerHTML = `<div id="root"></div>` // crée le noeud pour que le router injecte l'objet correspondant à l'url
      Router();// lance le router
      expect(screen.getByTestId('icon-mail').classList.contains('active-icon')).toBe(true) // vérifie si l'icone est en surbrillance
    })
    test("Then Envoyer une note de frais displayed", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy()
    })

    test('Then, I submit form-new-bill, handleSubmit called',()=>{
      const html = NewBillUI()
      document.body.innerHTML = html
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      
      // modifie le localStorage par le  localStorageMock
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
      
      
      const newBill = new NewBill({document, onNavigate})
      expect(newBill).toBeDefined()
      const handleSubmit = jest.fn(newBill.handleSubmit)
      const newBillform = screen.getByTestId("form-new-bill")
      newBillform.addEventListener('submit', handleSubmit)
      fireEvent.submit(newBillform)
      expect(handleSubmit).toHaveBeenCalled()
      
    })

    test('Then, I click on Justificatif, handleChangeFile called',()=> {
      const html = NewBillUI()
      document.body.innerHTML = html  
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      
      // modifie le localStorage par le  localStorageMock
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
      let store = jest.fn()
      let localStorage = window.localStorage
      const newBill = new NewBill({document, onNavigate, store , localStorage})
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      const fileBtn = screen.getByTestId('file')
      expect(fileBtn).toBeDefined()
      fileBtn.addEventListener('click', handleChangeFile)
      fireEvent.click(fileBtn)
      expect(handleChangeFile).toHaveBeenCalled()


    })

  })
})
describe("When I select a file", () => {
  test("Then it should be changed in the input", () => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })// Set localStorage
    window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))// Set user as Employee in localStorage
    const html = NewBillUI()
    document.body.innerHTML = html
    const newBill = new NewBill({
      document,
      onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname }),
      firestore: null,
      localStorage: window.localStorage,
      validFormat : true
    })     

    
    const handleChangeFile = jest.fn(newBill.handleChangeFile)
    const inputFile = screen.getByTestId("file")
    inputFile.addEventListener('change', handleChangeFile)
    fireEvent.change(inputFile, {
      target: {
        files: [new File(["test.jpeg"], "test.jpeg", { type: "image/jpeg" })]
      }
    })
    expect(handleChangeFile).toHaveBeenCalled();
    expect(inputFile.files[0].name).toBe("test.jpeg");
  })
})
// test d'intégration POST
describe("Given I am a user connected as Admin", () => {
  describe("When I navigate to Dashboard", () => {
    test("fetches bills from mock API POST", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html  
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }      
     const testBill = 
      {
        "id": "qcCK3SzECmaZAGRrHjaC",
        "status": "refused",
        "pct": 20,
        "amount": 200,
        "email": "a@a",
        "name": "test2",
        "vat": "40",
        "fileName": "preview-facture-free-201801-pdf-1.jpg",
        "date": "2002-02-02",
        "commentAdmin": "pas la bonne facture",
        "commentary": "test2",
        "type": "Restaurants et bars",
        "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=4df6ed2c-12c8-42a2-b013-346c1346f732"
      }
      // const newBill = new NewBill({document, onNavigate, store , localStorage})
      // expect(newBill).toBeDefined()
      // expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()

      // const handleSubmit = jest.fn(newBill.handleSubmit)
      // const newBillform = screen.getByTestId("form-new-bill")
      // newBillform.addEventListener('submit', handleSubmit)
      // fireEvent.submit(newBillform)
      // expect(handleSubmit).toHaveBeenCalled()
      
      
       const getSpy = jest.spyOn(store, "post") // fonction simulée qui surveille l'appel de la méthode get de l'objet store       
       const bills = await store.post(testBill) 
       expect(getSpy).toHaveBeenCalledTimes(1)
       expect(bills.id).toEqual("qcCK3SzECmaZAGRrHjaC")
      

    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      store.post.mockImplementationOnce(() => // simule un rejet de la promesse
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      store.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})
