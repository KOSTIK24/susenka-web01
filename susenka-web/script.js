function toggleTheme(){
  document.body.classList.toggle('light');
  // store preference
  try {
    const mode = document.body.classList.contains('light') ? 'light' : 'dark';
    localStorage.setItem('susenka-theme', mode);
  } catch(e){}
}
// load preference
(function(){
  try{
    const saved = localStorage.getItem('susenka-theme');
    if(saved === 'light'){ document.body.classList.add('light'); }
  }catch(e){}
})();
