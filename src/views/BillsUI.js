import VerticalLayout from './VerticalLayout.js'
import ErrorPage from "./ErrorPage.js"
import LoadingPage from "./LoadingPage.js"

import Actions from './Actions.js'


// ici on gere l'affichage d'une ligne 
const row = (bill) => {
  return (`
    <tr>
      <td>${bill.type}</td>
      <td>${bill.name}</td>
     <td>${bill.date}</td> 
      <td>${bill.amount} €</td>
      <td>${bill.status}</td>
      <td>
        ${Actions(bill.fileUrl)}
      </td>
    </tr>
    `)
}
// fin de l'affichage ligne 


// If data contains something we ask to run the Build Table row function for each Bill 
const rows = (data) => {
  return (data && data.length) ? data.map(bill => row(bill)).join("") : ""
}
// End of this function 

function sortBills(bills) {

  // Fix bills by sorting them accurate by date
  // Format Bill if they are in a inaccurate data format (ex: "19 Déc. 2011" TO "19 Dec 2011")
  // By adding a enDate propriety to the object
  // if data is in a correct Format like DD-MM-YYYY do nothing
  const billsFormat = bills.map((bill) => {

    bill.enDate = bill.date;

    bill.enDate = bill.enDate.replace('.', '')
    bill.enDate = bill.enDate.replace('Déc', 'Dec')
    bill.enDate = bill.enDate.replace('Fév', 'Feb')
    bill.enDate = bill.enDate.replace('Avr', 'Apr')
    bill.enDate = bill.enDate.replace('Mai', 'May')
    bill.enDate = bill.enDate.replace('Aou', 'Aug')

    return bill
  })

  return billsFormat.sort((a, b) => new Date(b.enDate) - new Date(a.enDate))

}



export default ({ data: bills, loading, error }) => {




  const modal = () => (`
    <div class="modal fade" id="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
          </div>
        </div>
      </div>
    </div>
  `)

  if (loading) {
    return LoadingPage()
  } else if (error) {
    return ErrorPage(error)
  }

  return (`
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Mes notes de frais </div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%">
          <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
          </thead>
          <tbody data-testid="tbody">
            ${rows(sortBills(bills))}
          </tbody>
          </table>
        </div>
      </div>
      ${modal()}
    </div>`
  )
}