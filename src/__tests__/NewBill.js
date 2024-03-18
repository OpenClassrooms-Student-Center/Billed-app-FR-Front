/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import NewBillUI from '../views/NewBillUI.js'
import NewBill from '../containers/NewBill.js'
import mockStore from "../__mocks__/store"
import { ROUTES_PATH } from "../constants/routes.js"
import router from "../app/Router.js"
import { screen, waitFor, fireEvent } from "@testing-library/dom"
import { localStorageMock } from "../__mocks__/localStorage.js"
// Importation du mock dans jest
jest.mock("../app/store", () => mockStore) //? Don't know if it's used or not

describe("Given I am connected as an employee", () => {
  
  describe("When I am on NewBill Page", () => {
    test("Then the correct vertical layout's icon should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')
      expect(windowIcon).toBeTruthy()
      expect(windowIcon).toHaveClass("active-icon")      
    })
  })

  describe("When I change file", () => {
    test("Then the file should be accpeted if the extension is correct", async () => {
      document.body.innerHTML = NewBillUI()

      const onNavigate = jest.fn()
      const newBill = new NewBill({
        document, onNavigate, store: mockStore, localStorage: localStorageMock
      })
      const file = screen.getByTestId('file')
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      file.addEventListener('change', handleChangeFile)
      userEvent.upload(file, 'bill-test.png')
      expect(handleChangeFile).toHaveBeenCalled()
      expect(screen.getByTestId('file')).toBeTruthy()
    })
    test("Then the file should not be displayed if the extension is incorrect", async () => {
      jest.clearAllMocks()
      document.body.innerHTML = NewBillUI()
      const onNavigate = jest.fn()
      const newBill = new NewBill({
        document, onNavigate, store: mockStore, localStorage: localStorageMock
      })
      jest.spyOn(window, 'alert').mockImplementation(() => {})
      const file = screen.getByTestId('file')
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      file.addEventListener('change', handleChangeFile)
      userEvent.upload(file, 'bill-test.gif')
      expect(handleChangeFile).toHaveBeenCalled()
      expect(screen.getByTestId('file')).toBeTruthy()
      expect(screen.queryByTestId('file').value).toBe("")
      expect(window.alert.mock.calls.length).toBeGreaterThanOrEqual(1)
    })
  })
  describe("When I click on submit button", () => {
    test("Then the form should be submitted", async () => {
      document.body.innerHTML = NewBillUI()
      const onNavigate = jest.fn()
      const newBill = new NewBill({
        document, onNavigate, store: mockStore, localStorage: localStorageMock
      })
      const form = screen.getByTestId('form-new-bill')
      const handleSubmit = jest.fn(newBill.handleSubmit)
      form.addEventListener('submit', handleSubmit)
      fireEvent.submit(form)
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
})