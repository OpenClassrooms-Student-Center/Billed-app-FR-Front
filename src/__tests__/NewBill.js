/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { screen,fireEvent, getByTestId} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock } from '../__mocks__/localStorage.js'
import { ROUTES ,ROUTES_PATH} from '../constants/routes.js'
import Router from "../app/Router.js"

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