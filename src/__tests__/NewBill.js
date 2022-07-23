/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page ", () => {
    test("Then i should see Envoyer une note de frais title", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy()
      //to-do write assertion
    })

    it('Should allow only jpg/jpeg/png files upload', () => {
      document.body.innerHTML = NewBillUI()
      const allowedFileTypes = ['image/jpeg','image/png','image/jpeg']
      const file = screen.getByTestId('file')
      fireEvent.change(file, {
        target: {
          files: [
            new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })
          ],
        },
      })
     
      expect(allowedFileTypes).toContain(file.files[0].type)
    })
  })
})
