let hidden_zoom = document.querySelector(".hidden-zoom");
let hidden_zoom_img = document.querySelector(".hidden-zoom-img");
let hide_zomm = document.querySelector(".hide-zoom");


function zoomIn () {
  if (event.target.closest(".zoom")) {
    let imgSrc = event.target.src;
    hidden_zoom_img.src = imgSrc;
    hidden_zoom.hidden = false;
  }
}

function zoomOut () {
  hidden_zoom.hidden = true;
  hidden_zoom_img.src = "";
}

document.addEventListener("mousedown", zoomIn);
hide_zomm.addEventListener("mouseup", zoomOut);
hide_zomm.addEventListener("mouseleave", zoomOut);

document.addEventListener("touchstart", zoomIn);  
hide_zomm.addEventListener("touchend", zoomOut);
hide_zomm.addEventListener("touchcancel", zoomOut);