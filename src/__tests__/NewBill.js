/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import "@testing-library/jest-dom"
import router from "../app/Router.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import storeMock from '../__mocks__/store.js'





describe("Given I am connected as an employee", () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))

  });

  describe("When I am on NewBill Page", () => {

    test("Then mail-icon should be highlighted", async () => {
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.append(root)

      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon).toHaveClass('active-icon')
    })


    describe("When a file is uploaded in not accepted format (other than jpeg, jpg, png)", () => {

      test("Then no bill should be created", () => {

        document.body.innerHTML = NewBillUI()


        const newBill = new NewBill({ document, onNavigate, store: storeMock, localStorage: window.localStorage })

        const handleChangeFile = jest.spyOn(newBill, 'handleChangeFile')

        const input = screen.getByTestId('file')
        input.addEventListener('change', handleChangeFile)
        fireEvent.change(input, {
          target: {
            files: [new File(['body'], 'notebill.jpg', { type: 'image/jpeg' })],
          }
        })
        expect(handleChangeFile).toBeCalled()
        expect(input.files[0].name).toBe('notebill.jpg')


      })

    })

    describe("When user submits form correctly", () => {

      test("Then a bill is created", () => {

        document.body.innerHTML = NewBillUI()

        const newBill = new NewBill({ document, onNavigate, store: storeMock, localStorage: window.localStorage })

        const updateBill = jest.spyOn(newBill, 'updateBill')

        const form = screen.getByTestId('form-new-bill')
        fireEvent.submit(form)

        expect(updateBill).toHaveBeenCalledTimes(1)

      })

    })

    describe("When i submit a bill form", () => {
      test("Then handleSubmit function should be called", () => {

        document.body.innerHTML = NewBillUI()
        const newBill = new NewBill({ document, onNavigate, store: storeMock, localStorage: window.localStorage })

        const formNewBill = screen.getByTestId('form-new-bill')
        const handleSubmit = jest.spyOn(newBill, 'handleSubmit')

        formNewBill.addEventListener('submit', handleSubmit)

        fireEvent.submit(formNewBill)

        expect(handleSubmit).toHaveBeenCalled()

      })
    })

    // Test d'intégration POST
    describe('When a valid bill is submitted', () => {

      test('Then a new bill is generated', async () => {

        const storeSpy = jest.spyOn(storeMock, "bills")

        const newBill = {
          "id": "X2w33aqa96e6s2v2696z6f2",
          "vat": "80",
          "fileUrl": "https://www.parisinfo.com/var/otcp/sites/images/media/1.-photos/03.-hebergement-630-x-405/hotel-enseigne-neon-630x405-c-thinkstock/31513-1-fre-FR/Hotel-enseigne-neon-630x405-C-Thinkstock.jpg",
          "status": "pending",
          "type": "Hôtel et logement",
          "commentary": "Hotel Paris Info",
          "name": "encore",
          "fileName": "preview-parisinfo-free-201801-pdf-1.jpg",
          "date": "2023-04-04",
          "amount": 800,
          "commentAdmin": "ok",
          "email": "montest@gmail.com",
          "pct": 20
        }

        await storeMock.bills().create(newBill)

        expect(storeSpy).toHaveBeenCalledTimes(1)

      })
    })



  })
})