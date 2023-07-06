/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then form is properly displayed on the NewBill page", async () => {
      window.localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      window.location.assign(ROUTES_PATH.NewBill);
      router();
      ``;

      const formNewBill = await waitFor(() =>
        screen.getByTestId("form-new-bill")
      );

      expect(formNewBill).toBeTruthy();
    });

    test("Then should handle file upload ", async () => {
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const html = NewBillUI();
      document.body.innerHTML = html;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      class NewFile {
        async update({ data, headers = {} }) {
          return await "";
        }
        async create({ data, headers = {} }) {
          return await "";
        }
      }
      const fakeStore = { bills: () => new NewFile() };
      const currenNewBill = new NewBill({
        document,
        onNavigate,
        store: fakeStore,
        localStorage: localStorage,
      });
      const mockFile = new File(["mockfile"], "path\\mockfile.png", {
        type: "image/png",
      });

      const handleChangeFile = jest.fn((e) =>
        currenNewBill.handleChangeFile(e)
      );

      const selectedFile = screen.getByTestId("file");
      selectedFile.addEventListener("change", handleChangeFile);
      userEvent.upload(selectedFile, mockFile);

      expect(selectedFile.files[0]).toStrictEqual(mockFile);
      expect(selectedFile.files.item(0)).toStrictEqual(mockFile);
      expect(selectedFile.files).toHaveLength(1);
    });
  });
  describe("When I do fill out the fields in correct format and I click on the send button", () => {
    test("Then it should sent the proper form", () => {
      document.body.innerHTML = NewBillUI();
      const inputData = {
        amount: "299",
        commentAdmin: null,
        commentary: "commentaries are good",
        date: "2023-06-09",
        email: "employee@test.tld",
        fileName: "manadlorienWallpaper.jpg",
        fileUrl:
          "http://localhost:5678/public/6366f4c9ea9f0c06676b73b664199bcb",
        id: "x1JLJyaAByvMMFFeEMvy4h",
        name: "Peter Buschel",
        pct: 2,
        status: "pending",
        type: "Transports",
        vat: "3",
      };

      const inputExpenseName = screen.getByTestId("expense-name");
      fireEvent.change(inputExpenseName, { target: { value: inputData.name } });

      expect(inputExpenseName.value).toBe(inputData.name);

      const inputAmount = screen.getByTestId("amount");
      fireEvent.change(inputAmount, {
        target: {
          value: inputData.amount,
        },
      });
      expect(inputAmount.value).toBe(inputData.amount);

      const form = screen.getByTestId("form-new-bill");

      const localStorageMock = {
        getItem: jest.fn(() => JSON.stringify({ email: inputData.email })),

        setItem: jest.fn(),
      };
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
        writable: true,
      });

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const handleSubmit = jest.fn(newBill.handleSubmit);

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
      expect(JSON.parse(localStorageMock.getItem("user")).email).toBe(
        inputData.email
      );
      expect(JSON.parse(localStorageMock.getItem("user")).amount).toBe(
        inputData.inputAmount
      );
    });
  });
});
