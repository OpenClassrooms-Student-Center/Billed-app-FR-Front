/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { screen,fireEvent} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then Envoyer une note de frais displayed", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy()
    })

  })
})
console.log('test');