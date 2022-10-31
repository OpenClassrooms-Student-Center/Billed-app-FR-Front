import { ROUTES_PATH } from "../constants/routes.js";
import { convertToDate, formatDate, formatStatus } from "../app/format.js";
import Logout from "./Logout.js";

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const buttonNewBill = document.querySelector(
      `button[data-testid="btn-new-bill"]`
    );
    if (buttonNewBill)
      buttonNewBill.addEventListener("click", this.handleClickNewBill);
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
    if (iconEye)
      iconEye.forEach((icon) => {
        icon.addEventListener("click", () => this.handleClickIconEye(icon));
      });
    new Logout({ document, localStorage, onNavigate });
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH["NewBill"]);
  };

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url");
    console.log("url: ", billUrl);
    const isBillNull = billUrl.includes("null");
    const imgWidth = Math.floor($("#modaleFile").width() * 0.5);
    // Fix user experience when clicking on eye
    $("#modaleFile")
      .find(".modal-body")
      .html(
        isBillNull
          ? `<div style='text-align: center;' class="bill-proof-container"><p>Image non disponible</p></div>`
          : `<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`
      );
    $("#modaleFile").modal("show");
  };

  getBills = () => {
    if (this.store) {
      return this.store
        .bills()
        .list()
        .then((snapshot) => {
          const bills = snapshot.map((doc) => {
            try {
              return {
                ...doc,
                date: doc?.date ? formatDate(doc?.date) : "non definit",
                status: formatStatus(doc.status),
              };
            } catch (e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              // console.log(e,'for',doc)
              return {
                ...doc,
                date: doc.date,
                status: formatStatus(doc.status),
              };
            }
          });
          // console.log('length', bills.length)
          return bills;
        });
    }
  };
}

/**
 * Sort copy of bills by date
 * @param {Array of Object} bills
 * @returns Array of Object bills
 */
export const sortBillsByDate = (bills) => {
  const billsCopy = [...bills];

  billsCopy.sort((a, b) => {
    const date1 = convertToDate(a.date);
    const date2 = convertToDate(b.date);

    if (date1 <= date2) return 1;
    if (date1 > date2) return -1;
  });

  return billsCopy;
};