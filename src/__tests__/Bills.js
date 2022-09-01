import { screen, fireEvent } from "@testing-library/dom"
import { localStorageMock } from "../__mocks__/localStorage.js"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import Router from "../app/Router"
import Bills from "../containers/Bills.js"
import userEvent from "@testing-library/user-event"
import firebase from "../__mocks__/firebase"
import Firestore from "../app/Firestore"


describe("Given I am connected as an employee", () => {
  describe('When I am on Dashboard page but it is loading', () => {
    test('Then, Loading page should be rendered', () => {
      const html = BillsUI({ loading: true })
      document.body.innerHTML = html
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })

  describe('When I am on Dashboard page but back-end send an error message', () => {
    test('Then, Error page should be rendered', () => {
      const html = BillsUI({ error: 'some error message' })
      document.body.innerHTML = html
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      Firestore.bills = () => ({ bills, get: jest.fn().mockResolvedValue() })

      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      window.localStorage.setItem("user", JSON.stringify({type: "Employee"}));

      const pathname = ROUTES_PATH["Bills"] // return '#employee/bills'
      Object.defineProperty(window, "location", { value: { hash: pathname } })
      
      document.body.innerHTML = `<div id="root"></div>`
      Router()

      expect(screen.getByTestId("icon-window").classList.contains("active-icon")).toBe(true)
    })

    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html

      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)

      const datesSorted = [...dates].sort(antiChrono)

      expect(dates).toEqual(datesSorted)
    })


    describe("When I click on New Bill btn", () => {
      test("It should renders new bill page", () => {
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))

        const html = BillsUI({ data: []})
        document.body.innerHTML = html

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const firestore = null

        const bills = new Bills({
          document, onNavigate, firestore, localStorage: window.localStorage
        })

        const handleClickNewBill = jest.fn(() => bills.handleClickNewBill)
        const newBillBtn = screen.getByTestId('btn-new-bill')

        newBillBtn.addEventListener('click', handleClickNewBill)
        userEvent.click(newBillBtn)

        expect(handleClickNewBill).toHaveBeenCalled()
        expect(screen.queryByText('Envoyer une note de frais')).toBeTruthy()
      })
    })


    describe('When I click on the icon eye from a bill', () => {
      test('A modal should open', () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const html = BillsUI({ data: [bills[1]] })
        document.body.innerHTML = html
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const firestore = null
        const billsClass = new Bills({
          document, onNavigate, firestore, localStorage: window.localStorage
        })

        const modale = document.getElementById("modaleFile")

        $.fn.modal = jest.fn(() => modale.classList.add('show'))
    
        const handleClickIconEye = jest.fn(() => billsClass.handleClickIconEye)
        const iconEye = screen.getByTestId('icon-eye')
    
        iconEye.addEventListener('click', handleClickIconEye)
    
        userEvent.click(iconEye)
        expect(handleClickIconEye).toHaveBeenCalled()
    
        expect(modale.classList).toContain('show')
      })
    })
  })
})


// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
       const getSpy = jest.spyOn(firebase, "get")
       const bills = await firebase.get()
       expect(getSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})