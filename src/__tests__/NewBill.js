/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import mockStore from "../__mocks__/store"
import { ROUTES_PATH } from "../constants/routes.js"
import router from "../app/Router.js"
import { screen, waitFor } from "@testing-library/dom"
import { localStorageMock } from "../__mocks__/localStorage.js"
// Importation du mock dans jest
jest.mock("../app/store", () => mockStore)


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
    test("Then the file should be displayed", async () => {
      jest.clearAllMocks()
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('file'))
      const file = screen.getByTestId('file')
      expect(file).toBeTruthy()
      const handleChangeFile = jest.fn()
    })
  })
})