import eyeBlueIcon from "../assets/svg/eye_blue.js"
import downloadBlueIcon from "../assets/svg/download_blue.js"

export default (billUrl) => {
  return (
    `<div class="icon-actions">
      <div id="eye" data-testid="icon-eye" data-bill-url=${billUrl}>
      ${eyeBlueIcon}
      </div>
    </div>`
  )
}