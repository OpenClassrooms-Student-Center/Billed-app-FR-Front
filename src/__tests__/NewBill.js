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
    test("Then the file should be accepted if the extension is correct and the backend should receive the file and email", async () => {
     // Generate Dom for NewBill
     document.body.innerHTML = NewBillUI()
     //Create a new file
     const mockFile = new File([''], 'file.test.jpg', { type: 'image/jpeg' })
     // Create an email constant and a new formData object
     Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', {
        type: 'Employee',
        email: 'test@example2.com',
      })
     const email = JSON.parse(window.localStorage.getItem("user")).email
     const formData = new FormData()
     formData.append('file', mockFile)
     formData.append('email', email)


     const onNavigate = jest.fn()
     const newBill = new NewBill({
       document, onNavigate, store: mockStore, localStorage: localStorageMock
     })
     const handleChangeFile = jest.fn(newBill.handleChangeFile)
     const file = screen.getByTestId('file')
     file.addEventListener('change', (e) => handleChangeFile(e))
     userEvent.upload(file, mockFile)

     expect(handleChangeFile).toHaveBeenCalled()
     
     expect(formData.get('file')).toEqual(mockFile)
     expect(formData.get('email')).toEqual(email)

    })
  })
  describe("When I click on submit button", () => {
    test("Then the form should be submitted", async () => {
      document.body.innerHTML = NewBillUI()
      const onNavigate = jest.fn()
      const newBill = new NewBill({
        document, onNavigate, store: mockStore, localStorage: localStorageMock
      })
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', {
        type: 'Employee',
        email: 'test@example2.com'
      })  
      const email = JSON.parse(window.localStorage.getItem("user")).email
      const expectedPromiseResult = {
        fileUrl: 'https://localhost:3456/images/test.jpg',
        key: '1234'
      }
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
      // Select form fiels
      const typeSelect = screen.getByTestId('expense-type')
      const nameInput = screen.getByTestId('expense-name')
      const amountInput = screen.getByTestId('amount')
      const dateInput = screen.getByTestId('datepicker')
      const vatInput = screen.getByTestId('vat')
      const pctInput = screen.getByTestId('pct')
      const commentaryInput = screen.getByTestId('commentary')

      // Hydrate form fields
      typeSelect.value = 'Transports'
      fireEvent.change(typeSelect)
      nameInput.value = 'test'
      fireEvent.change(nameInput)
      amountInput.value = '100'
      fireEvent.change(amountInput)
      dateInput.value = '2022-01-01'
      fireEvent.change(dateInput)
      vatInput.value = '100'
      fireEvent.change(vatInput)
      pctInput.value = '20'
      fireEvent.change(pctInput)
      commentaryInput.value = 'test'
      fireEvent.change(commentaryInput)
      const file = screen.getByTestId('file')
      file.addEventListener('change', (e) => newBill.handleChangeFile(e))
      userEvent.upload(file, mockFile)
      // Create bill object
      const filePath = expectedPromiseResult.fileUrl.split(/\//g)
      const fileName = filePath[filePath.length-1]
      const bill = {
        email,
        type: typeSelect.value,
        name:  nameInput.value,
        amount: amountInput.value,
        date: dateInput.value,
        vat: vatInput.value,
        pct: pctInput.value,
        commentary: commentaryInput.value,
        fileUrl: expectedPromiseResult.fileUrl,
        fileName: fileName,
        status: 'pending'
      }
      console.log(bill.fileUrl)
      console.log(bill.fileName)
      console.log(window.localStorage.getItem('file'))
      window.localStorage.setItem('file', {
        fileUrl: bill.fileUrl,
        fileName: bill.fileName
      })  
      const promiseNewBill = await waitFor(() => newBill.store.bills().create(bill))
      console.log(promiseNewBill)
      expect(promiseNewBill).toEqual(expectedPromiseResult)
      
      //const formData = new FormData()
      //formData.append('file', mockFile)
      //formData.append('email', email)
      

      const form = screen.getByTestId('form-new-bill')
      const handleSubmit = jest.fn(() => newBill.updateBill(bill))
      form.addEventListener('submit', handleSubmit)
      fireEvent.submit(form)
      expect(handleSubmit).toHaveBeenCalled()
      console.log(handleSubmit)
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Bills)

    })
  })
})