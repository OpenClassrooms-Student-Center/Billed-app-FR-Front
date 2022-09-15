/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store.js"


// Setup
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
window.localStorage.setItem('user', JSON.stringify({
  type: 'Employee'
}))
const onNavigate = jest.fn()
window.alert = jest.fn()

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the NewBill Page should be rendered", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      const title = screen.getAllByText('Envoyer une note de frais')
      const btnSend = screen.getAllByText('Envoyer')
      const form = document.querySelector('form')
      expect(title).toBeTruthy()
      expect(btnSend).toBeTruthy()
      expect(form.length).toEqual(9)
    })

    describe("When I upload an image file", () => {
      test("Then the file handler should display a file", () => {
        document.body.innerHTML = NewBillUI()
        const newBillClass = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
        const btnFile = screen.getByTestId('file')
        const handleChangeFile = jest.fn(newBillClass.handleChangeFile)
        btnFile.addEventListener('change', handleChangeFile)
        fireEvent.change(btnFile, {
          target: {
            files: [new File(['content'], 'yourReceipt.png', {type: 'image/png'})],
          }
        })
       
        const fileNumber = btnFile.files.length
  
        expect(handleChangeFile).toHaveBeenCalled()
        expect(fileNumber).toEqual(1)
        expect(btnFile.files[0].name).toBe('yourReceipt.png')
        expect(window.alert).not.toBeCalled()
        expect(btnFile.value).not.toBeNull()
      })
    })

    describe("When I upload a wrong type file - non-image file", () => {
      test("Then the window alert should be displayed", () => {
        document.body.innerHTML = NewBillUI()
        const newBillClass = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
        const btnFile = screen.getByTestId('file')
        const handleChangeFile = jest.fn(newBillClass.handleChangeFile)
        btnFile.addEventListener('change', handleChangeFile)
        fireEvent.change(btnFile, {
          target: {
            files: [new File(['content'], 'sample.pdf', {type: 'application/pdf'})],
          }
        })
  
        expect(handleChangeFile).toHaveBeenCalled()
        expect(btnFile.files[0].name).toBe('sample.pdf')
        expect(window.alert).toBeCalled()
        expect(btnFile.value).toBe('')
      })
    })


  })
})
