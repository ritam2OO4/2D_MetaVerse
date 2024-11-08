const axios = require("axios");
const { describe } = require("yargs");



const BACKEND_URL = "http://localhost:3000"
const WS_URL = "ws://localhost:3001"

// describe blocks for http server

describe("Authentication", () => {
  test("User is able to sign up only once", async () => {
    const userName = "Ritam" + Math.random();  //Ritam0.1213232
    const password = "123456"
    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      userName,
      password,
      type: "admin"
    })
    expect(response.statusCode.toBe(200))
    const updatedResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      userName,
      password,
      type: "admin"
    })
    expect(response.statusCode).toBe(400)
  })

  test("Signup request fails if the username is empty", async () => {
    const userName = `Ritam-${Math.random()}`   //Ritam-0.12344214
    const password = "123456"
    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      password
    })
    expect(response.statusCode).toBe(400)
  })

  test("Signin succeeds if username and password are correct", async () => {
    const userName = "Ritam" + Math.random();  //Ritam0.1213232
    const password = "1234"
    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      userName,
      password,
      type: "admin"
    })
    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      userName,
      password
    })
    expect(response.statusCode).toBe(200)
    expect(response.body.token).toBeDefined()
  })
  test("Signin fails if username and password are incorrect", async () => {
    const userName = "Ritam" + Math.random();  //Ritam0.1213232
    const password = "1234"
    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      userName,
      password,
      type: "admin"
    })
    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      userName: "WorngUsername",
      password
    })
    expect(response.statusCode).toBe(403)
  })
})


describe("User metadata endpoint", () => {
  let adminToken = "";
  let avatarId = "";
  beforeAll(async () => {
    const userName = "Ritam" + Math.random();  //Ritam0.1213232
    const password = "1234"
    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      userName,
      password,
      type: "admin"
    })
    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      userName,
      password
    })
    adminToken = response.data.token
    const AvatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
      "imageUrl": "https://www.google.com/imgres?q=avatar%20profile%202d%20game&imgurl=https%3A%2F%2Fimg.freepik.com%2Ffree-vector%2Fcute-ninja-gaming-cartoon-vector-icon-illustration-people-technology-icon-concept-isolated-flat_138676-8079.jpg&imgrefurl=https%3A%2F%2Fwww.freepik.com%2Ffree-photos-vectors%2Fgaming-avatar&docid=RbDuYQJwGjyynM&tbnid=2-HYbV2YP1xgSM&vet=12ahUKEwiw3pbIzcCJAxXc2TgGHScSLV8QM3oECGUQAA..i&w=626&h=626&hcb=2&ved=2ahUKEwiw3pbIzcCJAxXc2TgGHScSLV8QM3oECGUQAA",
      "name": "Ninja",
    }, {
      headers: {
        "authorization": `Bearer ${adminToken}`
      }
    })
    avatarId = response.data.avatarId
  })
  test("User can't update their metaData with wrong avatar id", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/user/metaData`, {
      avatarId: "1232432425342"
    }, {
      Headers: {
        "authentication": `Bearer ${token}`
      }
    })
    expect(response.statusCode).toBe(400)
  })

  test("User can update their metaData with correct avatar id", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/user/metaData`, {
      avatarId,
    }, {
      Headers: { "authorization": `Bearer ${token}` }
    })
    expect(response.statusCode).toBe(200)
  })

  test("User is not able to update their metaData if the auth header is not rresent", async () => {       // acessing without authenticationn token or missing of token in headers
    const response = await axios.post(`${BACKEND_URL}/api/v1/user/metaData`, {
      avatarId,
    })
    expect(response.statusCode).toBe(403)
  })
})


describe("User avatar onformaton", () => {
  let token;
  let avatarId;
  let userId;
  beforeAll(async () => {
    const userName = "Ritam" + Math.random();  //Ritam0.1213232
    const password = "1234"
    const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      userName,
      password,
      type: "admin"
    })
    userId = signupResponse.data.userId;
    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      userName,
      password
    })
    token = response.data.token
    const AvatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
      "imageUrl": "https://www.google.com/imgres?q=avatar%20profile%202d%20game&imgurl=https%3A%2F%2Fimg.freepik.com%2Ffree-vector%2Fcute-ninja-gaming-cartoon-vector-icon-illustration-people-technology-icon-concept-isolated-flat_138676-8079.jpg&imgrefurl=https%3A%2F%2Fwww.freepik.com%2Ffree-photos-vectors%2Fgaming-avatar&docid=RbDuYQJwGjyynM&tbnid=2-HYbV2YP1xgSM&vet=12ahUKEwiw3pbIzcCJAxXc2TgGHScSLV8QM3oECGUQAA..i&w=626&h=626&hcb=2&ved=2ahUKEwiw3pbIzcCJAxXc2TgGHScSLV8QM3oECGUQAA",
      "name": "Ninja",
    })
    avatarId = response.data.avatarId
  })

  test("Get back avatar information for a user", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`);
    expect(response.data.avatars.length).toBe(1)
    expect(response.data.avatars[0].userId).toBe(userId)
  })
  test("Availabe avatars lists the recently created avatar", async () => {
    const response = axios.get(`${BACKEND_URL}/api/v1/avatatars`);
    expect(response.data.avatars.length).not.toBe(0)
    const currentAvatar = response.data.avatars.find(x => x.id == avatarId)
    expect(currentAvatar).toBeDefined()
  })
})


describe("space information", () => {
  let mapId;
  let element1Id;
  let element2Id;
  let userId;
  let userToken;
  let adminId;
  let adminToken;
  beforeAll(async () => {
    const userName = "Ritam" + Math.random();  //Ritam0.1213232
    const password = "1234"
    const adminSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      userName,
      password,
      type: "admin"
    })
    adminId = adminSignupResponse.data.userId;
    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      userName,
      password
    })
    adminToken = response.data.token
    const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      userName: userName + "-user",
      password,
      type: "user"
    })
    userId = userSignupResponse.data.userId;
    const UserSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      userName: userName + "-user",
      password
    })
    userToken = UserSigninResponse.data.token
    const element1 = await axios.post(`${BACKEND_URL}/api/vi/admin/element`,
      {
        "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        "width": 1,
        "height": 1,
        "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
      },
      {
        Headers: {
          "authorization": `Bearer ${token}`
        }
      })
    const element2 = await axios.post(`${BACKEND_URL}/api/vi/admin/element`,
      {
        "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        "width": 1,
        "height": 1,
        "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
      },
      {
        Headers: {
          "authorization": `Bearer ${token}`
        }
      })
    element1Id = element1.data.id
    element2Id = element2.data.id

    const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {

      "thumbnail": "https://thumbnail.com/a.png",
      "dimensions": "100x200",
      "name": "100 person interview room",
      "defaultElements": [{
        elementId: element1Id,
        x: 20,
        y: 20
      }, {
        elementId: element1Id,
        x: 18,
        y: 20
      }, {
        elementId: element2Id,
        x: 19,
        y: 20
      }
      ]
    }, {
      Headers: {
        "authorization": `Bearer ${token}`
      }
    })
    mapId = map.data.id
  })

  test("User can create a space", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
      "name": "Test",
      "dimensions": "100x200",
      "mapId": mapId
    }, {
      Headers: {
        "authorization": `Bearer ${userToken}`
      }
    })
    expect(response.data.spaceId).toBeDefined();
  })
  test("User can create a space without mapId (empty space)", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
      "name": "Test",
      "dimensions": "100x200",
    }, {
      Headers: {
        "authorization": `Bearer ${userToken}`
      }
    })
    expect(response.data.spaceId).toBeDefined();
  })
  test("User can't create a space without mapId and dimensions", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
      "name": "Test",
    }, {
      Headers: {
        "authorization": `Bearer ${userToken}`
      }
    })
    expect(response.statusCode).toBe(400);
  })
  test("User can't delete a space which doesn't exists", async () => {
    const response = await axios.delete(`${BACKEND_URL}/api/v1/space/randomIdDoesnotExists`, {
      Headers: {
        "authorization": `Bearer ${userToken}`
      }
    })
    expect(response.statusCode).toBe(400);
  })
  test("User can delete a space which does exists", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/space/randomIdDoesnotExists`, {
      "name": "Test",
      "dimensions": "100x200",
    }, {
      Headers: {
        "authorization": `Bearer ${userToken}`
      }
    })
    const deleteResponse = await axios.delete(`${BACKEND_URL}/api/vi/space/${response.data.spaceId}`, {
      Headers: {
        "authorization": `Bearer ${userToken}`
      }
    })
    expect(deleteResponse.statusCode).toBe(200);
  })
  test("User should not delete a space which is created by another user", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/space/randomIdDoesnotExists`, {
      "name": "Test",
      "dimensions": "100x200",
    }, {
      Headers: {
        "authorization": `Bearer ${userToken}`
      }
    })
    const deleteResponse = await axios.delete(`${BACKEND_URL}/api/vi/space/${response.data.spaceId}`, {
      Headers: {
        "authorization": `Bearer ${adminToken}`
      }
    })
    expect(deleteResponse.statusCode).toBe(400);
  })

  test("Admin has no spaces initially", async () => {
    const response = await axios.get(`${BACKEND_URL}/api.v1/space/all`, {
      headers: {
        "authorization": `Bearer ${adminToken}`
      }
    })
    expect(response.data.spaces.length).toBe(0)
  })
  test("Admin can create spaces initially", async () => {
    const spaceCreateResponse = await axios.post(`${BACKEND_URL}/api/v1/space/all`, {
      "name": "Test",
      "dimensions": "100x200",
    }, {
      Headers: {
        "authorization": `Bearer ${userToken}`
      }
    })
    const response = await axios.get(`${BACKEND_URL}/api/v1/space`, {
      headers: {
        "authorization": `Bearer ${adminToken}`
      }
    })
    const filterSpace = response.data.spaces.find(x => x.id == spaceCreateResponse.spaceId)
    expect(filterSpace).toBeDefined();
    expect(response.data.spaces.length).toBe(1)
  })

})


describe("Arena endpoints", () => {
  let userId;
  let userToken;
  let adminId;
  let adminToken;
  let mapId;
  let element1Id;
  let element2Id;
  let spaceId;
  beforeAll(async () => {
    const userName = "Ritam" + Math.random();  //Ritam0.1213232
    const password = "1234"
    const adminSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      userName,
      password,
      type: "admin"
    })
    adminId = adminSignupResponse.data.userId;
    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      userName,
      password
    })
    adminToken = response.data.token
    const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      userName: userName + "-user",
      password,
      type: "user"
    })
    userId = userSignupResponse.data.userId;
    const UserSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      userName: userName + "-user",
      password
    })
    userToken = UserSigninResponse.data.token
    const element1 = await axios.post(`${BACKEND_URL}/api/vi/admin/element`,
      {
        "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        "width": 1,
        "height": 1,
        "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
      },
      {
        Headers: {
          "authorization": `Bearer ${userToken}`
        }
      })
    const element2 = await axios.post(`${BACKEND_URL}/api/vi/admin/element`,
      {
        "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        "width": 1,
        "height": 1,
        "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
      },
      {
        Headers: {
          "authorization": `Bearer ${userToken}`
        }
      })
    element1Id = element1.map.id
    element2Id = element2.map.id

    const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {

      "thumbnail": "https://thumbnail.com/a.png",
      "dimensions": "100x200",
      "name": "100 person interview room",
      "defaultElements": [{
        elementId: element1Id,
        x: 20,
        y: 20
      }, {
        elementId: element1Id,
        x: 18,
        y: 20
      }, {
        elementId: element2Id,
        x: 19,
        y: 20
      }
      ]
    }, {
      Headers: {
        "authorization": `Bearer ${userToken}`
      }
    })
    mapId = map.data.id
    const space = await axios.post(`${BACKEND_URL}/api/v1/space`, {
      "name": "Test",
      "dimensions": "100x200",
      "mapId": mapId
    }, {
      Headers: {
        "authorization": `Bearer ${userToken}`
      }
    })
    spaceId = space.data.spaceId
  })
  test("Incorrect space id returns statusCode 400", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/123ksdId`, {
      headers: {
        "authentication": `Bearer ${userToken}`
      }
    });
    expect(response.statusCode).toBe(400)
  })
  test("Correct space id returns all elements", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/${spaceId}`, {
      headers: {
        "authentication": `Bearer ${userToken}`
      }
    });
    expect(response.data.dimensions).toBe("100x200")
    expect(response.data.elements.length).toBe(3)
  })
  test("delete enpoints is able to delete an element", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/${spaceId}`, {
      headers: {
        "authentication": `Bearer ${userToken}`
      }
    });

    await axios.delete(`${BACKEND_URL}/api/v1/space`, {
      spaceId,
      elementId: response.data.elements[0].id,
    }, {
      headers: {
        "authentication": `Bearer ${userToken}`
      }
    })
    const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
      headers: {
        "authentication": `Bearer ${userToken}`
      }
    })
    expect(newResponse.data.elements.length).toBe(2)
  })
  test("adding a element works as expected", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
      "elementId": element1Id,
      "spaceId": spaceId,
      "x": 50,
      "y": 20
    }, {
      headers: {
        "authentication": `Bearer ${userToken}`
      }
    });
    expect(response.statusCode).toBe(200)
    const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
      headers: {
        "authentication": `Bearer ${userToken}`
      }
    })
    expect(newResponse.data.elements.length).toBe(3)
  })
  test("adding a element beyond the dimensions", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
      "elementId": element1Id,
      "spaceId": spaceId,
      "x": 500000,
      "y": 202389043,
    }, {
      headers: {
        "authentication": `Bearer ${userToken}`
      }
    });
    expect(response.statusCode).toBe(400)
    const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
      headers: {
        "authentication": `Bearer ${userToken}`
      }
    })
    expect(newResponse.data.elements.length).toBe(3)
  })
})


describe("Admin endpoints", () => {
  let userId;
  let userToken;
  let adminId;
  let adminToken;
  beforeAll(async () => {
    const userName = "Ritam" + Math.random();  //Ritam0.1213232
    const password = "1234"
    const adminSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      userName,
      password,
      type: "admin"
    })
    adminId = adminSignupResponse.data.userId;
    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      userName,
      password
    })
    adminToken = response.data.token
    const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      userName: userName + "-user",
      password,
      type: "user"
    })
    userId = userSignupResponse.data.userId;
    const UserSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      userName: userName + "-user",
      password
    })
    userToken = UserSigninResponse.data.token
  })

  test("User not able to hit admin endpoints", async () => {
    const elementResponse = await axios.post(`${BACKEND_URL}/api/vi/admin/element`,
      {
        "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        "width": 1,
        "height": 1,
        "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
      },
      {
        Headers: {
          "authorization": `Bearer ${userToken}`
        }
      })

    const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {

      "thumbnail": "https://thumbnail.com/a.png",
      "dimensions": "100x200",
      "name": "100 person interview room",
      "defaultElements": [{
        elementId: element1Id,
        x: 20,
        y: 20
      }, {
        elementId: element1Id,
        x: 18,
        y: 20
      }, {
        elementId: element2Id,
        x: 19,
        y: 20
      }
      ]
    }, {
      Headers: {
        "authorization": `Bearer ${token}`
      }
    })
    const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
      "imageUrl": "https://www.google.com/imgres?q=avatar%20profile%202d%20game&imgurl=https%3A%2F%2Fimg.freepik.com%2Ffree-vector%2Fcute-ninja-gaming-cartoon-vector-icon-illustration-people-technology-icon-concept-isolated-flat_138676-8079.jpg&imgrefurl=https%3A%2F%2Fwww.freepik.com%2Ffree-photos-vectors%2Fgaming-avatar&docid=RbDuYQJwGjyynM&tbnid=2-HYbV2YP1xgSM&vet=12ahUKEwiw3pbIzcCJAxXc2TgGHScSLV8QM3oECGUQAA..i&w=626&h=626&hcb=2&ved=2ahUKEwiw3pbIzcCJAxXc2TgGHScSLV8QM3oECGUQAA",
      "name": "Ninja",
    }, {
      headers: {
        "authorization": `Bearer ${userToken}`
      }
    })
    const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/123`, {
      "imageUrl": "https://www.google.com/imgres?q=avatar%20profile%202d%20game&imgurl=https%3A%2F%2Fimg.freepik.com%2Ffree-vector%2Fcute-ninja-gaming-cartoon-vector-icon-illustration-people-technology-icon-concept-isolated-flat_138676-8079.jpg&imgrefurl=https%3A%2F%2Fwww.freepik.com%2Ffree-photos-vectors%2Fgaming-avatar&docid=RbDuYQJwGjyynM&tbnid=2-HYbV2YP1xgSM&vet=12ahUKEwiw3pbIzcCJAxXc2TgGHScSLV8QM3oECGUQAA..i&w=626&h=626&hcb=2&ved=2ahUKEwiw3pbIzcCJAxXc2TgGHScSLV8QM3oECGUQAA",
      "name": "Ninja",
    }, {
      headers: {
        "authorization": `Bearer ${userToken}`
      }
    })
    expect(elementResponse.statusCode).toBe(403)
    expect(mapResponse.statusCode).toBe(403)
    expect(avatarResponse.statusCode).toBe(403)
    expect(updateElementResponse.statusCode).toBe(403)
  })
  test("Admin able to hit admin endpoints", async () => {
    const elementResponse = await axios.post(`${BACKEND_URL}/api/vi/admin/element`,
      {
        "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        "width": 1,
        "height": 1,
        "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
      },
      {
        Headers: {
          "authorization": `Bearer ${adminToken}`
        }
      })

    const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {

      "thumbnail": "https://thumbnail.com/a.png",
      "dimensions": "100x200",
      "name": "100 person interview room",
      "defaultElements": [{
        elementId: element1Id,
        x: 20,
        y: 20
      }, {
        elementId: element1Id,
        x: 18,
        y: 20
      }, {
        elementId: element2Id,
        x: 19,
        y: 20
      }
      ]
    }, {
      Headers: {
        "authorization": `Bearer ${token}`
      }
    })
    const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
      "imageUrl": "https://www.google.com/imgres?q=avatar%20profile%202d%20game&imgurl=https%3A%2F%2Fimg.freepik.com%2Ffree-vector%2Fcute-ninja-gaming-cartoon-vector-icon-illustration-people-technology-icon-concept-isolated-flat_138676-8079.jpg&imgrefurl=https%3A%2F%2Fwww.freepik.com%2Ffree-photos-vectors%2Fgaming-avatar&docid=RbDuYQJwGjyynM&tbnid=2-HYbV2YP1xgSM&vet=12ahUKEwiw3pbIzcCJAxXc2TgGHScSLV8QM3oECGUQAA..i&w=626&h=626&hcb=2&ved=2ahUKEwiw3pbIzcCJAxXc2TgGHScSLV8QM3oECGUQAA",
      "name": "Ninja",
    }, {
      headers: {
        "authorization": `Bearer ${adminToken}`
      }
    })
    const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/123`, {
      "imageUrl": "https://www.google.com/imgres?q=avatar%20profile%202d%20game&imgurl=https%3A%2F%2Fimg.freepik.com%2Ffree-vector%2Fcute-ninja-gaming-cartoon-vector-icon-illustration-people-technology-icon-concept-isolated-flat_138676-8079.jpg&imgrefurl=https%3A%2F%2Fwww.freepik.com%2Ffree-photos-vectors%2Fgaming-avatar&docid=RbDuYQJwGjyynM&tbnid=2-HYbV2YP1xgSM&vet=12ahUKEwiw3pbIzcCJAxXc2TgGHScSLV8QM3oECGUQAA..i&w=626&h=626&hcb=2&ved=2ahUKEwiw3pbIzcCJAxXc2TgGHScSLV8QM3oECGUQAA",
      "name": "Ninja",
    }, {
      headers: {
        "authorization": `Bearer ${adminToken}`
      }
    })
    expect(elementResponse.statusCode).toBe(403)
    expect(mapResponse.statusCode).toBe(403)
    expect(avatarResponse.statusCode).toBe(403)
  })
  test("Admin can change the imageUrl for a element", async () => {
    const elementResponse = await axios.post(`${BACKEND_URL}/api/vi/admin/element`,
      {
        "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        "width": 1,
        "height": 1,
        "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
      },
      {
        Headers: {
          "authorization": `Bearer ${adminToken}`
        }
      })
    const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/${elementResponse.data.id}`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE"
    },
      {
        Headers: {
          "authorization": `Bearer ${adminToken}`
        }
      })
    expect(updateElementResponse.statusCode).toBe(200)
  })
})

describe("Web Socket Server", () => {
  let adminToken;
  let adminId;
  let userId;
  let userToken;
  let mapId;
  let element1Id;
  let element2Id;
  let spaceId;
  let ws1;
  let ws2;
  let ws1Message = [];
  let ws2Message = [];
  let adminX;
  let adminY;
  let userX;
  let userY;

  async function setUpHTTP() {
    const userName = `Ritam-${Math.random()}`
    const password = "123456"
    const adminSignupResponse = await axios.put(`${BACKEND_URL}/api/vi/signup`, {
      userName,
      password,
      type: "admin"
    })
    adminId = adminSignupResponse.data.userId
    const adminSignipResponse = await axios.put(`${BACKEND_URL}/api/vi/signip`, {
      userName,
      password,
    })
    adminToken = adminSignipResponse.data.token
    const userSignupResponse = await axios.put(`${BACKEND_URL}/api/vi/signup`, {
      userName: userName + "-user",
      password,
      type: "admin"
    })
    userId = adminSignupResponse.data.userId
    const userSignipResponse = await axios.put(`${BACKEND_URL}/api/vi/signip`, {
      userName: userName + "-user",
      password,
    })
    userToken = adminSignipResponse.data.token

    const element1 = await axios.post(`${BACKEND_URL}/api/vi/admin/element`,
      {
        "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        "width": 1,
        "height": 1,
        "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
      },
      {
        Headers: {
          "authorization": `Bearer ${userToken}`
        }
      })
    const element2 = await axios.post(`${BACKEND_URL}/api/vi/admin/element`,
      {
        "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        "width": 1,
        "height": 1,
        "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
      },
      {
        Headers: {
          "authorization": `Bearer ${userToken}`
        }
      })
    element1Id = element1.map.id
    element2Id = element2.map.id

    const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {

      "thumbnail": "https://thumbnail.com/a.png",
      "dimensions": "100x200",
      "name": "100 person interview room",
      "defaultElements": [{
        elementId: element1Id,
        x: 20,
        y: 20
      }, {
        elementId: element1Id,
        x: 18,
        y: 20
      }, {
        elementId: element2Id,
        x: 19,
        y: 20
      }
      ]
    }, {
      Headers: {
        "authorization": `Bearer ${userToken}`
      }
    })
    mapId = map.data.id
    const space = await axios.post(`${BACKEND_URL}/api/v1/space`, {
      "name": "Test",
      "dimensions": "100x200",
      "mapId": mapId
    }, {
      Headers: {
        "authorization": `Bearer ${userToken}`
      }
    })
    spaceId = space.data.spaceId
  }

  async function setUpWeb() {
    ws1 = new WebSocket(WS_URL)
    ws2 = new WebSocket(WS_URL)

    await new Promise(r => {
      ws1.onopen = r
    })


    ws1.onmessage = (event) => {
      ws1Message.push(JSON.parse(event.data))
    }


    await new Promise(r => {
      ws2.onopen = r
    })


    ws2.onmessage = (event) => {
      ws2Message.push(JSON.parse(event.data))
    }
  }

  function waitForAndPopLatestMessage(messageArray) {
    return new Promise((resolve) => {
      messageArray.length > 0
        ? resolve(messageArray.shift())
        : (() => {
          const interval = setInterval(() => {
            messageArray.length > 0 &&
              (clearInterval(interval), resolve(messageArray.shift()));
          }, 100);
        })();
    });
  }

  beforeAll(async () => {
    setUpHTTP()
    setUpWeb()
  })

  test("Get Back acknowledge for joining the space", async () => {
    ws1.send(JSON.stringify({
      "type": "join",
      "payload": {
        "spaceId": spaceId,
        "token": adminToken
      }
    }))

    const message1 = await waitForAndPopLatestMessage(ws1Message)

    ws2.send(JSON.stringify({
      "type": "join",
      "payload": {
        "spaceId": spaceId,
        "token": userToken
      }
    }))

    const message2 = await waitForAndPopLatestMessage(ws2Message)
    const message3 = await waitForAndPopLatestMessage(ws1Message)

    expect(message1.type).toBe("space-joined")
    expect(message2.type).toBe("space-joined")
    
    expect(message1.payload.users.length).toBe(0)
    expect(message2.payload.users.length).toBe(1)
    expect(message3.type).toBe("user-join")

    expect(message3.payload.x).toBe(message2.payload.spawn.x)
    expect(message3.payload.y).toBe(message2.payload.spawn.y)
    expect(message3.payload.userId).toBe(userId)

    adminX = message1.payload.spawn.x
    adminY = message1.payload.spawn.y

    userX = message2.payload.spawn.x
    userY = message2.payload.spawn.y
  })

  test("User must not able to move across the boundary of the wall", async () => {
    ws1.send(JSON.stringify({
      type: "movement",
      "payload": {
        "x": 100000,
        "y": 22894723,
        "userId": adminId
      }
    }))
    const message = await waitForAndPopLatestMessage(ws1Message)
    expect(message.type).toBe("movement-rejected")
    expect(message.payload.x).toBe(adminX)
    expect(message.payload.Y).toBe(adminY)
  })
  test("User must not able to move two blocks at a time", async () => {
    ws1.send(JSON.stringify({
      type: "movement",
      "payload": {
        "x": adminX + 2,
        "y": adminY,
        "userId": adminId
      }
    }))
    const message = await waitForAndPopLatestMessage(ws1Message)
    expect(message.type).toBe("movement-rejected")
    expect(message.payload.x).toBe(adminX)
    expect(message.payload.Y).toBe(adminY)
  })
  test("Correct movement should be broadcasted to the other Sockets in the room", async () => {
    ws1.send(JSON.stringify({
      type: "movement",
      "payload": {
        "x": adminX + 1,
        "y": adminY,
        "userId": adminId
      }
    }))
    const message = await waitForAndPopLatestMessage(ws2Message)
    expect(message.type).toBe("movement-rejected")
    expect(message.payload.x).toBe(adminX+1)
    expect(message.payload.Y).toBe(adminY)
  })
  test("If a suer left the WS-server other user receives a leave event", async () => {
    ws1.close()
    const message = await waitForAndPopLatestMessage(ws2Message)
    expect(message.type).toBe("user-left")
    expect(message.payload.userId).toBe(adminId)
  })
})