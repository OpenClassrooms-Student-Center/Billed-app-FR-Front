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
	beforeEach(() => {

		Object.defineProperty(window, 'localStorage', { value: localStorageMock })
		window.localStorage.setItem('user', JSON.stringify({
			type: 'Employee'
		}))

	});


	const Bills = new billsContainer({
		document, onNavigate, mockStore, localStorage: window.localStorage
	})
	console.log(Bills);

	document.body.innerHTML = BillsUI({ error: 'Erreur 404' })


});
