import axios from "axios";
const GET = async (token, url) => {
  var config = {
    method: "get",
    maxBodyLength: Infinity,
    url: url,
    headers: {
      Authorization: token,
    },
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

const ADD = async (token, url, data) => {
  var config = {
    method: "post",
    maxBodyLength: Infinity,
    url: url,
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    data: data,
  };
  try {
    const response = await axios(config);
    console.log(response);
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};
const ADDMulti = async (token, url, data) => {
  var config = {
    method: "post",
    maxBodyLength: Infinity,
    url: url,
    headers: {
      Authorization: token,
      "Content-Type": "multipart/form-data",
    },
    data: data,
  };
  try {
    const response = await axios(config);
    console.log(response);
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

const UPDATE = async (token, url, data) => {
  var config = {
    method: "post",
    maxBodyLength: Infinity,
    url: url,
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    data: data,
  };
  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

const DELETE = async (token, url, data) => {
  var config = {
    method: "post",
    maxBodyLength: Infinity,
    url: url,
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    data: data,
  };
  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

const UPLOAD = async (token, url, data) => {
  var config = {
    method: "post",
    maxBodyLength: Infinity,
    url: url,
    headers: {
      Authorization: token,
      "Content-Type": "multipart/form-data",
    },
    data: data,
  };
  try {
    const response = await axios(config);
    console.log(response);
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

const PUT = async (token, url, data) => {
  var config = {
    method: "put",
    maxBodyLength: Infinity,
    url: url,
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    data: data,
  };
  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export { GET, ADD, DELETE, UPDATE, UPLOAD, ADDMulti, PUT };
