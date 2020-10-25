console.log("shopping app ready")
let img, body, lens, result, cx, cy;
body=document.querySelector("body")
img=document.querySelector("#myimage")
imgContainer=document.querySelector(".img-zoom-container")
//console.log(body)
body.addEventListener("mousemove",function (e){
  // console.log(e.target.id)
  // console.log(e.target.className)
  if(e.target.id==="myimage" || e.target.className==="img-zoom-lens"){
    // pos = getCursorPos(e)
    // console.log(pos)
    
    //console.log(result)
    
    //console.log(lens)
    if(lens===undefined){
      // <div id="myresult" class="img-zoom-result"></div>
      result = document.createElement("DIV")
      result.setAttribute("class", "img-zoom-result");
      /* Create lens: */
      lens = document.createElement("DIV");
      lens.setAttribute("class", "img-zoom-lens");
      /* Insert lens: */
      
      
    }
    
    /* Calculate the ratio between result DIV and lens: */
    cx = result.offsetWidth / lens.offsetWidth;
    cy = result.offsetHeight / lens.offsetHeight;
    /* Set background properties for the result DIV */
    result.style.backgroundImage = "url('" + img.src + "')";
    result.style.backgroundSize = (img.width * cx) + "px " + (img.height * cy) + "px";
    if(lens!==undefined){
    /* Execute a function when someone moves the cursor over the image, or the lens: */
    lens.addEventListener("mousemove", moveLens);
    img.addEventListener("mousemove", moveLens);
    }
  }
  else{
    if(lens!==undefined){
      lens.parentNode.removeChild(lens)
      result.parentNode.removeChild(result)
      lens=undefined
    }
  }
  
})

body.addEventListener("click",(e)=>{
  console.log(e.target.id)
  if(e.target.id==="postal-code-button"){
      e.preventDefault()
      let postalInput=document.querySelector("#postal-code-input").value
      let addressText=document.querySelector("#address")
      let addressInputText=document.querySelector("#address-input")
      let unitNumberForm=document.querySelector("#unit-number-form")
      let postalCodeForm=document.querySelector("#postal-code-form")
      // console.log(addressForm)
      $.ajax({
          url: 'https://developers.onemap.sg/commonapi/search?searchVal='+postalInput+'&returnGeom=N&getAddrDetails=Y&pageNum=1',
          success: function(result){
              //Set result to a variable for writing
              addressText.innerHTML=result.results[0].ADDRESS
              addressInputText.value=result.results[0].ADDRESS
              addressText.style.display="block"
              unitNumberForm.style.display="block"
              postalCodeForm.style.display="none"
          }})             
  }       
})

function moveLens(e) {
  let pos, x, y;
  /* Prevent any other actions that may occur when moving over the image */
  e.preventDefault();
  /* Get the cursor's x and y positions: */
  pos = getCursorPos(e);
  /* Calculate the position of the lens: */
  if(lens!==undefined){
    x = pos.x - (lens.offsetWidth / 2);
    y = pos.y - (lens.offsetHeight / 2);
  
  
    /* Prevent the lens from being positioned outside the image: */
    if (x > img.width - lens.offsetWidth) {x = img.width - lens.offsetWidth;}
    if (x < 0) {x = 0;}
    if (y > img.height - lens.offsetHeight) {y = img.height - lens.offsetHeight;}
    if (y < 0) {y = 0;}
    /* Set the position of the lens: */
    lens.style.left = x + "px";
    lens.style.top = y + "px";
    /* Display what the lens "sees": */
    result.style.backgroundPosition = "-" + (x * cx) + "px -" + (y * cy) + "px";
  
    img.parentElement.insertBefore(lens, img);
    imgContainer.appendChild(result)
  }
}
function getCursorPos(e) {
  let a, x = 0, y = 0;
  e = e || window.event;
  /* Get the x and y positions of the image: */
  a = img.getBoundingClientRect();
  /* Calculate the cursor's x and y coordinates, relative to the image: */
  x = e.pageX - a.left;
  y = e.pageY - a.top;
  /* Consider any page scrolling: */
  x = x - window.pageXOffset;
  y = y - window.pageYOffset;
  return {x : x, y : y};
}

function snackBarFunc() {
  // Get the snackbar DIV
  var x = document.getElementById("snackbar");

  // Add the "show" class to DIV
  x.className = "show";

  // After 3 seconds, remove the show class from DIV
  setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}