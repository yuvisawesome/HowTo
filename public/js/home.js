var postOptionsArray = document.getElementsByClassName("more-options")

postOptionsArray.array.forEach(postOption => {
    postOption.addEventListener("click", function() {
        console.log(postOption);
    })
});
