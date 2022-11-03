/**
 * @jest-environment jsdom
 */


import { screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import NewBillUI from "../views/NewBillUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import { default as billsContainer } from '../containers/Bills.js';
import router from "../app/Router.js";


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
      expect(windowIcon).toBeTruthy()
    })

    test("Then , employee click on Icon eye", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      document.body.innerHTML = BillsUI({ data: bills })
      window.onNavigate(ROUTES_PATH.Bills)

      const Bills = new billsContainer({
        document, onNavigate, mockStore, localStorage: window.localStorage
      })

      const iconEye = screen.getAllByTestId('icon-eye')
      const handleClickIconEyes = jest.fn(() => Bills.handleClickIconEye(iconEye[1]))
      // mock  bootstrapp's function .modal
      $.fn.modal = jest.fn();
      iconEye[1].addEventListener('click', handleClickIconEyes)
      userEvent.click(iconEye[1])
      console.log(document.body.innerHTML);
      expect(handleClickIconEyes).toHaveBeenCalled()

      const modal = document.getElementById('modaleFile')
      expect(modal).toBeTruthy()



    })



    test("Then , the button new bill should be visible and available at click", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      document.body.innerHTML = BillsUI({ data: bills })
      window.onNavigate(ROUTES_PATH.Bills)

      const Bills = new billsContainer({
        document, onNavigate, mockStore, localStorage: window.localStorage
      })

      const btnNewBill = screen.getByTestId('btn-new-bill')
      expect(btnNewBill).toBeTruthy()

      const handleClickNewBill = jest.fn(() => Bills.handleClickNewBill(btnNewBill))

      btnNewBill.addEventListener('click', handleClickNewBill)
      document.body.innerHTML = NewBillUI()
      userEvent.click(btnNewBill)


      expect(handleClickNewBill).toHaveBeenCalled()
    })


    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })


  })


})




