import { screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import NewBillUI from "../views/NewBillUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import { default as billsContainer } from '../containers/Bills.js';
import router from "../app/Router.js";


test('TEST CODE', async () => {

	Object.defineProperty(window, 'localStorage', { value: localStorageMock })
	window.localStorage.setItem('user', JSON.stringify({
		type: 'Employee'
	}))

	const root = document.createElement("div")
	root.setAttribute("id", "root")
	document.body.append(root)
	router()
	window.onNavigate(ROUTES_PATH.Bills)




});
