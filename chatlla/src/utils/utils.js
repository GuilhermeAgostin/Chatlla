import Cookies from "universal-cookie";

/***************************************** Location  ***********************************************************/
export const handleLocationStateCheck = async (locationStateToCheck) => {
  if (locationStateToCheck === null || locationStateToCheck === undefined) {
    return false;
  } else {
    return true;
  }
};

/***************************************** Local Storage ***********************************************************/
const KEY = `authorizedCookies`;
const IMAGE_PROFILE_KEY = `imageProfile`;

export const handleAuthorizationCookies = () => {
  let value = undefined;

  localStorage.getItem(KEY) === "true" ? (value = true) : (value = false);

  return value;
};

export const setAuthorizedCookies = (value) => {
  localStorage.setItem(KEY, value);
};

export const removeAuthorization = () => {
  localStorage.removeItem(KEY);
};

export const imageProfile = () => localStorage.getItem(IMAGE_PROFILE_KEY);

export const setUserImageProfile = (image) => {
  localStorage.setItem(IMAGE_PROFILE_KEY, image);
};

export const removeUserImageProfile = () => {
  localStorage.removeItem(IMAGE_PROFILE_KEY);
};

//Temporary
export const handleTemporaryUsername = (action = "set", userName) => {
  const TEMPORARY_USERNAME_KEY = `temporaryUsername`;
  switch (action) {
    case "set":
      localStorage.setItem(TEMPORARY_USERNAME_KEY, userName);
      break;
    case "get":
      return localStorage.getItem(TEMPORARY_USERNAME_KEY);
    case "delete":
      localStorage.removeItem(TEMPORARY_USERNAME_KEY);
      break;
    default:
      throw new Error(`Invalid action: ${action}`);
  }
};

/***************************************** Cookies ***********************************************************/
const cookies = new Cookies();

export const getBasicCookies = () => {
  let foundCookies = null;

  foundCookies = {
    userName: cookies.get("userName"),
    userId: cookies.get("userId"),
  };

  return foundCookies;
};

export const getCookies = {
  userName: cookies.get("userName"),
  userId: cookies.get("userId"),
  uptime: cookies.get("uptime"),
};

/***************************************** Image ***********************************************************/
function callFunction(img) {
  return new Promise((resolve, reject) => {
    img.onload = () => {
      resolve(true);
    };
  });
}

async function compressImage(blobImg, percent) {
  let img = new Image();
  img.src = URL.createObjectURL(blobImg);
  await callFunction(img);
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  canvas.width = img.width * 0.5;
  canvas.height = img.height * 0.5;
  ctx.drawImage(img, 0, 0, img.width * 0.5, img.height * 0.5);
  let dataUrl = canvas.toDataURL("image/jpeg", percent / 100);

  return dataUrl;
}

export const handleImage = async (e) => {
  var file = e.target.files[0];
  // console.log("File Name: ", file.name);
  // console.log("Original Size: ", file.size.toLocaleString());
  let imgCompressed = await compressImage(file, 40);

  return imgCompressed;
};

export function bytesToSize(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  if (bytes === 0) {
    return "0 Byte";
  }

  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));

  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
}

export function fileToDataUri(field) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("load", (event) => {
      resolve(reader.result);
    });
    reader.readAsDataURL(field);
  });
}

/***************************************** Date ***********************************************************/
export function formatDate(date = new Date(), Format = DateFormatPattern) {
  let newDate = undefined;

  import("moment").then((module) => {
    newDate = module.default(date).format(Format);
  });

  return newDate;
}

export const compareDates = async (inputDate, amount, unit) => {
  const moment = await import("moment");

  const newDate = moment.default(inputDate);
  const currentData = moment.default();
  const newDate2 = newDate.clone().add(parseInt(amount), "day");

  if (unit === "days") {
    if (currentData.isAfter(newDate2)) {
      return true;
    } else {
      return false;
    }
  } else {
    const diff = moment.default(new Date()).diff(newDate, "minutes");

    if (diff > 10) {
      return true;
    } else {
      return false;
    }
  }
};

/***************************************** String ***********************************************************/
export function capitalizeFirstLetter(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/***************************************** Array ***********************************************************/
export function sortArrayByItemName(array, order = "ascending") {
  let sortedArray = array.sort((a, b) => {
    if (order === "ascending") {
      return a.name.localeCompare(b.name); //ascendent
    } else {
      return b.name.localeCompare(a.name); //descendent
    }
  });

  return sortedArray;
}
