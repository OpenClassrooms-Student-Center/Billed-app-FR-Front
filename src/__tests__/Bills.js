/**
 * @jest-environment jsdom
 */
import'@testing-library/jest-dom'
import { screen,fireEvent } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import {ROUTES_PATH,ROUTES} from "../constants/routes.js"
import store from "../__mocks__/store.js"
import { localStorageMock} from '../__mocks__/localStorage.js'
import Router from '../app/Router.js'

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
     
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))// défini l'ser en tant qu'employé dans le local storage
      Object.defineProperty(window, "location", { value: { hash: ROUTES_PATH['Bills'] } });// défini l'url comme étant '#employee/bills'
      document.body.innerHTML = `<div id="root"></div>` // crée le noeud pour que le router injecte l'objet correspondant à l'url
      Router();// lance le router
      expect(screen.getByTestId('icon-window').classList.contains('active-icon')).toBe(true) // vérifie si l'icone est en surbrillance
    })

    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})
describe('Given i am on the loading page',()=>{
  test('Should show Loading...',()=>{
    const html = BillsUI({loading : true})
    document.body.innerHTML = html
    expect(screen.getAllByText('Loading...')).toBeTruthy()

  })
})
// ligne 49 billsUI
describe('Given i am on error page', () => {
  test('should show the error message',()=>{
    const html = BillsUI({error : 'error message'})
    document.body.innerHTML = html
    expect(screen.getAllByText('error message')).toBeTruthy()
  })
})

//Bill tests

describe('Given i am on bills page',()=>{
  //methode handleClickNewBill
    test('Should called the handleClickNewBill method when i click on newBill button',()=>{  
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      let pathname =  ROUTES_PATH['Bills']
      const onNavigate = ((pathname) => document.body.innerHTML = ROUTES({ pathname }))
      const bill= new Bills({
        document,
        onNavigate       
      })    
      const handleClickNewBill = jest.fn(bill.handleClickNewBill)
      const buttonNewBill = screen.getByTestId('btn-new-bill')
      expect(buttonNewBill).toBeTruthy()
      buttonNewBill.addEventListener('click', handleClickNewBill)
      fireEvent.click(buttonNewBill)
      expect(handleClickNewBill).toHaveBeenCalled()
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
    })

    })
    //methode handleClickIconEye
    test('Should called the handleClickIconEye when i click on iconEye',()=>{    
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const bill= new Bills({
        document,
        onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname })
      })  
      const AllIconEye = screen.getAllByTestId('icon-eye')
      const iconEye1 = AllIconEye[0]
      const handleClickIconEye = jest.fn(bill.handleClickIconEye(iconEye1))
      iconEye1.addEventListener('click', handleClickIconEye)
      expect(iconEye1).toBeDefined()        
      fireEvent.click(iconEye1)
      expect(handleClickIconEye).toHaveBeenCalled()
      const modale = document.getElementById('modaleFile')
      expect(modale).toBeTruthy()
      expect(modale).toHaveTextContent('Justificatif')


  
})

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to BillUI", () => {
    test("fetches bills from mock API GET", async () => {
       const getSpy = jest.spyOn(store, "get") // fonction simulée qui surveille l'appel de la méthode get de l'objet store mocké
       const bills = await store.get() //récupère les données du store mocké
       expect(getSpy).toHaveBeenCalledTimes(1) //sore.get a été appelé 1 fois
       expect(bills.data.length).toBe(4) // les données contiennent 4 objets
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      store.get.mockImplementationOnce(() => // simule un rejet de la promesse
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      store.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})
