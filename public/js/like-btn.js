var btn1 = document.querySelector('#green');
var btn2 = document.querySelector('#red');

btn1.addEventListener('click', function() {
  
    if (btn2.classList.contains('like-red')) {
      btn2.classList.remove('like-red');
    } 
  this.classList.toggle('like-green');
  
});

btn2.addEventListener('click', function() {
  
    if (btn1.classList.contains('like-green')) {
      btn1.classList.remove('like-green');
    } 
  this.classList.toggle('like-red');
  
});