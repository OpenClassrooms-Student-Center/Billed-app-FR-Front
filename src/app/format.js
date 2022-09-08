import { MONTHS_FR } from "../constants/bills.js"

export const formatDate = (dateStr) => {
  if(dateStr !=  null){
    // Ensure that the date coming from the database is valid
    const [y, m, d] = dateStr.split("-");
    if(y.length != 4 || m.length != 2 || d.length != 2 ){
      return "date invalide!"
  }
  const date = new Date(dateStr)
  const ye = new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(date)
  const mo = new Intl.DateTimeFormat('fr', { month: 'short' }).format(date)
  const da = new Intl.DateTimeFormat('fr', { day: '2-digit' }).format(date)
  const month = mo.charAt(0).toUpperCase() + mo.slice(1)
  return `${parseInt(da)} ${month.substring(0,3)}. ${ye.toString().substring(2,4)}`
}
throw new Error("date null")
}
 
export const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente"
    case "accepted":
      return "Accepté"
    case "refused":
      return "Refused"
  }
}
export const convertToDate = (formatedDate) => {
 
  let [day, month, year] = formatedDate.split(" ");

  year = parseInt(year);
  month = MONTHS_FR[month];
  day = parseInt(day);

  return new Date(year, month, day);
};