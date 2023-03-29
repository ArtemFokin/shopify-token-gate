export const displayGatedBlocks = ()=>{
  window.myAppGatedBlocks?.forEach(selector => {
    const el = document.querySelector(selector);
    el.style.display = ''
  })
}
export const hideGatedBlocks = ()=>{
  window.myAppGatedBlocks?.forEach(selector => {
    const el = document.querySelector(selector);
    el.style.display = 'none'
  })
}