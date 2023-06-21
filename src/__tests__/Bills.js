/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import store from "../__mocks__/store";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      window.location.hash = ROUTES_PATH["Bills"];
      const root = "<div id='root'></div>";
      document.body.innerHTML = root;
      router();

      const isBillIconActive = screen
        .getByTestId("icon-window")
        .classList.contains("active-icon");
      expect(isBillIconActive).toBe(true);
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        if (dateA < dateB) {
          return -1;
        } else if (dateA > dateB) {
          return 1;
        } else {
          return 0;
        }
      };
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    test("Then buttonNewBill should exist", () => {
      const buttonNewBill = screen.getByTestId("btn-new-bill");

      expect(buttonNewBill).toBeTruthy();
    });

    test("Then bills icon button should dispay modal", () => {
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      const currentBills = new Bills({
        document,
        onNavigate,
        store: store,
        localStorage: window.localStorage,
      });

      $.fn.modal = jest.fn();
      const spyModal = jest.spyOn($.fn, "modal");

      const eyeIcons = screen.getAllByTestId("icon-eye");
      eyeIcons.map((eyeIcon) => {
        userEvent.click(eyeIcon);
      });

      expect(spyModal).toHaveBeenCalledTimes(4);
    });

    test("Then adding a new bill should load newbill page", () => {
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const currentBills = new Bills({
        document,
        onNavigate,
        store: store,
        localStorage: window.localStorage,
      });

      const handleClickNewBill = jest.fn((e) =>
        currentBills.handleClickNewBill(e)
      );
      const newBills = screen.getByTestId("btn-new-bill");
      newBills.addEventListener("click", handleClickNewBill);
      userEvent.click(newBills);

      const formNewBill = screen.getByTestId("form-new-bill");

      expect(formNewBill).toBeTruthy();
    });
  });
});

describe("Given I am connected as an employee", () => {
  describe("When I navigate to Bills page", () => {
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

      await waitFor(() => screen.getByText("Mes notes de frais"));

      const tableHeaderType = await waitFor(() => screen.getByText("Type"));
      expect(tableHeaderType).toBeTruthy();

      const amountType = await waitFor(() => screen.getByText("Montant"));
      expect(amountType).toBeTruthy();

      const transportType = await waitFor(() =>
        screen.getAllByText("Transports")
      );
      expect(transportType).toBeTruthy();
    });
  });

  describe("When an error occurs on API call", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });

    test("fetches bills from API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });
      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });

      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});
