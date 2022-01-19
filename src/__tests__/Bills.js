/**
 * @jest-environment jsdom
 */
import'@testing-library/jest-dom'
import { screen,fireEvent } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import {ROUTES_PATH,ROUTES} from "../constants/routes.js"
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: []})
      document.body.innerHTML = html
      //to-do write expect expression
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})
describe('Given i am on the loading page',()=>{
  test('Should show Loading...',()=>{
    const html = BillsUI({loading : true})
    document.body.innerHTML = html
    expect(screen.getAllByText('Loading...')).toBeTruthy()


  })
})
// ligne 49 billsUI
describe('Given i am on error page', () => {
  test('should show the error message',()=>{
    const html = BillsUI({error : 'error message'})
    document.body.innerHTML = html
    expect(screen.getAllByText('error message')).toBeTruthy()
  })
})

//Bill tests

describe('Given i am on bills page',()=>{
  //methode handleClickNewBill
    test('Should called the handleClickNewBill method when i click on newBill button',()=>{  
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      let pathname =  ROUTES_PATH['Bills']
      const onNavigate = ((pathname) => document.body.innerHTML = ROUTES({ pathname }))
      const bill= new Bills({
        document,
        onNavigate       
      })    
      const handleClickNewBill = jest.fn(bill.handleClickNewBill)
      const buttonNewBill = screen.getByTestId('btn-new-bill')
      expect(buttonNewBill).toBeTruthy()
      buttonNewBill.addEventListener('click', handleClickNewBill)
      fireEvent.click(buttonNewBill)
      expect(handleClickNewBill).toHaveBeenCalled()
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
    })

    })
    //methode handleClickIconEye
    test('Should called the handleClickIconEye when i click on iconEye',()=>{    
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const bill= new Bills({
        document,
        onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname })
      })  
      const AllIconEye = screen.getAllByTestId('icon-eye')
      const iconEye1 = AllIconEye[0]
      const handleClickIconEye = jest.fn(bill.handleClickIconEye(iconEye1))
      iconEye1.addEventListener('click', handleClickIconEye)
      expect(iconEye1).toBeDefined()        
      fireEvent.click(iconEye1)
      expect(handleClickIconEye).toHaveBeenCalled()

  
})