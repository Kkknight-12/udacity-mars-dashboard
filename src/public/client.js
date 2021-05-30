function paginate(
    roverDataResponse, totalItems, currentPage = 1, pageSize = 10, maxPages = 10 ) {
    // calculate total pages
    let totalPages = Math.ceil(totalItems / pageSize);

    // ensure current page isn't out of range
    if (currentPage < 1) {
        currentPage = 1;
    } else if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    let startPage , endPage;
    if (totalPages <= maxPages) {
        // total pages less than max so show all pages
        startPage = 1;
        endPage = totalPages;
    } else {
        // total pages more than max so calculate start and end pages
        let maxPagesBeforeCurrentPage = Math.floor(maxPages / 2);
        let maxPagesAfterCurrentPage = Math.ceil(maxPages / 2) - 1;
        if (currentPage <= maxPagesBeforeCurrentPage) {
            // current page near the start
            startPage = 1;
            endPage = maxPages;
        } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
            // current page near the end
            startPage = totalPages - maxPages + 1;
            endPage = totalPages;
        } else {
            // current page somewhere in the middle
            startPage = currentPage - maxPagesBeforeCurrentPage;
            endPage = currentPage + maxPagesAfterCurrentPage;
        }
    }

    // calculate start and end item indexes
    let startIndex = (currentPage - 1) * pageSize;
    let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

    // create an array of pages to ng-repeat in the pager control
    let pages = Array.from(Array((endPage) - startPage).keys()).map(i => startPage + i);

    htmlPage(pages, totalPages)
    page(roverDataResponse, totalItems, pageSize )
}

let photos = {},
globalList = [];

function page( roverDataResponse, totalItems, pageSize ){
    let i = 0,
    obj = {},
    list = [],
    lastIteration = totalItems;
    while (i < totalItems){
        let subList = [], 
        pageeSize  = Math.min( pageSize, lastIteration)
        for( let j = 0; j < pageeSize; j ++ ){
            subList.push(roverDataResponse.image.photos[i])
            i++
            lastIteration = lastIteration - 1
        }
        obj = subList;
        list.push(obj);
    }

    globalList =  list;
    photos = list[0];
}

function htmlPage(data, totalPages){    
    pages = document.getElementById("pages");
    pages.innerHTML = 
    `
    <ul class="pagination justify-content-center">
        ${  data.map( (data) => {
            return pages.innerHTML = 
            `<li class="roverData page-item" onclick = "currentPage( ${data} )"><a class="page-link" href="#"> ${data}</a></li>`
            } ).join("") }
    </ul>
    `
}

function currentPage (renderPage)  {
    photos = globalList[renderPage];
    let rover = new Rover( {image:{photos} }) ;
    DynamicUI(rover);
}

function Rover( roverD ) {
    const roverData = roverD.image.photos[0] 
    this.roverName = roverData.rover.name;
    this.launchDate = roverData.rover.launch_date;
    this.landingDate = roverData.rover.landing_date;
    this.roverStatus = roverData.rover.status;
    this.recentDate = roverData.rover.max_date;
    this.getRoverImage(photos)
    this.imageSources = this.getRoverImage(photos);
}

Rover.prototype.getRoverImage = (roverImage) => {
    return roverImage.map( (data) => {
        if(  data !==  undefined ){
            return data.img_src
        }
    } );
}

async function processUIData(roverName, callBack) {
    let data = await fetchRoverData(roverName);
    callBack(data);
};

async function fetchRoverData( roverName ) {
    const res = await fetch(`http://localhost:3000/nasaAPI`, {
        headers: {
            'roverName': roverName,
        }
    });
    let data = await res.json();
    paginate(data, data.image.photos.length);

    if ( !data.image.hasOwnProperty( "errors" ) ) {
        return processRoverData(data)
    }
    return data;
};

function processRoverData(responseData) {
    let rover = new Rover(responseData);
    return rover;
}

// A high order function to create dynamic UI Elements as per NASA MARS Rover - API response
function DynamicUI(domRoverData) {

    if (domRoverData.hasOwnProperty("image")) {
        handlingError();
    }
    else {
        let roverName = document.getElementById("roverName");
        roverName.innerHTML = domRoverData.roverName;

        let launchDate = document.getElementById("launchDate");
        launchDate.innerHTML = domRoverData.launchDate;

        let landingDate = document.getElementById("landingDate");
        landingDate.innerHTML = domRoverData.landingDate;

        let status = document.getElementById("status");
        status.innerHTML = domRoverData.roverStatus;

        let imageGallery = document.getElementById("roverImages");
        imageGallery.innerHTML = "";

        domRoverData.imageSources.map( (roverImage) => {
            if( roverImage !== undefined ){
                imageEle = document.createElement("img")
                imageEle.setAttribute("src", roverImage)
                imageEle.setAttribute("class", "col-md-5 my-4");
                imageGallery.appendChild(imageEle);
            }
        });
        document.getElementById("roverMetaData").style.visibility = 'visible';
        document.getElementById("roverImages").style.visibility = 'visible';
        document.getElementById("errorCard").style.visibility = 'collapse';
    }

}

// Rendering error message to UI, if NASA API call fails
function handlingError() {
    let roverMetaData = document.getElementById("roverMetaData");
    let errorCard = document.getElementById("errorCard");
    errorCard.style.color = "red";
    errorCard.innerHTML = "eror occurred  while trying to fetch data.";
    errorCard.style.visibility = 'visible';
    roverMetaData.style.visibility = 'collapse';

    let imageGallery = document.getElementById("roverImages");
    imageGallery.style.visibility = 'collapse';
};
