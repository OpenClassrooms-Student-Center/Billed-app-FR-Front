/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom/extend-expect"
import {screen, waitFor, within } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import { bills } from "../fixtures/bills.js"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import mockedStore from "../__mocks__/store"

import router from "../app/Router.js";

jest.mock('../app/store', () => mockedStore)

describe("Given I am connected as an employee", () => {
  describe("When I navigate to Bills Page", () => {    
    // TEST : loading page BillsUI  
    test('Then, Loading page should be rendered', () => {
      document.body.innerHTML = BillsUI({ loading: true })
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
    // TEST : error page BillsUI
    test('Then, Error page should be rendered if an error message send from backend', () => {
      document.body.innerHTML = BillsUI({ error: 'some error message' })
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })

  describe("When I am on Bills Page", () => {
    // TEST : bill icon in vertical layout
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
      expect(windowIcon).toHaveClass("active-icon")

    })
    // TEST : bills has been fetch correctly from mocked store"
    test("Then bills has been fetch correctly from mocked store from mocked store", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy()
      const billsTableRows = screen.getByTestId("tbody")
      expect(within(billsTableRows).getAllByRole("row")).toHaveLength(4)
    })

    // TEST : bills should be fetch correctly from mocked store
    test('Then bills should be fetch correctly from mocked store', async () => {
      // mock function
      const mock = jest.spyOn(mockedStore, 'bills')
      // call function
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      expect(mock).toHaveBeenCalled()
    })
    
    // TEST : bills should be ordered from earliest to latest
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    // TEST : if no bill, there is no eyeIcon
    test("Then if there are no bill, there is no eyeIcon", () => {
      document.body.innerHTML = BillsUI({ data: [] })
      const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
      expect(iconEye.length).toBe(0)
    })
    // TEST : if there are at leadt one bill, there is an eyeIcon
    test("Then there are at least one bill, there is an eyeIcon or more according to bills.length", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
      expect(iconEye.length).toBeGreaterThanOrEqual(1)
    })
    //TEST : if I click on eyeIcon, this should open the modal
    test('Then, I click on an eyeIcon, a modal should open', () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const billsArr = new Bills({
        document, onNavigate, firestore: null, localStorage: window.localStorage
      })
      const eyeIcon = screen.getAllByTestId('icon-eye')[0]
      const handleClickIconEye = jest.fn(billsArr.handleClickIconEye)
      const modalMock = document.getElementById("modaleFile")
      $.fn.modal = jest.fn(() => modalMock.classList.add("show"))// on mock la modale
      eyeIcon.addEventListener('click', () => handleClickIconEye(eyeIcon))
      userEvent.click(eyeIcon)
      expect(handleClickIconEye).toHaveBeenCalled()
    })
    // TEST : if I click on New Bill button, I should be redirect on NewBill page
    test('Then, I click on New Bill button, I should be redirect on NewBill page', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      document.body.innerHTML = BillsUI({ data: bills })
      const newBill = new Bills({
        document, onNavigate, firestore: null, localStorage: window.localStorage
      })
      const newBillBtn = document.querySelector(`button[data-testid="btn-new-bill"]`)
      expect(newBillBtn).toBeTruthy()
      const handleClickNewBill = jest.fn(newBill.handleClickNewBill)
      newBillBtn.addEventListener('click', handleClickNewBill)
      userEvent.click(newBillBtn)
      expect(handleClickNewBill).toHaveBeenCalled()
    })
  })
})
