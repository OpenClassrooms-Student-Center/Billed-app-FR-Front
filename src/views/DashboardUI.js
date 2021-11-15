import VerticalLayout from './VerticalLayout.js'
import ErrorPage from "./ErrorPage.js"
import LoadingPage from "./LoadingPage.js"
import BigBilledIcon from '../assets/svg/big_billed.js'
import { filteredBills } from '../containers/Dashboard.js'
import ArrowIcon from '../assets/svg/arrow.js'

export default ({ data, loading, error }) => {

  if (loading) {
    return LoadingPage()
  } else if (error) {
    return ErrorPage(error)
  }

  return (`
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='dashboard-content'>
        <div class='bills-feed'>
          <div class='status-bills-header'>
            <h3> En attente (${filteredBills(data && data.bills, "pending").length}) </h3>
            <span class='arrow-icon' id='arrow-icon1' data-testid='arrow-icon1'>${ArrowIcon}</span>
          </div>
          <div class='status-bills-container' id='status-bills-container1'>
          </div>
          
            <div class='status-bills-header' style='margin-top: 20px;'>
              <h3> Validé (${filteredBills(data && data.bills, "accepted").length}) </h3>
              <span class='arrow-icon' id='arrow-icon2' data-testid='arrow-icon2'>${ArrowIcon}</span>
            </div>
            <div class='status-bills-container' id='status-bills-container2'>
            </div>

            <div class='status-bills-header' style='margin-top: 20px;'>
              <h3> Refusé (${filteredBills(data && data.bills, "refused").length}) </h3>
              <span class='arrow-icon' id='arrow-icon3' data-testid='arrow-icon3'>${ArrowIcon}</span>
            </div>
            <div class='status-bills-container' id='status-bills-container3'>
            </div>

        </div>
        <div class="dashboard-right-container">
          <h3> Validations </h3>
          <div><div id="big-billed-icon" data-testid="big-billed-icon"> ${BigBilledIcon} </div></div>
      </div>
    </div>`
  )
}