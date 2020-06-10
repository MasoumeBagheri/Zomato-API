//Create categories class
class categories {
  constructor(Id, Name) {
    this.categoryId = Id;
    this.categoryName = Name;
  }
  getCategoryId() {
    return this.categoryId;
  }
  getcategoryName() {
    return this.categoryName;
  }
}
//Create cuisines class
class cuisines {
  constructor(Id, Name) {
    this.cuisineId = Id;
    this.cuisineName = Name;
  }
  getCuisineId() {
    return this.cuisineId;
  }
  getCuisineName() {
    return this.cuisineName;
  }
}
//Create restaurants class
class restaurants {
  constructor(Id, Name) {
    this.restaurantId = Id;
    this.restaurantName = Name;
  }
  getRestaurantId() {
    return this.restaurantId;
  }
  getRestaurantName() {
    return this.restaurantName;
  }
}
//Create function zomato for fill input tags(categoreis and cuisines) and anchor tags(restaurants)
async function zomato() {
  try {
    let zomatoUrls = [
      "https://developers.zomato.com/api/v2.1/categories",
      "https://developers.zomato.com/api/v2.1/cuisines?city_id=297",
      "https://developers.zomato.com/api/v2.1/search?entity_id=297&entity_type=city&order=asc",
    ];

    let requests = await zomatoUrls.map((url) =>
      fetch(url, {
        method: "GET",
        headers: {
          Accept: " application/json",
          "user-key": "169d3aaf248afc8c772eaa1c1c465f6a",
        },
      }).then((response) => {
        if (response.status === 403) {
          throw new Error("API KEY is no valid");
        } else if (response.status === 500) {
          throw new Error("500 Internal Server Error");
        }
        return response;
      })
    );

    await Promise.all(requests).then((responses) =>
      responses.forEach((response) => {
        if (response.status === 200) {
          response.json().then((json) => {
            console.log(json);
            if (Object.keys(json)[0] === "categories") {
              //Use handlebars.js,fill input tags(categoreis) and show them
              let templateCategory = document.getElementById("templateList")
                .innerHTML;
              let templateCategoryScript = Handlebars.compile(templateCategory);
              for (let i = 3; i >= 0; i--) {
                let category = new categories(
                  json.categories[i].categories.id,
                  json.categories[i].categories.name
                );
                let contextCategory = {
                  className: "categories",
                  elementType: "checkbox",
                  elementClass: "category",
                  elementClassId: "category-",
                  counter: i,
                  getElementId: category.getCategoryId(),
                  getElementName: category.getcategoryName(),
                };
                let htmlCategory = templateCategoryScript(contextCategory);
                let divCategories = document.getElementsByClassName(
                  "categoryList"
                )[0];
                divCategories.insertAdjacentHTML("afterbegin", htmlCategory);
              }
            } else if (Object.keys(json)[0] === "cuisines") {
              let inputCuisine = "";
              let node = "";
              let itemsCount = 11;
              let col = Math.ceil(itemsCount / 4);
              let openFlag = true;
              let itemNumber = 1;
              for (let j = 0; j < itemsCount; j++) {
                inputCuisine = "";
                let cuisinesArray = json.cuisines[j].cuisine.cuisine_name;
                let cuisinesArrayId = json.cuisines[j].cuisine.cuisine_id;
                if (col != 0 && openFlag) {
                  inputCuisine +=
                    '<div class="col-md-4"><div class="row cuisines">';
                  openFlag = false;
                }
                inputCuisine +=
                  ' <div class="col-md-12"><input type="checkbox" class="cuisine" id="cuisine-' +
                  j +
                  '" value="' +
                  cuisinesArrayId +
                  '"onchange="getId(this.id)"">' +
                  '<span id="cuisine-' +
                  j +
                  '">' +
                  cuisinesArray +
                  "</span></div>";
                ++itemNumber;

                if (itemNumber === 5 || j === itemsCount - 1) {
                  inputCuisine += "</div></div>";
                  itemNumber = 1;
                  openFlag = true;
                }

                node += inputCuisine;
              }
              // console.log(node);
              let divCuisines = document.getElementsByClassName(
                "cuisineList"
              )[0];
              divCuisines.insertAdjacentHTML("afterbegin", node);
            } else {
              //Fill anchor tags(restaurants)
              restaurant(json.restaurants);
            }
          });
        }
      })
    );
  } catch (err) {
    alert(err);
  }
}
//Calling function zomato()
zomato();
//Completion url with create and fill (arrCategory and arrCuisine) for query string and send url and get restaurants list
let arrCategory = [];
let arrCuisine = [];
let arrCuisineJoin;
let searchUrl;
async function getId(id) {
  //debugger;
  try {
    searchUrl =
      "https://developers.zomato.com/api/v2.1/search?entity_id=297&entity_type=city&order=asc";
    if (document.getElementById(id).className === "category") {
      //If checkbox is checked its value is added to the arrCategory array
      if (document.getElementById(id).checked) {
        arrCategory.push(document.getElementById(id).value);
        //The array of arrCategory should only have one item
        if (arrCategory.length > 1) {
          arrCategory.shift();
        }
        //Only one of the arrCategory array items should be checked
        for (let r = 0; r < 4; r++) {
          if ("category-" + r !== id) {
            document.getElementById("category-" + r).checked = false;
          }
        }
      } else {
        //If checkbox is unchecked its value is remove to the arrCuisine array
        for (let n = 0; n < arrCategory.length; n++) {
          if (arrCategory[n] === document.getElementById(id).value) {
            arrCategory.splice(n, 1);
          }
        }
      }
    } else if (document.getElementById(id).className === "cuisine") {
      //If checkbox is checked its value is added to the arrCuisine array
      if (document.getElementById(id).checked) {
        arrCuisine.push(document.getElementById(id).value);
      } else {
        //If checkbox is unchecked its value is remove to the arrCuisine array
        for (let j = 0; j < arrCuisine.length; j++) {
          if (arrCuisine[j] === document.getElementById(id).value) {
            arrCuisine.splice(j, 1);
          }
        }
      }
    }

    arrCuisineJoin = arrCuisine.join("%2c");
    //add arrCategory item for query string
    if (arrCategory.length !== 0) {
      searchUrl += `&category=${arrCategory[0]}`;
    }
    //add arrCuisine items for query string
    if (arrCuisine.length !== 0) {
      searchUrl += `&cuisines=${arrCuisineJoin}`;
    }
    //send url and get restaurants list
    let searchRespons = await fetch(searchUrl, {
      method: "GET",
      headers: {
        Accept: " application/json",
        "user-key": "169d3aaf248afc8c772eaa1c1c465f6a",
      },
    }).then((response) => {
      if (response.status === 403) {
        throw new Error("API KEY is no valid");
      } else if (response.status === 500) {
        throw new Error("500 Internal Server Error");
      }
      return response;
    });
    //Remove list of previous restaurants and fill "result" in the list of received restaurants
    //*********************************************
    if (searchRespons.ok) {
      let searchJson = await searchRespons.json();

      //Remove list of previous restaurants and fill "element" in the list of received restaurants
      let element = document.getElementById("res");
      element.innerHTML = "";
      restaurant(searchJson.restaurants);
      console.log(searchJson);
      console.log(searchUrl);
    }
  } catch (err) {
    alert(err);
    //console.log(err);
  }
}
/* onMouseOver="this.style.Color=`red`" onMouseOut="this.style.backgroundColor=`transparent`" */
//Fill anchor tags(restaurants)
let ratingArray = [];
let minRating;
let maxRating;
let priceArray = [];
let minPrice;
let maxPrice;
function restaurant(inputJson) {
  //If the number of restaurants received was zero , element information will be emptied
  if (Object.keys(inputJson).length === 0) {
    document.getElementById("information").innerHTML = "";
  } else {
    for (let k = Object.keys(inputJson).length - 1; k >= 0; k--) {
      console.log(Object.keys(inputJson).length);
      // debugger;
      ratingArray.push(inputJson[k].restaurant.user_rating.aggregate_rating);
      priceArray.push(inputJson[k].restaurant.price_range);

      let restaurant = new restaurants(
        inputJson[k].restaurant.R.res_id,
        inputJson[k].restaurant.name
      );
      let liElementRestaurant =
        '<tr id="' +
        `${restaurant.getRestaurantId()}` +
        '"><td><a class="restaurant" id="' +
        restaurant.getRestaurantId() +
        '"style="text-decoration: none; color:black;"onclick="getResId(this.id)">';
      let liLableElementRestaurant =
        restaurant.getRestaurantName() + "</a></td></tr>";
      let node = liElementRestaurant + liLableElementRestaurant;
      let divRestaurants = document.getElementsByClassName("restaurants")[0];
      divRestaurants.insertAdjacentHTML("afterbegin", node);
      let firstRestaurant = new restaurants(
        inputJson[0].restaurant.R.res_id,
        null
      );
      getResId(firstRestaurant.getRestaurantId());
    }
  }

  maxRating = Math.max.apply(Math, ratingArray);
  minRating = Math.min.apply(Math, ratingArray);
  maxPrice = Math.max.apply(Math, priceArray);
  minPrice = Math.min.apply(Math, priceArray);

  $(".js-range-slider").ionRangeSlider();
  let my_range = $(".js-range-slider").data("ionRangeSlider");
  my_range.update({
    from: minRating,
    to: maxRating,
  });
  my_range.reset();
  //*********************************************************************
  $(".js-priceRange-slider").ionRangeSlider();
  let my_priceRange = $(".js-priceRange-slider").data("ionRangeSlider");
  my_priceRange.update({
    from: minPrice,
    to: maxPrice,
  });
  my_priceRange.reset();

  ratingArray.splice(0, ratingArray.length);
}

//Get restaurant information and show them
async function getResId(Id) {
  //debugger;
  try {
    let resUrl =
      "https://developers.zomato.com/api/v2.1/restaurant?res_id=" + `${Id}`;
    // console.log(resUrl);
    let resResponse = await fetch(resUrl, {
      method: "GET",
      headers: {
        Accept: " application/json",
        "user-key": "169d3aaf248afc8c772eaa1c1c465f6a",
      },
    }).then((response) => {
      if (response.status === 403) {
        throw new Error("API KEY is no valid");
      } else if (response.status === 500) {
        throw new Error("500 Internal Server Error");
      }
      return response;
    });
    if (resResponse.ok) {
      let resJson = await resResponse.json();
      console.log(resJson);
      console.log(resJson.featured_image);
      console.log(resJson.name);
      //Use handlebars.js ,show restaurant information
      let templateRestaurant = document.getElementById("template").innerHTML;
      let templateScript = Handlebars.compile(templateRestaurant);
      let context = {
        photo: resJson.featured_image, //photos[0].photo.url,
        name: resJson.name,
        address: resJson.location.address,
        cuisines: resJson.cuisines,
        phoneNumbers: resJson.phone_numbers,
        timings: resJson.timings,
      };
      let html = templateScript(context);
      document.getElementById("information").innerHTML = html;
      let book = document.getElementById("book");
      if (resJson.has_table_booking === 0) {
        book.innerHTML =
          '<i id="icon-close" class="fas fa-times fa-lg"></i><span>No bookings</span>';
      } else if (resJson.has_table_booking === 1) {
        book.innerHTML =
          '<i id="icon-check" class="fas fa-check fa-lg"></i><span>Bookings available</span>';
      }
      let delivery = document.getElementById("delivery");
      if (resJson.has_online_delivery === 0) {
        delivery.innerHTML =
          '<i id="icon-close" class="fas fa-times fa-lg"></i><span>No delivery</span>';
      } else if (resJson.has_online_delivery === 1) {
        delivery.innerHTML =
          '<i id="icon-check" class="fas fa-check fa-lg"></i><span>Delivery available</span>';
      }
      let resList = document.getElementsByTagName("tr");

      for (let s = 0; s < resList.length; s++) {
        if (resList[s].hasAttribute("class")) {
          resList[s].classList.remove("active");
        }
      }
      let resActive = document.getElementById(Id);
      resActive.classList.add("active");
    }
  } catch (err) {
    //  alert(err);
    console.log();
  }
}
