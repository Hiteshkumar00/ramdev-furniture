let hidden_delete = document.getElementById("hidden-delete");
let hide_dissmiss = document.getElementById("hide-dismiss");

document.addEventListener("click", () => {
  if (event.target.closest(".delete-conform")) {
    let link = event.target.value;
    hidden_delete.action = link;
    hidden_delete.hidden = false;
  }
});

hide_dissmiss.addEventListener("click", () => {
  hidden_delete.hidden = true;
});