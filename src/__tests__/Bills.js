/**
 * @jest-environment jsdom
 */

 import '@testing-library/jest-dom'
 import {screen, waitFor} from "@testing-library/dom"
 import BillsUI from "../views/BillsUI.js"
 import { bills } from "../fixtures/bills.js"
 import { ROUTES_PATH} from "../constants/routes.js";
 import {localStorageMock} from "../__mocks__/localStorage.js";
 import Bills from "../containers/Bills.js";
 import userEvent from '@testing-library/user-event';
 import mockStore from "../__mocks__/store"
 import router from "../app/Router.js";
 import { formatDate } from '../app/format.js'

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon).toHaveClass('active-icon')

    })

    test("Then bills should be ordered from earliest to latest", () => {
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const sortedDates = bills
        .map(bill => bill.date)
        .sort(antiChrono)
        .map(date => formatDate(date))
      document.body.innerHTML = BillsUI({ data: bills })
      //const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const dates = screen.getAllByText(/^\d{0,2} (Jan.|Fév.|Mar.|Avr.|Mai|Jui.|Jui.|Aoû.|Sep.|Oct.|Nov.|Dec.) \d{2}/).map(a => a.innerHTML)

      expect(dates).toEqual(sortedDates) 
    })

    // Test sur l'icone oeil qui ouvre une modale
    describe("When I click on the eye icon of a bill", () => {
      test("It should open a modal", () => {
        const store = null
        const billsClass = new Bills({ document, onNavigate, store, localStorage: window.localStorage })
        const eyes = screen.getAllByTestId('icon-eye')
        const handleClickIconEye = jest.fn(billsClass.handleClickIconEye(eyes[0]))
        eyes[0].addEventListener('click', handleClickIconEye)
        userEvent.click(eyes[0])
        expect(handleClickIconEye).toHaveBeenCalled()
  
        const modale = document.getElementById('modaleFile')
        expect(modale).toBeTruthy()
        expect(modale).toHaveStyle('display: block')        
      })
    })

    // Test sur le bouton New Bill qui affiche bein la page avec le formulaire
    describe("When I click on the New Bill button", () => {
      test("It should open the New Bill page", () => {
        document.body.innerHTML = BillsUI({ data: bills })
        const onNavigate = jest.fn()
        const store = null
        const billsClass = new Bills({ document, onNavigate, store, localStorage: window.localStorage })
        const btnNewBill = screen.getByTestId('btn-new-bill')
        const handleClickNewBill = jest.fn(billsClass.handleClickNewBill)
        btnNewBill.addEventListener('click', handleClickNewBill)
        userEvent.click(btnNewBill)
        expect(handleClickNewBill).toHaveBeenCalled()
      })
    })

  })
})

//GET integration test
jest.mock("../app/store", () => { return mockStore })

describe("Given I am an user connected as Employee", () => {
  describe("When I am on the Bills Page", () => {
    test("it should fetch bills from mock API GET", async () => {
      // On recréé le dom pour le test
      document.body.innerHTML = ""
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'a@a'}))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      // On appelle le router
      router()
      // On précise sur quelle page on se trouve
      window.onNavigate(ROUTES_PATH.Bills)
      // On créé une promesse au prochain tick de l'API
      await new Promise(process.nextTick)
      // On recupère le tableau et toutes les bills qu'il contient
      const tableBills = screen.getByTestId('tbody')
      const arrayBills = tableBills.children
     
      // On doit avoir 4 bills
      expect(arrayBills.length).toBeGreaterThan(0)
      expect(arrayBills.length).toBe(4)
    })

    // Test des erreurs d'API
    describe("When an error occurs on API", () => {
      // Avant que le test commence
      beforeEach(() => {
        // On créé le dom, ainsi qu'un utilisateur de type Employee et on appelle le router
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'a@a'}))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })

      // erreur 404
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              // Si erreur 404, la promesse est rejetée
              return Promise.reject(new Error("Erreur 404"))
            }
          }})

        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })
  
      // Erreur 500
      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              // Si erreur 500, la promesse est rejetée
              return Promise.reject(new Error("Erreur 500"))
            }
          }})
  
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })

      // Après le test, on vide le dom
      afterEach(() => {
        document.body.innerHTML = ''
      })
    })
  })
}) 
