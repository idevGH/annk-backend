const slides = document.querySelectorAll(".slide");
const tabsContainer = document.querySelector(".dashboard-area-header-menu");

let currSlide = 0;
// Translating the various slides
const translateSlides = function (currentSlide) {
  slides.forEach((slide, ind) => {
    slide.style.transform = `translateX(${(ind - currSlide) * 105}%)`;
    // console.log(ind);
  });
};
translateSlides(currSlide);

// Adding a click handler to the various tabs
tabsContainer.addEventListener("click", function (e) {
  const clickedTab = e.target.closest(".dashboard-area-header-menu-item");
  const tabItems = Array.from(this.children);
  if (clickedTab) {
    tabItems.forEach((menuItem, ind) => {
      menuItem.classList.remove("selected");
      currSlide = menuItem === clickedTab ? ind : currSlide;
    });
    clickedTab.classList.add("selected");
    translateSlides(currSlide);
  }
});
