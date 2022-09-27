/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store.js";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
import { convertToDate } from "../app/format.js";
import Bills from "../containers/Bills.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    //Ensuite, l'icône de facture en disposition verticale doit être mise en évidence.
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon).toBeTruthy();
    });
    //Les factures doivent ensuite être classées du plus ancien au plus récent.
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => {
        // transform dates
        const date1 = convertToDate(a);
        const date2 = convertToDate(b);
        // return d1 <= d2 ? 1 : -1
        if (date1 <= date2) return 1;
        if (date1 > date2) return -1;
      };
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });

  describe("when I am on Bills page with loading", () => {
    //lorsque je suis sur la page de Bills avec le chargement
    test("then Loading page should be rendered", () => {
      const html = BillsUI({ loading: true });
      document.body.innerHTML = html;

      expect(screen.getAllByText("Loading...")).toBeTruthy();
    });
  });
  describe("And I click on the eye icon", () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    //Une modale devrait s'ouvrir
    test("A modal should open", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const sampleBills = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });
      sampleBills.handleClickIconEye = jest.fn();
      screen.getAllByTestId("icon-eye")[0].click();
      expect(sampleBills.handleClickIconEye).toBeCalled();
    });
    //La modale devrait alors afficher l'image ci-jointe
    test("Then the modal should display the attached image", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const sampleBills = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });
      const iconEye = document.querySelector(`div[data-testid="icon-eye"]`);
      $.fn.modal = jest.fn();
      sampleBills.handleClickIconEye(iconEye);
      expect(document.querySelector(".modal")).toBeTruthy();
    });
  });
  describe("when I am on Bills page and there are no bills", () => {
    //vérifier la liste des factures devrait être vide
    test("then the bills list should be empty", () => {
      const html = BillsUI({ data: [] });
      document.body.innerHTML = html;

      const eyeIcon = screen.queryByTestId("icon-eye");

      expect(eyeIcon).toBeNull();
    });
  });
});

// INTEGRATION TESTS GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills page", () => {
    //récupère les factures à partir de l'API GET fictive
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() =>
        expect(screen.getByText("Mes notes de frais")).toBeTruthy()
      );
    });
    // Vérifie lorsqu'une erreur se produit sur l'API
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });
      //récupère des factures à partir d'une API et échoue avec un message d'erreur 404
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await waitFor(() => new Promise(process.nextTick));
        const message = await waitFor(() => screen.getByText(/Erreur 404/));
        expect(message).toBeTruthy();
      });
      //récupère les messages à partir d'une API et échoue avec une erreur de message 500
      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await waitFor(() => new Promise(process.nextTick));
        const message = await waitFor(() => screen.getByText(/Erreur 500/));
        expect(message).toBeTruthy();
      });
    });
  });
});

describe("When I click on Nouvelle note de frais", () => {
  // Vérifie l'apparation du formulaire de création de bills 
  test("Then the form to create a new bill appear", async () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    Object.defineProperty(window, "localStorage", { value: localStorageMock })
    window.localStorage.setItem("user", JSON.stringify({
      type: "Employee"
    }))
    const initNewbill = new Bills({
      document, onNavigate, store: null, localStorage: window.localStorage
    })
    document.body.innerHTML = BillsUI({ bills })
    const handleClickNewBill = jest.fn(initNewbill.handleClickNewBill)
    const btnNewBill = screen.getByTestId("btn-new-bill")
    btnNewBill.addEventListener('click', handleClickNewBill)
    userEvent.click(btnNewBill)
    expect(handleClickNewBill).toHaveBeenCalled()
    expect(screen.getByTestId("form-new-bill")).toBeTruthy()
  })
})