// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('form')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }else{
        const loader = document.getElementById('loader');
        loader.style.display = 'block';
      }

      form.classList.add('was-validated')
    }, false)
  })
})();


let conDiv = document.getElementById('key-value-div');

conDiv.addEventListener("click", function(event){
  if(event.target.nodeName == "BUTTON"){
    let listItem = event.target.parentElement;
    listItem.remove();
  };
});


let add = document.getElementById("add-key-value");

add.addEventListener("click", addKeyValue);

function addKeyValue(){
  let copy = document.getElementById('copy');
  newdiv = copy.cloneNode("deep");
  newdiv.hidden = false;
  newdiv.id = "key-value";
  conDiv.appendChild(newdiv);
};











