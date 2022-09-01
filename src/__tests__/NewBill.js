import { screen, fireEvent } from "@testing-library/dom"
import { localStorageMock } from "../__mocks__/localStorage.js"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI.js"
import firebase from "../__mocks__/firebase"
import { ROUTES } from "../constants/routes"

window.alert = jest.fn();

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then it should render a New Bill form", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBillForm = screen.getByTestId('form-new-bill')
      expect(newBillForm).toBeTruthy()
    })

    test("Then it should render 8 entries", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      
      const expenseTypeInput = screen.getByTestId('expense-type')
      expect(expenseTypeInput).toBeTruthy()

      const expenseNameInput = screen.getByTestId('expense-name')
      expect(expenseNameInput).toBeTruthy()

      const datePicker = screen.getByTestId('datepicker')
      expect(datePicker).toBeTruthy()

      const amountInput = screen.getByTestId('amount')
      expect(amountInput).toBeTruthy()

      const vatInput = screen.getByTestId('vat');
      expect(vatInput).toBeTruthy()

      const pctInput = screen.getByTestId('pct');
      expect(pctInput).toBeTruthy()

      const commentary = screen.getByTestId('commentary');
      expect(commentary).toBeTruthy()

      const fileInput = screen.getByTestId('file');
      expect(fileInput).toBeTruthy()
    })

    describe("When I add an image file as bill proof", () => {
      test("Then this new file should have been changed in the input", () => {
        Object.defineProperty(window, 'localStorage', { 
          value: localStorageMock 
        })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const html = NewBillUI()
        document.body.innerHTML = html
  
        const newBills = new NewBill({
          document, 
          onNavigate, 
          firestore: null,  
          localStorage: window.localStorage
        })
  
        const handleChangeFile = jest.fn((e) => newBills.handleChangeFile)
        const fileInput = screen.getByTestId('file')

        fileInput.addEventListener("change", handleChangeFile)
        fireEvent.change(fileInput, { 
          target: { 
            files: [new File(['bill.png'], 'bill.png', {type: 'image/png'})]
          } 
        })
  
        expect(handleChangeFile).toHaveBeenCalled()
        expect(fileInput.files[0].name).toBe('bill.png')
      })
    })

    describe("When I add an non-image file as bill proof", () => {
      test("Then throw an alert", () => {
        Object.defineProperty(window, 'localStorage', { 
          value: localStorageMock 
        })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const html = NewBillUI()
        document.body.innerHTML = html
  
        const newBills = new NewBill({
          document, 
          onNavigate, 
          firestore: null,  
          localStorage: window.localStorage
        })

        const handleChangeFile = jest.fn((e) => newBills.handleChangeFile)
        const fileInput = screen.getByTestId('file')
  
        fileInput.addEventListener("change", handleChangeFile)
        fireEvent.change(fileInput, { 
          target: { 
            files: [new File(['video.mp4'], 'video.mp4', {type: 'video/mp4'})]
          } 
        })
  
        expect(handleChangeFile).toHaveBeenCalled()
        expect(window.alert).toHaveBeenCalled()
      })
    })

    describe("When I Submit form", () => {
      test("Then, I should be sent on Bills page", () => {
        Object.defineProperty(window, 'localStorage', { 
          value: localStorageMock 
        })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const html = NewBillUI()
        document.body.innerHTML = html

        const newBills = new NewBill({
          document, 
          onNavigate, 
          firestore: null, 
          localStorage: window.localStorage
        })

        const handleSubmit = jest.fn((e) => newBills.handleSubmit)
        const newBillForm = screen.getByTestId('form-new-bill')
        newBillForm.addEventListener("submit", handleSubmit)

        fireEvent.submit(newBillForm)

        expect(handleSubmit).toHaveBeenCalled()
        expect(screen.getAllByText('Mes notes de frais')).toBeTruthy()
      })
    })
  })
})

// test d'intégration POST
describe("Given I am a user connected as employee", () => {
  describe("When I send a new Bill", () => {
    test("fetches bills from mock API POST", async () => {
      const getSpy = jest.spyOn(firebase, "post")

      const newBill = {
      "id": "33qAXb5fIm2zOKkLzPrt",
      "vat": "70",
      "fileUrl": "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
      "status": "pending",
      "type": "Hôtel et logement",
      "commentary": "séminaire billed",
      "name": "encore",
      "fileName": "preview-facture-free-201801-pdf-1.jpg",
      "date": "2004-04-04",
      "amount": 400,
      "commentAdmin": "ok",
      "email": "a@a",
      "pct": 20
      }

      const bills = await firebase.post(newBill)
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toBe(5)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})