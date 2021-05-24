// Rover model class to store rover information
// class Rover {
//     constructor(roverData) {
//         this.roverName = roverData.image.photos[0].rover.name;
//         this.launchDate = roverData.image.photos[0].rover.launch_date;
//         this.landingDate = roverData.image.photos[0].rover.landing_date;
//         this.roverStatus = roverData.image.photos[0].rover.status;
//         this.recentDate = roverData.image.photos[0].rover.max_date;
//         this.imageSources = this.getLimitedRoverImagesSource(roverData);
//     }

//     // function to get first 20 (fast response time to user) image src URl from the responseData using map
//     getLimitedRoverImagesSource(roverDataResponse) {
//         let roverData = JSON.parse(JSON.stringify(roverDataResponse));
//         let limitedRoverImages = roverData.image.photos.splice(1, 20);
//         return limitedRoverImages.map(this.getRoverImageSource);
//     }

//     getRoverImageSource(roverImage) {
//         return roverImage.img_src;
//     }
// }
function Rover (roverD) {
    console.log(roverD)
    const roverData = roverD.image.photos[0] 
    this.roverName = roverData.rover.name;
    this.launchDate = roverData.rover.launch_date;
    this.landingDate = roverData.rover.landing_date;
    this.roverStatus = roverData.rover.status;
    this.recentDate = roverData.rover.max_date;
    this.imageSources = this.getLimitedRoverImagesSource(roverD);

}
// function to get first 20 (fast response time to user) image src URl from the responseData using map
Rover.prototype.getLimitedRoverImagesSource = function(roverDataResponse) {
    // let roverData = JSON.parse(JSON.stringify(roverDataResponse));
    // console.log(roverData)
    // console.log(roverDataResponse)
    /* 
    data was object type, does't need to parse/stringify
    */
    let limitedRoverImages = roverDataResponse.image.photos.splice(1, 20);
    console.log(limitedRoverImages)
    // console.log(this)
    // return limitedRoverImages.map( (roverImage) => this.getRoverImageSource(roverImage) ); 
    return limitedRoverImages.map( this.getRoverImageSource ); // will run 20 times
}

Rover.prototype.getRoverImageSource = (roverImage) => {
    console.log("getRoverImageSource RAN")
    return roverImage.img_src;
}

// High-order function - render UI through callback function
async function processUI(roverName, callBack) {
    let data = await getRoverData(roverName);
    console.log(data)
    // callBack(data);
    createDynamicUI(data);
}

// Calling `express server`
async function getRoverData(roverName) {

    const res = await fetch(`http://localhost:3000/nasaAPI`, {
        headers: {
            'roverName': roverName,
        }
    });
    let data = await res.json();
    console.log(data)
    if (!data.image.hasOwnProperty("errors")) {
        return processRoverData(data);
    }
    return data;
}

// A pure function to process rover data and parse it to `Rover` model
function processRoverData(responseData) {
    // let roverData = JSON.parse(JSON.stringify(responseData));
    console.log(responseData)
    let rover = new Rover(responseData);
    return rover;
}

// A high order function to create dynamic UI Elements as per NASA MARS Rover - API response
function createDynamicUI(roverData) {
    console.log(roverData)
    if (roverData.hasOwnProperty("image")) {
        handleError();
    }
    else {
        let roverName = document.getElementById("roverName");
        roverName.innerHTML = roverData.roverName;

        let launchDate = document.getElementById("launchDate");
        launchDate.innerHTML = roverData.launchDate;

        let landingDate = document.getElementById("landingDate");
        landingDate.innerHTML = roverData.landingDate;

        let status = document.getElementById("status");
        status.innerHTML = roverData.roverStatus;

        // let recentDate = document.getElementById("recentDate");
        // if( roverData.recentDate !== undefined){
        //     recentDate.innerHTML = roverData.recentDate
        // }

        let imageGallery = document.getElementById("roverImages");
        imageGallery.innerHTML = "";

        // let imgList = {}
        roverData.imageSources.map( (roverImage) => {
            imageEle = document.createElement("img");
                imageEle.setAttribute("src", roverImage)
                imageEle.setAttribute("class", "col-md-3 my-3");
                imageGallery.appendChild(imageEle);
        })
        // if( imgList.length > 0 ){
        //     console.log(imgList)
        //     imageGallery.appendChild(imgList);
        // }
        // for (let roverImage of roverData.imageSources) {
        //     console.log('roverImage')
        //     let imageEle = document.createElement("img");
        //     imageEle.setAttribute("src", roverImage)
        //     imageEle.setAttribute("class", "col-md-3 my-3");

        //     imageGallery.appendChild(imageEle);
        // }

        document.getElementById("roverMetaInfo").style.visibility = 'visible';
        document.getElementById("roverImages").style.visibility = 'visible';
        document.getElementById("errorBox").style.visibility = 'collapse';
    }

}

// Rendering error message to UI, if NASA API call fails
function handleError() {
    let roverMetaInfo = document.getElementById("roverMetaInfo");
    let errorBox = document.getElementById("errorBox");
    errorBox.style.color = "red";
    errorBox.innerHTML = "Error may be due to NASA API is not working properly.";
    errorBox.style.visibility = 'visible';
    roverMetaInfo.style.visibility = 'collapse';

    let imageGallery = document.getElementById("roverImages");
    imageGallery.style.visibility = 'collapse';
}